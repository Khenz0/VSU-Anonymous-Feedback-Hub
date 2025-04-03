export interface User {
    id: string;
    email: string;
    role: 'faculty' | 'admin' | 'student';
    name: string;
  }

  export interface FeedbackBox {
    id: string;
    title: string;
    description: string;
    createdBy: string; // Faculty ID
    createdAt: number;
    isActive: boolean;
    allowAnonymous: boolean;
  }

  export interface Feedback {
    id: string;
    boxId: string;
    content: string;
    submittedBy: string | null; // User ID or null for anonymous
    submittedAt: number;
    isApproved: boolean;
    isAnonymous: boolean;
    sessionId?: string; // Track session for spam prevention
  }