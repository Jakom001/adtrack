import jwt from 'jsonwebtoken';
import Auth from '../models/authModel.js';

const isAuthenticated = (req, res, next) => {
    try{
        const token = req.cookies.token;
       if (token){
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
       }else{
        console.log("Unauthorized access");
       return res.status(401).json({ success:false, Error:  "Unauthorized acces"});
       }
       

        }catch (err){
            console.error("Error in authentication", err);
            res.clearCookie('token');
            res.status(500).json({Error: `Invalid or Expired Token, ${err.message} `});
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

export {isAuthenticated, checkUser};