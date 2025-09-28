import express from 'express';
import { verifyToken, requireEducator } from '../middleware/auth.js';
import { validate, userSchemas, querySchemas } from '../middleware/validation.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updatePassword,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  getUserStats,
  getUserEnrollments,
  getUserDashboard,
  switchUserRole,
  updateUserPreferences
} from '../controllers/userController.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', validate(userSchemas.register), registerUser);
router.post('/login', validate(userSchemas.login), loginUser);
router.post('/forgot-password', validate(userSchemas.forgotPassword), forgotPassword);
router.post('/reset-password', validate(userSchemas.resetPassword), resetPassword);

// Protected routes (authentication required)
router.use(verifyToken);

router.post('/logout', logoutUser);
router.get('/me', getCurrentUser);
router.put('/update-password', validate(userSchemas.updatePassword), updatePassword);

// Profile routes
router.get('/profile', getUserProfile);
router.put('/profile', validate(userSchemas.updateProfile), updateUserProfile);

// Dashboard and stats
router.get('/dashboard', verifyToken, getUserDashboard);
router.get('/stats', verifyToken, getUserStats);

// Enrollments
router.get('/enrollments', validate(querySchemas.pagination, 'query'), getUserEnrollments);

// User preferences
router.put('/preferences', updateUserPreferences);

// Role switching
router.post('/switch-role', switchUserRole);

export default router;