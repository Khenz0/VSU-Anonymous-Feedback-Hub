import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import cookieParser from "cookie-parser";

// Import routes and middleware
import { sessionMiddleware } from './middleware/session';
import authRoutes from './routes/authRoutes';
import feedbackBoxRoutes from './routes/feedbackBoxRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
// Setup session middleware globally
app.use(sessionMiddleware);

const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin SDK using environment variables
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // Fixes multi-line env issue
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

// Make session store available throughout the app
app.locals.sessionStore = admin.firestore().collection('sessions');

console.log("Firebase Admin SDK initialized!");

// -------------------------------------------------------------

app.use('/api/auth', authRoutes);
app.use('/api/feedback-boxes', feedbackBoxRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

app.get("/", (req, res) => {
  res.send("Anonymous Feedback System API is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});