import express from 'express';
import { 
  createFeedbackBox, 
  getAllFeedbackBoxes, 
  getFeedbackBoxById,
  updateFeedbackBox,
  deleteFeedbackBox
} from '../controllers/feedbackBoxController';
import { authMiddleware, isFaculty } from '../middleware/auth';

const router = express.Router();

router.post('/', authMiddleware, isFaculty, createFeedbackBox);
router.get('/', getAllFeedbackBoxes);
router.get('/:id', getFeedbackBoxById);
router.put('/:id', authMiddleware, isFaculty, updateFeedbackBox);
router.delete('/:id', authMiddleware, isFaculty, deleteFeedbackBox);

export default router;