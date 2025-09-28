import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import WatchHistory from '../models/WatchHistory.js';

// Enroll in course
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId, enrollmentType } = req.body;
    const userId = req.user._id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    if (course.status !== 'published') {
      return res.status(400).json({
        status: 'error',
        message: 'Course is not available for enrollment'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
    if (existingEnrollment) {
      return res.status(400).json({
        status: 'error',
        message: 'Already enrolled in this course',
        data: { enrollment: existingEnrollment }
      });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      userId,
      courseId,
      enrollmentType,
      paymentStatus: enrollmentType === 'free' ? 'completed' : 'pending',
      ...(enrollmentType === 'free' && {
        paymentDetails: {
          amount: 0,
          currency: 'USD',
          paidAt: new Date()
        }
      })
    });

    await enrollment.save();

    // Add to course enrolled students
    await course.enrollStudent(userId);

    // Add to user enrolled courses
    await req.user.enrollInCourse(courseId);

    await enrollment.populate('courseId', 'title thumbnail category level');

    res.status(201).json({
      status: 'success',
      message: 'Successfully enrolled in course',
      data: { enrollment }
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to enroll in course'
    });
  }
};

// Get enrollment status
export const getEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({ userId, courseId })
      .populate('courseId', 'title thumbnail stats');

    if (!enrollment) {
      return res.status(404).json({
        status: 'error',
        message: 'Not enrolled in this course',
        data: { isEnrolled: false }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        isEnrolled: true,
        enrollment
      }
    });
  } catch (error) {
    console.error('Error checking enrollment status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check enrollment status'
    });
  }
};

// Update watch progress
export const updateWatchProgress = async (req, res) => {
  try {
    const { courseId, chapterId, lectureId, timestamp, watchTime } = req.body;
    const userId = req.user._id;

    // Find enrollment
    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(404).json({
        status: 'error',
        message: 'Not enrolled in this course'
      });
    }

    // Update last watched position
    await enrollment.updateLastWatched(chapterId, lectureId, timestamp);

    // Find or create watch history record
    let watchHistory = await WatchHistory.findOne({
      userId,
      courseId,
      chapterId,
      lectureId
    });

    if (!watchHistory) {
      watchHistory = new WatchHistory({
        userId,
        courseId,
        chapterId,
        lectureId
      });
    }

    // Update watch position
    await watchHistory.updateWatchPosition(timestamp);

    res.status(200).json({
      status: 'success',
      message: 'Watch progress updated',
      data: {
        lastWatched: enrollment.progress.lastWatched,
        watchPosition: watchHistory.lastWatchPosition
      }
    });
  } catch (error) {
    console.error('Error updating watch progress:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update watch progress'
    });
  }
};

// Mark lecture as complete
export const markLectureComplete = async (req, res) => {
  try {
    const { courseId, chapterId, lectureId, watchTime } = req.body;
    const userId = req.user._id;

    // Find enrollment
    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(404).json({
        status: 'error',
        message: 'Not enrolled in this course'
      });
    }

    // Mark lecture as complete
    await enrollment.markLectureComplete(chapterId, lectureId, watchTime);

    // Update watch history
    let watchHistory = await WatchHistory.findOne({
      userId,
      courseId,
      chapterId,
      lectureId
    });

    if (watchHistory) {
      watchHistory.isCompleted = true;
      watchHistory.completedAt = new Date();
      await watchHistory.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Lecture marked as complete',
      data: {
        progress: enrollment.progress.percentage,
        completedLectures: enrollment.progress.completedLectures.length,
        status: enrollment.status
      }
    });
  } catch (error) {
    console.error('Error marking lecture complete:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark lecture as complete'
    });
  }
};

// Get enrollment progress
export const getEnrollmentProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({ userId, courseId })
      .populate('courseId', 'title courseContent stats');

    if (!enrollment) {
      return res.status(404).json({
        status: 'error',
        message: 'Not enrolled in this course'
      });
    }

    // Get detailed progress information
    const course = enrollment.courseId;
    const totalLectures = course.courseContent.reduce((total, chapter) => 
      total + chapter.lectures.length, 0
    );

    const progressDetails = {
      overall: {
        percentage: enrollment.progress.percentage,
        completedLectures: enrollment.progress.completedLectures.length,
        totalLectures,
        totalWatchTime: enrollment.progress.totalWatchTime,
        status: enrollment.status
      },
      chapters: course.courseContent.map(chapter => {
        const chapterLectures = chapter.lectures.length;
        const completedInChapter = enrollment.progress.completedLectures.filter(
          lecture => lecture.chapterId === chapter.chapterId
        ).length;

        return {
          chapterId: chapter.chapterId,
          title: chapter.title,
          totalLectures: chapterLectures,
          completedLectures: completedInChapter,
          percentage: chapterLectures > 0 ? (completedInChapter / chapterLectures) * 100 : 0
        };
      }),
      lastWatched: enrollment.progress.lastWatched
    };

    res.status(200).json({
      status: 'success',
      data: { progress: progressDetails }
    });
  } catch (error) {
    console.error('Error fetching enrollment progress:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch enrollment progress'
    });
  }
};

// Add note
export const addNote = async (req, res) => {
  try {
    const { courseId, chapterId, lectureId, content, timestamp } = req.body;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(404).json({
        status: 'error',
        message: 'Not enrolled in this course'
      });
    }

    await enrollment.addNote(chapterId, lectureId, content, timestamp);

    const newNote = enrollment.notes[enrollment.notes.length - 1];

    res.status(201).json({
      status: 'success',
      message: 'Note added successfully',
      data: { note: newNote }
    });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add note'
    });
  }
};

// Get notes
export const getNotes = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 20, chapterId, lectureId } = req.query;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(404).json({
        status: 'error',
        message: 'Not enrolled in this course'
      });
    }

    let notes = enrollment.notes;

    // Filter by chapter/lecture if specified
    if (chapterId) {
      notes = notes.filter(note => note.chapterId === chapterId);
    }
    if (lectureId) {
      notes = notes.filter(note => note.lectureId === lectureId);
    }

    // Sort by creation date (newest first)
    notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedNotes = notes.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: {
        notes: paginatedNotes,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(notes.length / parseInt(limit)),
          totalNotes: notes.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch notes'
    });
  }
};

// Add bookmark
export const addBookmark = async (req, res) => {
  try {
    const { courseId, chapterId, lectureId, title, timestamp } = req.body;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(404).json({
        status: 'error',
        message: 'Not enrolled in this course'
      });
    }

    await enrollment.addBookmark(chapterId, lectureId, title, timestamp);

    const newBookmark = enrollment.bookmarks[enrollment.bookmarks.length - 1];

    res.status(201).json({
      status: 'success',
      message: 'Bookmark added successfully',
      data: { bookmark: newBookmark }
    });
  } catch (error) {
    console.error('Error adding bookmark:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add bookmark'
    });
  }
};

// Get bookmarks
export const getBookmarks = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(404).json({
        status: 'error',
        message: 'Not enrolled in this course'
      });
    }

    const bookmarks = enrollment.bookmarks.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedBookmarks = bookmarks.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: {
        bookmarks: paginatedBookmarks,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(bookmarks.length / parseInt(limit)),
          totalBookmarks: bookmarks.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookmarks'
    });
  }
};

// Get watch history
export const getWatchHistory = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const filter = { userId, courseId };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const watchHistory = await WatchHistory.find(filter)
      .sort({ lastWatchedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await WatchHistory.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        watchHistory,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalRecords: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching watch history:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch watch history'
    });
  }
};

// Update watch history
export const updateWatchHistory = async (req, res) => {
  try {
    const { courseId, chapterId, lectureId, startPosition, endPosition, lectureDuration } = req.body;
    const userId = req.user._id;

    let watchHistory = await WatchHistory.findOne({
      userId,
      courseId,
      chapterId,
      lectureId
    });

    if (!watchHistory) {
      watchHistory = new WatchHistory({
        userId,
        courseId,
        chapterId,
        lectureId
      });
    }

    // Start new session if startPosition provided
    if (startPosition !== undefined) {
      watchHistory.startWatchSession(startPosition, {
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
    }

    // End session if endPosition provided
    if (endPosition !== undefined && lectureDuration) {
      await watchHistory.endWatchSession(endPosition, lectureDuration);
    }

    await watchHistory.save();

    res.status(200).json({
      status: 'success',
      message: 'Watch history updated',
      data: { watchHistory }
    });
  } catch (error) {
    console.error('Error updating watch history:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update watch history'
    });
  }
};

// Placeholder implementations for remaining functions
export const unenrollFromCourse = async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
};

export const updateNote = async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
};

export const deleteNote = async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
};

export const deleteBookmark = async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
};

export const getCertificate = async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
};

export const generateCertificate = async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
};