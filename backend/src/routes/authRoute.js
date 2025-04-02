import express from 'express';
import {register, login, logout, changePassword, currentUser, 
    sendVerificationCode, verifyVerificationCode
    , sendForgotPasswordCode, verifyForgotPasswordCode } from '../controllers/authController.js';
import { isAuthenticated, isAdmin } from '../middlewares/authenticateUser.js';
const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.get('/logout', isAuthenticated, logout);

router.get('/currerent-user', currentUser);

router.patch('/send-verification-code', isAuthenticated, sendVerificationCode);
router.patch('/verify-verification-code', isAuthenticated, verifyVerificationCode);
router.patch('/send-forgot-password-code', sendForgotPasswordCode);
router.patch('/verify-forgot-password-code', verifyForgotPasswordCode);
router.patch('/change-password',isAuthenticated, changePassword);

export default router;

// Admin only route
// router.get('/admin', authenticate, checkRole(ROLES.ADMIN), (req, res) => {
//     res.json({ message: 'Admin dashboard content' });
//   });
