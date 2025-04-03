import express from 'express';
import { 
  getAdminDashboardStats, 
  getAllUsers, 
  updateUserRole 
} from '../controllers/adminController';
import { authMiddleware, isAdmin } from '../middleware/auth';

const router = express.Router();

router.get('/dashboard', authMiddleware, isAdmin, getAdminDashboardStats);
router.get('/users', authMiddleware, isAdmin, getAllUsers);
router.put('/users/:userId/role', authMiddleware, isAdmin, updateUserRole);

export default router;