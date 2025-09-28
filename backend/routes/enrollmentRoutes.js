import express from 'express';
import {
  enrollInCourse,
  getEnrollmentStatus,
  updateWatchProgress,
  markLectureComplete,
  addNote,
  updateNote,
  deleteNote,
  getNotes,
  addBookmark,
  deleteBookmark,
  getBookmarks,
  getEnrollmentProgress,
  unenrollFromCourse,
  getWatchHistory,
  updateWatchHistory,
  getCertificate,
  generateCertificate
} from '../controllers/enrollmentController.js';
import { verifyToken, requireEducator } from '../middleware/auth.js';
import { validate, enrollmentSchemas, querySchemas } from '../middleware/validation.js';
import { defaultLimiter, strictLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Course enrollment
router.post('/enroll',
  strictLimiter,
  validate(enrollmentSchemas.enroll),
  asyncHandler(enrollInCourse)
);

router.post('/unenroll/:courseId',
  strictLimiter,
  asyncHandler(unenrollFromCourse)
);

router.get('/status/:courseId',
  defaultLimiter,
  asyncHandler(getEnrollmentStatus)
);

router.get('/progress/:courseId',
  defaultLimiter,
  asyncHandler(getEnrollmentProgress)
);

// Watch progress tracking
router.post('/progress',
  defaultLimiter,
  validate(enrollmentSchemas.updateProgress),
  asyncHandler(updateWatchProgress)
);

router.post('/complete-lecture',
  defaultLimiter,
  validate(enrollmentSchemas.updateProgress),
  asyncHandler(markLectureComplete)
);

router.get('/watch-history/:courseId',
  defaultLimiter,
  validate(querySchemas.pagination, 'query'),
  asyncHandler(getWatchHistory)
);

router.post('/watch-history',
  defaultLimiter,
  asyncHandler(updateWatchHistory)
);

// Notes management
router.get('/notes/:courseId',
  defaultLimiter,
  validate(querySchemas.pagination, 'query'),
  asyncHandler(getNotes)
);

router.post('/notes',
  defaultLimiter,
  validate(enrollmentSchemas.addNote),
  asyncHandler(addNote)
);

router.put('/notes/:noteId',
  defaultLimiter,
  validate(enrollmentSchemas.addNote),
  asyncHandler(updateNote)
);

router.delete('/notes/:noteId',
  defaultLimiter,
  asyncHandler(deleteNote)
);

// Bookmarks management
router.get('/bookmarks/:courseId',
  defaultLimiter,
  validate(querySchemas.pagination, 'query'),
  asyncHandler(getBookmarks)
);

router.post('/bookmarks',
  defaultLimiter,
  asyncHandler(addBookmark)
);

router.delete('/bookmarks/:bookmarkId',
  defaultLimiter,
  asyncHandler(deleteBookmark)
);

// Certificate management
router.get('/certificate/:courseId',
  defaultLimiter,
  asyncHandler(getCertificate)
);

router.post('/certificate/:courseId/generate',
  strictLimiter,
  asyncHandler(generateCertificate)
);

export default router;