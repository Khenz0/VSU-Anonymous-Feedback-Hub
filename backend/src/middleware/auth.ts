import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

export interface AuthRequest extends Request {
    user?: {
      id: string;
      email: string;
      role: string;
    };
  }
  
  export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized - No token provided' });
      }
      
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      if (!decodedToken) {
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
      }
      
      // Get user from Firestore to check role
      const userRef = await admin.firestore().collection('users').doc(decodedToken.uid).get();
      
      if (!userRef.exists) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      const userData = userRef.data();
      
      req.user = {
        id: decodedToken.uid,
        email: decodedToken.email || '',
        role: userData?.role || 'student'
      };
      
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ message: 'Authentication failed' });
    }
  };
  
  // Role-based middleware
  export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  };
  
  export const isFaculty = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'faculty' && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Faculty only.' });
    }
    next();
  };