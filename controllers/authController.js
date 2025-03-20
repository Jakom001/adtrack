import Auth from '../models/authModel.js';
import {registerSchema} from '../middlewares/validator.js';
import {loginSchema} from '../middlewares/validator.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const register = async (req, res) => {
    const {firstName, lastName, phone, email, password, confirmPassword} = req.body

    try{
        const {error, value} = registerSchema.validate({
            firstName, lastName, phone, email, password, confirmPassword
        })
        if(error){
            return res.status(400).json({Error: error.details[0].message})
        }

        const existingUser = await Auth.findOne({email})
        if(existingUser){
            return res.status(400).json({Error: 'Email already exists'})
        }
        // Hash Password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new Auth({
            firstName, lastName, phone, email, password: hashedPassword
        })
        const result = await user.save()
       
        return res.status(201).json({message: 'User registered successfully', data: result})
    }catch (error){
        return res.status(400).json({Error: `Error occured while creating the user, ${error.message}`})
    }
}

const login = async (req, res) => {
    const {email, password} = req.body;

    try{
        const {error, value} = loginSchema.validate({
            email, password
        })
        if(error){
            return res.status(400).json({Error: error.details[0].message})
        }
        
        const user = await Auth.findOne({email})
        if(!user){
            return res.status(400).json({Error: 'User not found'})
        }
        // Compare Password
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({Error: 'Invalid credentials'})
        }

        // jwt
        const token = jwt.sign(
            { userId: user._id, email: user.email},
                process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRATION
            }
        )

        res.cookie('token', token, {
            secure: false, // Use true in production (with HTTPS)
            httpOnly: true,
            maxAge: 24* 60 * 60 * 1000, // 24 hour
            sameSite: 'lax', 
        });
        res.status(200).json({message:"login successfull", user: user.firstName})

    }catch (error){
        return res.status(400).json({Error:`Error occurred during login, ${error.message}`})
    }
}

const logout = (req, res) => {
    res.clearCookie('token')
    res.redirect('/');
    res.status(200).json({message: 'Logged out successfully'})
}
const currentUser = (req, res) => {
    if (res.locals.user) {
        res.json({ user: res.locals.user });
    } else {
        res.json({ user: null });
    }
};

export {register, login, logout, currentUser}