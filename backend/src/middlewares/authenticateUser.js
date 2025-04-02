import jwt from 'jsonwebtoken';
import Auth from '../models/authModel.js';
import dotenv from 'dotenv';
dotenv.config();

const isAuthenticated = (req, res, next) => {
    let token;
    if (req.headers.client === 'not-browser') {
        token = req.headers.authorization;
    } else {
        token = req.cookies['Authorization'];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    }

    try {
        const userToken = token.split(' ')[1];
        const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);
        req.user = jwtVerified;
        next();
    } catch (error) {
        console.log("Token verification failed:", error.message);
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
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

const checkUser = (req, res, next) => {
    const token = req.cookies.Authorization; // Changed from token to Authorization
    
    if (token) {
        const userToken = token.split(' ')[1];
        jwt.verify(userToken, process.env.TOKEN_SECRET, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                next();
            } else {
                let user = await Auth.findById(decodedToken.userId).select("-password");
                res.locals.user = user;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
}



export {isAuthenticated, checkUser, checkRole, isAdmin};