import jwt from 'jsonwebtoken';
import Auth from '../models/authModel.js';
import dotenv from 'dotenv';
dotenv.config();

const isAuthenticated = (req, res, next) => {
    let token;
    
    // First check if token is in cookies (browser clients)
    if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    } 
    // Then check Authorization header (non-browser clients)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log("Token verification failed:", error.message);
        
        // Check if this is a token expiration error and we have a refresh token
        if (error.name === 'TokenExpiredError' && req.cookies && req.cookies.refreshToken) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired', 
                code: 'TOKEN_EXPIRED' 
            });
        }
        
        // For any other error, clear the auth cookies
        if (req.cookies) {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            res.clearCookie('isLoggedIn');
        }
        
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
};

// Other middleware functions remain the same
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "You need to be logged in to access this route" });
    }
    
    Auth.findById(req.user.userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            
            if (user.role !== 'admin') {
                return res.status(403).json({ error: "Access denied: Admin rights required" });
            }
            
            next();
        })
        .catch(err => {
            console.error("Error checking admin status:", err);
            return res.status(500).json({ error: "Server error while checking permissions" });
        });
};

const checkRole = (...roles) => {
    return (req, res, next) => {
        if(!req.user){
            return res.status(401).json({error: "You need to be logged in to access this route"});
        }
        if (!roles.includes(req.user.role)){
            return res.status(403).json({error: "You are not authorized to access this route"});
        }
        next();
    };
};

const isVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "You need to be logged in to access this route" });
    }
    
    if (!req.user.verified) {
        return res.status(403).json({ error: "Your account is not verified. Please verify your email to access this feature." });
    }
    
    next();
};

export {isAuthenticated, checkRole, isAdmin, isVerified};