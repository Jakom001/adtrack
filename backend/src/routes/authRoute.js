import express from 'express';
import {register, login, logout, changePassword, getCurrentUser,
    sendVerificationCode, verifyVerificationCode
    , sendForgotPasswordCode, verifyForgotPasswordCode } from '../controllers/authController.js';
import { isAuthenticated, isAdmin } from '../middlewares/authenticateUser.js';
import rateLimit from 'express-rate-limit';
const router = express.Router();


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs for auth routes
  message: { success: false, message: 'Too many attempts, please try again later' }
});

// Apply rate limit to auth routes
router.post('/register', authLimiter, register);

router.post('/login',  login);
router.post('/logout', isAuthenticated, logout);

router.get('/current-user', isAuthenticated, getCurrentUser);
router.patch('/send-verification-code', sendVerificationCode);
router.patch('/verify-verification-code', verifyVerificationCode);
router.patch('/send-forgot-password-code',sendForgotPasswordCode);
router.patch('/verify-forgot-password-code', verifyForgotPasswordCode);
router.patch('/change-password',isAuthenticated, changePassword);

export default router;

// Admin only route
// router.get('/admin', authenticate, checkRole(ROLES.ADMIN), (req, res) => {
//     res.json({ message: 'Admin dashboard content' });
//   });

