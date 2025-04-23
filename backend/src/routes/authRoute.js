import express from 'express';
import {register, login, logout, changePassword, getCurrentUser, refreshAccessToken,
    sendVerificationCode, verifyVerificationCode
    , sendForgotPasswordCode, verifyForgotPasswordCode } from '../controllers/authController.js';
import { isAuthenticated, isAdmin } from '../middlewares/authenticateUser.js';
import rateLimit from 'express-rate-limit';
const router = express.Router();
import csrf from 'csurf';

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 requests per windowMs for auth routes
  message: { success: false, message: 'Too many attempts, please try again later' }
});
const csrfProtection = csrf({ cookie: true });

// Apply rate limit to auth routes
// Routes without CSRF (login, registration don't need CSRF initially)
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshAccessToken);
router.get('/current-user', isAuthenticated,   getCurrentUser);

// Routes with CSRF protection (all state-changing operations after login)
router.post('/logout', isAuthenticated, csrfProtection, logout);
router.patch('/send-verification-code',  csrfProtection,  sendVerificationCode);
router.patch('/verify-verification-code', authLimiter, csrfProtection,  verifyVerificationCode);
router.patch('/send-forgot-password-code',  sendForgotPasswordCode);
router.patch('/verify-forgot-password-code', authLimiter, csrfProtection,  verifyForgotPasswordCode);
router.patch('/change-password', authLimiter, csrfProtection,  isAuthenticated, changePassword);

export default router;

// Admin only route
// router.get('/admin', authenticate, checkRole(ROLES.ADMIN), (req, res) => {
//     res.json({ message: 'Admin dashboard content' });
//   });

