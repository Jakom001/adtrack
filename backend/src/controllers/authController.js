import Auth from '../models/authModel.js';
import {registerSchema, acceptCodeSchema, loginSchema, changePasswordSchema, acceptFPSchema} from '../middlewares/validator.js';
import jwt from 'jsonwebtoken';
import transport from '../middlewares/sendMail.js';
import { doHash, doHashValidation, hmacProcess } from '../utils/hashing.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const register = async (req, res) => {
    const {firstName, lastName, phone, email, password, confirmPassword} = req.body

    try{
        const {error, value} = registerSchema.validate({
            firstName, lastName, phone, email, password, confirmPassword
        })
        if(error){
            return res.status(400).json({error: error.details[0].message})
        }

        const existingUser = await Auth.findOne({email})
        if(existingUser){
            return res.status(400).json({error: 'Email already exists'})
        }
        // Hash Password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await doHash(password, salt);

        const user = new Auth({
            firstName, lastName, phone, email, password: hashedPassword
        })
        const result = await user.save()
       
        return res.status(201).json({success: true, message: 'User registered successfully', data: result})
    }catch (error) {
        console.error("Registration error:", error);
        // Differentiate between different types of errors
        if (error.name === 'ValidationError') {
          return res.status(400).json({ error: error.message });
        } else if (error.code === 11000) { // MongoDB duplicate key error
          return res.status(409).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Server error occurred during registration' });
      }
}

const login = async (req, res) => {
    const {email, password} = req.body;

    try{
        const {error, value} = loginSchema.validate({
            email, password
        })
        if(error){
            return res.status(400).json({error: error.details[0].message})
        }
        
        const existingUser = await Auth.findOne({email}).select('+password')
        if(!existingUser){
            return res.status(400).json({error: 'Invalid credentials'})
        }
        // Compare Password
        const isMatch = await doHashValidation(password, existingUser.password)
        if(!isMatch){
            return res.status(400).json({error: 'Invalid credentials'})
        }

        // jwt
        // JWT signing with better options
        const token = jwt.sign(
            {
            userId: existingUser._id,
            email: existingUser.email,
            verified: existingUser.verified,
            role: existingUser.role, // Include role for authorization
            },
            process.env.TOKEN_SECRET,
            {
            expiresIn: '8h',
            // issuer: 'your-app-name',
            // audience: 'your-app-users',
            }
        );

		// More secure cookie settings
        res.cookie('Authorization', 'Bearer ' + token, {
            expires: new Date(Date.now() + 8 * 3600000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        })
        .json({
            success: true,
            token,
            message: 'logged in successfully',
        });

    }catch (error) {
        console.error("Login error:", error);
        // Differentiate between different types of errors
        if (error.name === 'ValidationError') {
          return res.status(400).json({ error: error.message });
        } else if (error.code === 11000) { // MongoDB duplicate key error
          return res.status(409).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Server error occurred during login' });
    }
}

const logout = (req, res) => {
    try {
      res.clearCookie('Authorization', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        // domain: process.env.COOKIE_DOMAIN,
      });
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ success: false, error: 'Error during logout' });
    }
  }

// Add this to authController.js
const getCurrentUser = async (req, res) => {
    const { userId } = req.user;
    
    try {
        const user = await Auth.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // Don't return sensitive information
        const userData = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            verified: user.verified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        
        res.status(200).json({ user: userData });
    } catch (error) {
        console.error("Get current user error:", error);
        res.status(500).json({ error: "Error occurred while getting current user" });
    }
};

const sendVerificationCode =async (req, res) => {
    const { email } = req.body;
    if (email.trim() === "") {
        return res.status(400).json({ error: "Email is required" });
    }
    try{
        const existingUser = await Auth.findOne({email});
        if(!existingUser){
            return res.status(404).json({ error: "User not found" });
        }
        if(existingUser.verified){
            return res.status(400).json({ error: "User is already verified" });
        }


        // Generate a random verification code
        const codeValue = Math.floor(100000 + Math.random() * 900000).toString();

        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL,
            to: existingUser.email,
            subject: "Verification Code",
            html: `Your verification code is: <h1>${codeValue} </h1>`
        });

        if(info.accepted[0] === existingUser.email){
            const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
            existingUser.verificationCode = hashedCodeValue;
            existingUser.verificationCodeValidation = Date.now();
            await existingUser.save();
            return res.json({ message: "Verification code sent to your email" });
        }
        return res.status(500).json({ error: "Error sending email" });

        
    }catch(err){
        console.error("Send Verification code error",err);
        res.status(500).json({ error: "Error occured sending verification code" });
    }
}

const verifyVerificationCode = async (req, res) => {
    const { email, providedCode } = req.body;
    try{
        const {error, value} = acceptCodeSchema.validate({
            email, providedCode})
        if(error){
            return res.status(400).json({error: error.details[0].message})
        }
        const codeValue = providedCode.toString();
        const existingUser = await Auth.findOne({ email }).select('+verificationCode +verificationCodeValidation');
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }
        if(existingUser.verified){
            return res.status(400).json({ error: "User is already verified" });
        }
        if(!existingUser.verificationCode || !existingUser.verificationCodeValidation){
            return res.status(400).json({ error: "No verification code found" });
        }

        if(Date.now() - existingUser.verificationCodeValidation > 10* 60 * 1000){
            return res.status(400).json({ error: "Verification code has expired" });
        }
        const hashedProvidedCode = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
        if(hashedProvidedCode === existingUser.verificationCode){
            existingUser.verified = true;
            existingUser.verificationCode = undefined;
            existingUser.verificationCodeValidation = undefined;
            await existingUser.save();
            return res.status(200).json({ message: "User verified successfully" });
        }
        return res.status(400).json({ error: "Invalid verification code" });

    }catch (error){
        console.error("Verify Verification code error", error);
        res.status(500).json({ error: "Error occured while verifying verification code" });
    }
}
const sendForgotPasswordCode =async (req, res) => {
    const { email } = req.body;
    if (email.trim() === "") {
        return res.status(400).json({ error: "Email is required" });
    }
    try{
        const existingUser = await Auth.findOne({email});
        if(!existingUser){
            return res.status(404).json({ error: "User not found" });
        }
        
        // Generate a random verification code
        const codeValue = Math.floor(100000 + Math.random() * 900000).toString();

        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL,
            to: existingUser.email,
            subject: "Forgot Password Code",
            html: `Your forgot pasword code is: <h1>${codeValue} </h1>`
        });

        if(info.accepted[0] === existingUser.email){
            const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
            existingUser.forgotPasswordCode = hashedCodeValue;
            existingUser.forgotPasswordCodeValidation = Date.now();
            await existingUser.save();
            return res.json({ message: "Forgot password code sent to your email" });
        }
        return res.status(500).json({ error: "Error sending email" });

        
    }catch(err){
        console.error("Send Forgot Password code error",err);
        res.status(500).json({ error: "Error occured sending forgot password code" });
    }
}

const verifyForgotPasswordCode = async (req, res) => {
    const { email, providedCode, newPassword, confirmPassword} = req.body;
    try{
        const {error, value} = acceptFPSchema.validate({
            email, providedCode, newPassword, confirmPassword})
        if(error){
            return res.status(400).json({error: error.details[0].message})
        }
        const codeValue = providedCode.toString();
        const existingUser = await Auth.findOne({ email }).select('+forgotPasswordCode +forgotPasswordCodeValidation');
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }
       
        if(!existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeValidation){
            return res.status(400).json({ error: "Something went wrong" });
        }

        if(Date.now() - existingUser.forgotPasswordCodeValidation > 10* 60 * 1000){
            return res.status(400).json({ error: "ForgotPassword code has expired" });
        }
        const hashedProvidedCode = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
        
        if(hashedProvidedCode === existingUser.forgotPasswordCode){
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await doHash(newPassword, salt);
            existingUser.password = hashedPassword;
            existingUser.verified = true;
            existingUser.forgotPasswordCode = undefined;
            existingUser.forgotPasswordCodeValidation = undefined;
            await existingUser.save();
            return res.status(200).json({ message: "Password Changed successfully" });
        }
        return res.status(400).json({ error: "Invalid verification code" });

    }catch (error){
        console.error("Verify Forgot Password code error", error);
        res.status(500).json({ error: "Error occured while verifying forgot password code" });
    }
}


const changePassword = async (req, res) => {
    const { userId, verified } = req.user;
    const { oldPassword, newPassword, confirmPassword } = req.body;
    try {
        const { error, value } = changePasswordSchema.validate({
            oldPassword, newPassword, confirmPassword});
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        if (!verified) {
            return res.status(400).json({ error: "User not verified" });
        }

        const existingUser = await Auth.findById({ _id: userId }).select('+password');
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // Compare Password
        const isMatch = await doHashValidation(oldPassword, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        // Hash Password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await doHash(newPassword, salt);
        existingUser.password = hashedPassword;
        await existingUser.save();
        res.json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Change Password error", error);
        res.status(500).json({ error: "Error occured while changing password" });
    }
}


const allUsers = async (req, res) => {
    try{
        const users = await Auth.find({});
        res.json({users})       
    }
    catch(error){
        console.error("Get all users error", error);
        res.status(500).json({ error: "Error occured while getting all users" });
    }
}

const updateUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await Auth.findByIdAndUpdate(id, {firstName, lastName, phone, email, password, confirmPassword}
            , { new: true });
            if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "User updated successfully", data: user });
    } catch (error) {
        console.error("Update user error", error);
        res.status(500).json({ error: "Error occured while updating user" });
    }
}

const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await Auth.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ data: user });
    } catch (error) {
        console.error("Get user by id error", error);
        res.status(500).json({ error: "Error occured while getting user by id" });
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await Auth.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete user error", error);
        res.status(500).json({ error: "Error occured while deleting user" });
    }
}

export {register, login, logout, sendVerificationCode, 
    verifyVerificationCode, changePassword, getCurrentUser,
    sendForgotPasswordCode, verifyForgotPasswordCode,}