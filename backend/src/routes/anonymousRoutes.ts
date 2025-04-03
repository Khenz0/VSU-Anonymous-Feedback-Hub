// src/routes/anonymousRoutes.ts
import express from 'express';
import { getAnonymousToken } from '../controllers/anonymousController';
import { sessionMiddleware } from '../middleware/session';

const router = express.Router();

router.get('/token', sessionMiddleware, getAnonymousToken);

export default router;