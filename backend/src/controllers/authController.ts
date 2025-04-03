import { Response } from 'express';
import admin from 'firebase-admin';
import { AuthRequest } from '../middleware/auth';
import { SessionRequest } from '../middleware/session';
import { linkSessionToUser } from '../middleware/session';

// Combine request types
type AuthSessionRequest = AuthRequest & SessionRequest;

export const register = async (req: AuthSessionRequest, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    // Default role if not provided
    const userRole = role && ['faculty', 'admin', 'student'].includes(role) ? role : 'student';

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Store user details in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      name,
      role: userRole,
    });

    res.status(201).json({ 
      id: userRecord.uid,
      email,
      name,
      role: userRole,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Failed to register user', error });
  }
};

export const login = async (req: AuthSessionRequest, res: Response) => {
  try {
    // Note: Firebase Auth token is handled by frontend
    // Here we just verify and create a session
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ message: 'ID token is required' });
    }
    
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Get user data from Firestore
    const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userData = userDoc.data();
    
    // Link the session to the authenticated user
    if (req.session) {
      await linkSessionToUser(req, decodedToken.uid, userData?.role || 'student');
    }
    
    res.status(200).json({
      id: decodedToken.uid,
      email: userData?.email,
      name: userData?.name,
      role: userData?.role
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: 'Authentication failed', error });
  }
};

export const logout = async (req: AuthSessionRequest, res: Response) => {
  try {
    if (req.session) {
      // Update session to be anonymous again
      await req.app.locals.sessionStore.doc(req.session.id).update({
        userId: null,
        role: null,
        isAnonymous: true
      });
      
      req.session.userId = undefined;
      req.session.role = undefined;
      req.session.isAnonymous = true;
    }
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed', error });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userDoc = await admin.firestore().collection('users').doc(req.user.id).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(userDoc.data());
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Failed to fetch user data', error });
  }
};
