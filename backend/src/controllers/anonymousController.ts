import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SessionRequest } from '../middleware/session';

// Generate a temporary anonymous ID
export const getAnonymousToken = async (req: SessionRequest, res: Response) => {
  try {
    if (!req.session) {
      return res.status(400).json({ message: 'No session available' });
    }
    
    // Generate a temporary anonymous token
    const anonymousToken = uuidv4();
    
    // Store token in session for verification
    await req.app.locals.sessionStore.doc(req.session.id).update({
      anonymousToken,
      tokenCreatedAt: Date.now()
    });
    
    res.status(200).json({ anonymousToken });
  } catch (error) {
    console.error('Anonymous token error:', error);
    res.status(500).json({ message: 'Failed to generate anonymous token' });
  }
};