import { Response } from 'express';
import admin from 'firebase-admin';
import { AuthRequest } from '../middleware/auth';
import { FeedbackBox } from '../types';

export const createFeedbackBox = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { title, description, allowAnonymous } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    
    const feedbackBoxData: Omit<FeedbackBox, 'id'> = {
      title,
      description,
      createdBy: req.user.id,
      createdAt: Date.now(),
      isActive: true,
      allowAnonymous: allowAnonymous === undefined ? true : allowAnonymous
    };
    
    const feedbackBoxRef = await admin.firestore().collection('feedbackBoxes').add(feedbackBoxData);
    
    res.status(201).json({
      id: feedbackBoxRef.id,
      ...feedbackBoxData
    });
  } catch (error) {
    console.error('Create feedback box error:', error);
    res.status(500).json({ message: 'Failed to create feedback box', error });
  }
};

export const getAllFeedbackBoxes = async (req: AuthRequest, res: Response) => {
  try {
    const feedbackBoxesSnapshot = await admin.firestore().collection('feedbackBoxes').get();
    
    const feedbackBoxes: FeedbackBox[] = [];
    
    feedbackBoxesSnapshot.forEach(doc => {
      feedbackBoxes.push({
        id: doc.id,
        ...doc.data()
      } as FeedbackBox);
    });
    
    res.status(200).json(feedbackBoxes);
  } catch (error) {
    console.error('Get feedback boxes error:', error);
    res.status(500).json({ message: 'Failed to get feedback boxes', error });
  }
};

export const getFeedbackBoxById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const feedbackBoxDoc = await admin.firestore().collection('feedbackBoxes').doc(id).get();
    
    if (!feedbackBoxDoc.exists) {
      return res.status(404).json({ message: 'Feedback box not found' });
    }
    
    res.status(200).json({
      id: feedbackBoxDoc.id,
      ...feedbackBoxDoc.data()
    });
  } catch (error) {
    console.error('Get feedback box error:', error);
    res.status(500).json({ message: 'Failed to get feedback box', error });
  }
};

export const updateFeedbackBox = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { id } = req.params;
    const { title, description, isActive, allowAnonymous } = req.body;
    
    const feedbackBoxRef = admin.firestore().collection('feedbackBoxes').doc(id);
    const feedbackBoxDoc = await feedbackBoxRef.get();
    
    if (!feedbackBoxDoc.exists) {
      return res.status(404).json({ message: 'Feedback box not found' });
    }
    
    const feedbackBoxData = feedbackBoxDoc.data();
    
    // Check if the user is the creator or an admin
    if (feedbackBoxData?.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this feedback box' });
    }
    
    const updateData: Partial<FeedbackBox> = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (allowAnonymous !== undefined) updateData.allowAnonymous = allowAnonymous;
    
    await feedbackBoxRef.update(updateData);
    
    res.status(200).json({
      id,
      ...feedbackBoxData,
      ...updateData
    });
  } catch (error) {
    console.error('Update feedback box error:', error);
    res.status(500).json({ message: 'Failed to update feedback box', error });
  }
};

export const deleteFeedbackBox = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { id } = req.params;
    
    const feedbackBoxRef = admin.firestore().collection('feedbackBoxes').doc(id);
    const feedbackBoxDoc = await feedbackBoxRef.get();
    
    if (!feedbackBoxDoc.exists) {
      return res.status(404).json({ message: 'Feedback box not found' });
    }
    
    const feedbackBoxData = feedbackBoxDoc.data();
    
    // Check if the user is the creator or an admin
    if (feedbackBoxData?.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this feedback box' });
    }
    
    // Delete all feedback associated with this box
    const feedbackSnapshot = await admin.firestore()
      .collection('feedback')
      .where('boxId', '==', id)
      .get();
      
    const batch = admin.firestore().batch();
    
    feedbackSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Delete the feedback box
    batch.delete(feedbackBoxRef);
    
    await batch.commit();
    
    res.status(200).json({ message: 'Feedback box deleted successfully' });
  } catch (error) {
    console.error('Delete feedback box error:', error);
    res.status(500).json({ message: 'Failed to delete feedback box', error });
  }
};