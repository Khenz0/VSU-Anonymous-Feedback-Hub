import express from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { sessionMiddleware } from '../middleware/session';

const router = express.Router();

router.post('/register', register);
router.post('/login', sessionMiddleware, login);
router.post('/logout', sessionMiddleware, logout);
router.get('/me', authMiddleware, getCurrentUser);

export default router;