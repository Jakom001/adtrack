import express from 'express';
import {register, login, logout, currentUser, sendVerificationCode} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.get('/logout', logout);

router.get('/currerent-user', currentUser);

router.patch('/send-verification-code', sendVerificationCode);

export default router;