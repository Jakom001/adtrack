import jwt from 'jsonwebtoken';
import Auth from '../models/authModel.js';
import dotenv from 'dotenv';
dotenv.config();

const isAuthenticated = (req, res, next) => {
    let token;
    
    // Check Authorization header first
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization;
    } 
    // Then check for cookie
    else if (req.cookies && req.cookies['Authorization']) {
        token = req.cookies['Authorization'];
    }
    // Client header check (your existing code)
    else if (req.headers.client === 'not-browser') {
        token = req.headers.authorization;
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    try {
        // Extract the token part (remove 'Bearer ' if present)
        const userToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
        const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);
        req.user = jwtVerified;
        next();
    } catch (error) {
        console.log("Token verification failed:", error.message);
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
};
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

const checkRole = (...roles) =>{
	return (req, res, next) => {
		if(!req.user){
			return res.status(401).json({er: "You need to be logged in to access this route"});
		}
		if (!roles.includes(req.user.role)){
			return res.status(403).json({error: "You are not authorized to access this route"});
		}
		next();
	}
}

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