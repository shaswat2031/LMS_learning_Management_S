import express from 'express';
import {
  uploadCourseImage,
  uploadLectureVideo,
  uploadProfileImage,
  uploadMultipleFiles,
  deleteFile,
  getUploadSignature,
  processVideoUpload
} from '../controllers/uploadController.js';
import { verifyToken, requireEducator } from '../middleware/auth.js';
import { 
  uploadCourseImage as uploadCourseImg,
  uploadVideo,
  uploadProfileImage as uploadProfileImg,
  uploadMultipleFiles as uploadMultiple
} from '../middleware/upload.js';
import { uploadLimiter, strictLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get upload signature for direct client uploads
router.post('/signature',
  strictLimiter,
  asyncHandler(getUploadSignature)
);

// Course image upload
router.post('/course-image',
  requireEducator,
  uploadLimiter,
  uploadCourseImg,
  asyncHandler(uploadCourseImage)
);

// Lecture video upload
router.post('/lecture-video',
  requireEducator,
  uploadLimiter,
  uploadVideo,
  asyncHandler(uploadLectureVideo)
);

// Process video upload (for chunked/large video uploads)
router.post('/process-video',
  requireEducator,
  uploadLimiter,
  asyncHandler(processVideoUpload)
);

// Profile image upload
router.post('/profile-image',
  uploadLimiter,
  uploadProfileImg,
  asyncHandler(uploadProfileImage)
);

// Multiple files upload
router.post('/multiple',
  requireEducator,
  uploadLimiter,
  uploadMultiple,
  asyncHandler(uploadMultipleFiles)
);

// Delete file
router.delete('/:publicId',
  strictLimiter,
  asyncHandler(deleteFile)
);

export default router;