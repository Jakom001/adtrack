import express from 'express';
import {register, login, logout, changePassword, currentUser, 
    sendVerificationCode, verifyVerificationCode
    , sendForgotPasswordCode, verifyForgotPasswordCode } from '../controllers/authController.js';
import { isAuthenticated, isAdmin } from '../middlewares/authenticateUser.js';
import rateLimit from 'express-rate-limit';
import csrf from 'csurf';
const router = express.Router();
const csrfProtection = csrf({ cookie: true });

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs for auth routes
  message: { success: false, message: 'Too many attempts, please try again later' }
});

// Apply rate limit to auth routes
router.post('/register', authLimiter, register);

router.post('/login', authLimiter, login);

router.get('/logout',csrfProtection, isAuthenticated, logout);

router.get('/currerent-user', currentUser);

router.patch('/send-verification-code', csrfProtection, sendVerificationCode);
router.patch('/verify-verification-code', csrfProtection, verifyVerificationCode);
router.patch('/send-forgot-password-code',csrfProtection, sendForgotPasswordCode);
router.patch('/verify-forgot-password-code', csrfProtection, verifyForgotPasswordCode);
router.patch('/change-password',isAuthenticated, csrfProtection, changePassword);

export default router;

// Admin only route
// router.get('/admin', authenticate, checkRole(ROLES.ADMIN), (req, res) => {
//     res.json({ message: 'Admin dashboard content' });
//   });

