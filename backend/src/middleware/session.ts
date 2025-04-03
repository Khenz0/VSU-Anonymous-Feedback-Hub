import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import admin from 'firebase-admin';

export interface SessionRequest extends Request {
  session?: {
    id: string;
    createdAt: number;
    lastAccessed: number;
    isAnonymous: boolean;
    userId?: string;
    role?: string;
  };
}

// Create a session store in Firestore
const sessionStore = admin.firestore().collection('sessions');

// Session middleware for both authenticated and anonymous users
export const sessionMiddleware = async (
  req: SessionRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Check for session ID in cookies
    const sessionId = req.cookies?.sessionId || '';
    
    // If there's a session ID, try to fetch the session
    if (sessionId) {
      const sessionDoc = await sessionStore.doc(sessionId).get();
      
      if (sessionDoc.exists) {
        const sessionData = sessionDoc.data();
        
        // Update last accessed time
        await sessionDoc.ref.update({
          lastAccessed: Date.now()
        });
        
        req.session = {
          id: sessionId,
          createdAt: sessionData?.createdAt,
          lastAccessed: Date.now(),
          isAnonymous: sessionData?.isAnonymous || false,
          userId: sessionData?.userId,
          role: sessionData?.role
        };
        
        return next();
      }
    }
    
    // If no valid session found, create a new anonymous session
    const newSessionId = uuidv4();
    
    const sessionData = {
      id: newSessionId,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      isAnonymous: true,
    };
    
    await sessionStore.doc(newSessionId).set(sessionData);
    
    // Set session cookie
    res.cookie('sessionId', newSessionId, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    req.session = sessionData;
    
    next();
  } catch (error) {
    console.error('Session middleware error:', error);
    res.status(500).json({ message: 'Session error' });
  }
};

// Link session to authenticated user
export const linkSessionToUser = async (
  req: SessionRequest,
  userId: string,
  role: string
) => {
  if (!req.session) return;
  
  const sessionId = req.session.id;
  
  await sessionStore.doc(sessionId).update({
    userId,
    role,
    isAnonymous: false
  });
  
  req.session.userId = userId;
  req.session.role = role;
  req.session.isAnonymous = false;
};