import { Response } from 'express';
import admin from 'firebase-admin';
import { AuthRequest } from '../middleware/auth';

export const getAdminDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access only' });
    }
    
    // Get user counts by role
    const usersSnapshot = await admin.firestore().collection('users').get();
    
    let facultyCount = 0;
    let studentCount = 0;
    let adminCount = 0;
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.role === 'faculty') facultyCount++;
      else if (userData.role === 'student') studentCount++;
      else if (userData.role === 'admin') adminCount++;
    });
    
    // Get feedback box count
    const feedbackBoxCount = (await admin.firestore().collection('feedbackBoxes').count().get()).data().count;
    
    // Get feedback stats
    const feedbackSnapshot = await admin.firestore().collection('feedback').get();
    
    let totalFeedback = 0;
    let approvedFeedback = 0;
    let pendingFeedback = 0;
    let anonymousFeedback = 0;
    
    feedbackSnapshot.forEach(doc => {
      const feedbackData = doc.data();
      totalFeedback++;
      
      if (feedbackData.isApproved) approvedFeedback++;
      else pendingFeedback++;
      
      if (feedbackData.isAnonymous) anonymousFeedback++;
    });
    
    res.status(200).json({
      users: {
        total: facultyCount + studentCount + adminCount,
        faculty: facultyCount,
        students: studentCount,
        admins: adminCount
      },
      feedbackBoxes: {
        total: feedbackBoxCount
      },
      feedback: {
        total: totalFeedback,
        approved: approvedFeedback,
        pending: pendingFeedback,
        anonymous: anonymousFeedback
      }
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to get admin dashboard stats', error });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access only' });
    }
    
    const usersSnapshot = await admin.firestore().collection('users').get();
    
    const users: Array<{ id: string; role?: string }> = [];
    
    usersSnapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to get users', error });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access only' });
    }
    
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!['faculty', 'admin', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Check if user exists
    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await userRef.update({ role });
    
    res.status(200).json({ message: `User role updated to ${role}` });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Failed to update user role', error });
  }
};