import { Response } from 'express';
import admin from 'firebase-admin';
import { AuthRequest } from '../middleware/auth';
import { SessionRequest } from '../middleware/session';
import { Feedback } from '../types';

// Update the type to handle both authenticated and session requests
type FeedbackRequest = AuthRequest & SessionRequest;

export const submitFeedback = async (req: FeedbackRequest, res: Response) => {
  try {
    const { boxId, content, isAnonymous } = req.body;
    
    if (!boxId || !content) {
      return res.status(400).json({ message: 'Box ID and content are required' });
    }
    
    // Check if feedback box exists and is active
    const feedbackBoxDoc = await admin.firestore().collection('feedbackBoxes').doc(boxId).get();
    
    if (!feedbackBoxDoc.exists) {
      return res.status(404).json({ message: 'Feedback box not found' });
    }
    
    const feedbackBoxData = feedbackBoxDoc.data();
    
    if (!feedbackBoxData?.isActive) {
      return res.status(400).json({ message: 'Feedback box is not active' });
    }
    
    // Check if anonymous feedback is allowed
    if (isAnonymous && !feedbackBoxData.allowAnonymous) {
      return res.status(400).json({ message: 'Anonymous feedback is not allowed for this box' });
    }
    
    let submittedBy = null;
    
    // If not anonymous, try to get the authenticated user ID
    if (!isAnonymous && req.user?.id) {
      submittedBy = req.user.id;
    } 
    // For anonymous submission, we still track the session ID but don't link to user
    else if (isAnonymous) {
      // We only need session tracking for anonymity while preventing spam
      // Nothing to do here since we're using session tracking
    }
    // If no user is authenticated and not anonymous, use session tracking
    else if (req.session?.id) {
      // Generate an anonymous identifier from the session
      submittedBy = `session:${req.session.id}`;
    }
    
    const feedbackData: Omit<Feedback, 'id'> = {
      boxId,
      content,
      submittedBy,
      submittedAt: Date.now(),
      isApproved: false, // Requires admin approval
      isAnonymous: !!isAnonymous,
      // Store session ID for tracking (prevents spam)
      sessionId: req.session?.id
    };
    
    const feedbackRef = await admin.firestore().collection('feedback').add(feedbackData);
    
    res.status(201).json({
      id: feedbackRef.id,
      ...feedbackData
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Failed to submit feedback', error });
  }
};