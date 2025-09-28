import express from 'express';
import { verifyToken, requireEducator, optionalAuth } from '../middleware/auth.js';
import { validate, courseSchemas, querySchemas } from '../middleware/validation.js';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addChapterToCourse,
  addLectureToChapter,
  searchCourses,
  getCoursesByEducator,
  getMyEducatorCourses,
  addCourseRating,
  publishCourse,
  unpublishCourse,
  updateChapter,
  deleteChapter,
  updateLecture,
  deleteLecture
} from '../controllers/courseController.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', validate(querySchemas.courseFilters, 'query'), optionalAuth, getAllCourses);
router.get('/search', validate(querySchemas.courseFilters, 'query'), optionalAuth, searchCourses);

// Educator specific routes (must be before /:id route)
router.get('/educator', verifyToken, getMyEducatorCourses);

// Individual course route (keep this after specific routes)
router.get('/:id', optionalAuth, getCourseById);

// Protected routes (authentication required)
router.use(verifyToken);

// Course rating (authenticated users)
router.post('/:id/rating', addCourseRating);

// Educator routes
router.post('/', requireEducator, validate(courseSchemas.create), createCourse);
router.put('/:id', requireEducator, validate(courseSchemas.update), updateCourse);
router.delete('/:id', requireEducator, deleteCourse);

// Chapter and lecture management
router.post('/:id/chapters', requireEducator, validate(courseSchemas.addChapter), addChapterToCourse);
router.post('/:courseId/chapters/:chapterId/lectures', requireEducator, validate(courseSchemas.addLecture), addLectureToChapter);

// Other educator routes
router.get('/educator/:educatorId', getCoursesByEducator);

export default router;