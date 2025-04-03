import express from 'express';
import { 
  submitFeedback, 
  getFeedbackByBoxId, 
  approveFeedback, 
  deleteFeedback 
} from '../controllers/feedbackController';
import { authMiddleware, isAdmin } from '../middleware/auth';

const router = express.Router();

// Anyone can submit feedback (authenticated or not)
router.post('/', submitFeedback);

// Only faculty who created the box or admins can view feedback
router.get('/box/:boxId', authMiddleware, getFeedbackByBoxId);

// Only admins can approve or delete feedback
router.put('/:id/approve', authMiddleware, isAdmin, approveFeedback);
router.delete('/:id', authMiddleware, isAdmin, deleteFeedback);

export default router;