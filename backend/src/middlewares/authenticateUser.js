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
		return res.status(403).json({ success: false, message: 'Unauthorized' });
	}

	try {
		const userToken = token.split(' ')[1];
		const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);
		if (jwtVerified) {
			req.user = jwtVerified;
			next();
		} else {
			throw new Error('error in the token');
		}
	} catch (error) {
		console.log(error);
	}
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
    const token = req.cookies.token;

    if (token){
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                res.locals.user = null;
                next();
            } else {
                let user = await Auth.findById(decodedToken.userId).select("-password");
                
                res.locals.user = user;
                next();
            }
        });
    }else{
        res.locals.user = null;
        next();
    }

}



export {isAuthenticated, checkUser, checkRole};