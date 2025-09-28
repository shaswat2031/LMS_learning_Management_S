import Course from '../models/Course.js';
import User from '../models/User.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../middleware/upload.js';

// Get all courses with pagination and filtering
export const getAllCourses = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      level, 
      isFree, 
      minPrice, 
      maxPrice, 
      search, 
      tags,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build filter object
    const filter = { status: 'published' };
    
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (isFree !== undefined) filter['price.isFree'] = isFree === 'true';
    if (minPrice || maxPrice) {
      filter['price.amount'] = {};
      if (minPrice) filter['price.amount'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['price.amount'].$lte = parseFloat(maxPrice);
    }
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    // Build search query
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const courses = await Course.find(filter)
      .populate('educator', 'firstName lastName profileImage')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-courseContent.lectures.videoUrl -courseContent.lectures.videoPublicId');

    const total = await Course.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        courses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalCourses: total,
          hasMore: skip + courses.length < total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch courses'
    });
  }
};

// Get course by ID
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const course = await Course.findById(id)
      .populate('educator', 'firstName lastName profileImage bio')
      .populate('enrolledStudents.userId', 'firstName lastName profileImage');

    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    // Check if user is enrolled
    const isEnrolled = userId ? 
      course.enrolledStudents.some(student => 
        student.userId._id.toString() === userId.toString()
      ) : false;

    // Hide video URLs for non-enrolled users (except preview videos)
    if (!isEnrolled && course.educator._id.toString() !== userId?.toString()) {
      course.courseContent.forEach(chapter => {
        chapter.lectures.forEach(lecture => {
          if (!lecture.isPreview) {
            lecture.videoUrl = undefined;
            lecture.videoPublicId = undefined;
          }
        });
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        course,
        isEnrolled,
        isOwner: userId ? course.educator._id.toString() === userId.toString() : false
      }
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch course'
    });
  }
};

// Create new course
export const createCourse = async (req, res) => {
  try {
    const educatorId = req.user._id;
    let thumbnailData = null;

    console.log('Raw req.body:', req.body);
    console.log('Raw req.file:', req.file);

    // Upload thumbnail if provided
    if (req.file) {
      thumbnailData = await uploadToCloudinary(
        req.file,
        'course-thumbnails',
        {
          transformation: [
            { width: 800, height: 600, crop: 'fill', quality: 'auto:good' }
          ]
        }
      );
    }

    // Parse FormData structure sent by frontend
    const { title, subtitle, description, category, level, language, price, courseContent } = req.body;
    
    // Parse requirements array from FormData
    const requirements = [];
    Object.keys(req.body).forEach(key => {
      const match = key.match(/^requirements\[(\d+)\]$/);
      if (match) {
        const index = parseInt(match[1]);
        if (req.body[key].trim()) {
          requirements[index] = req.body[key];
        }
      }
    });
    
    // Parse outcomes array from FormData
    const outcomes = [];
    Object.keys(req.body).forEach(key => {
      const match = key.match(/^outcomes\[(\d+)\]$/);
      if (match) {
        const index = parseInt(match[1]);
        if (req.body[key].trim()) {
          outcomes[index] = req.body[key];
        }
      }
    });
    
    // Parse courseContent JSON string
    let parsedCourseContent = [];
    if (courseContent) {
      try {
        parsedCourseContent = JSON.parse(courseContent);
      } catch (error) {
        console.error('Error parsing courseContent:', error);
        return res.status(400).json({
          status: 'error',
          message: 'Invalid course content format'
        });
      }
    }

    const courseData = {
      title,
      subtitle,
      description,
      category,
      level,
      language,
      price: {
        amount: parseFloat(price) || 0,
        currency: 'USD',
        isFree: parseFloat(price) === 0
      },
      requirements: requirements.filter(req => req && req.trim()),
      outcomes: outcomes.filter(outcome => outcome && outcome.trim()),
      courseContent: parsedCourseContent,
      educator: educatorId,
      thumbnail: thumbnailData || {
        url: 'https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Course+Thumbnail',
        publicId: null
      }
    };

    console.log('Processed courseData:', JSON.stringify(courseData, null, 2));

    const course = new Course(courseData);
    await course.save();

    // Add course to educator's created courses
    await User.findByIdAndUpdate(
      educatorId,
      { $push: { createdCourses: course._id } }
    );

    await course.populate('educator', 'firstName lastName profileImage');

    res.status(201).json({
      status: 'success',
      message: 'Course created successfully',
      data: { course }
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create course',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    // Check if user is the course owner
    if (course.educator.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this course'
      });
    }

    let updateData = { ...req.body };

    // Upload new thumbnail if provided
    if (req.file) {
      // Delete old thumbnail if it exists
      if (course.thumbnail.publicId) {
        await deleteFromCloudinary(course.thumbnail.publicId);
      }

      const thumbnailData = await uploadToCloudinary(
        req.file,
        'course-thumbnails',
        {
          transformation: [
            { width: 800, height: 600, crop: 'fill', quality: 'auto:good' }
          ]
        }
      );
      updateData.thumbnail = thumbnailData;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('educator', 'firstName lastName profileImage');

    res.status(200).json({
      status: 'success',
      message: 'Course updated successfully',
      data: { course: updatedCourse }
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update course'
    });
  }
};

// Add chapter to course
export const addChapterToCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, order } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    if (course.educator.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to modify this course'
      });
    }

    const chapterId = `chapter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newChapter = {
      chapterId,
      title,
      description,
      lectures: [],
      order: order || course.courseContent.length
    };

    course.courseContent.push(newChapter);
    await course.save();

    res.status(201).json({
      status: 'success',
      message: 'Chapter added successfully',
      data: { chapter: newChapter }
    });
  } catch (error) {
    console.error('Error adding chapter:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add chapter'
    });
  }
};

// Add lecture to chapter
export const addLectureToChapter = async (req, res) => {
  try {
    const { id, chapterId } = req.params;
    const { title, description, duration, isPreview, order } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    if (course.educator.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to modify this course'
      });
    }

    const chapter = course.courseContent.find(ch => ch.chapterId === chapterId);
    if (!chapter) {
      return res.status(404).json({
        status: 'error',
        message: 'Chapter not found'
      });
    }

    let videoData = null;
    if (req.file) {
      videoData = await uploadToCloudinary(
        req.file,
        'lecture-videos',
        { resource_type: 'video' }
      );
    }

    const lectureId = `lecture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newLecture = {
      lectureId,
      title,
      description,
      videoUrl: videoData?.url || '',
      videoPublicId: videoData?.publicId || '',
      duration: parseInt(duration),
      isPreview: isPreview || false,
      order: order || chapter.lectures.length
    };

    chapter.lectures.push(newLecture);
    await course.save();

    res.status(201).json({
      status: 'success',
      message: 'Lecture added successfully',
      data: { lecture: newLecture }
    });
  } catch (error) {
    console.error('Error adding lecture:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add lecture'
    });
  }
};

// Get courses by educator
export const getCoursesByEducator = async (req, res) => {
  try {
    const { educatorId } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    const filter = { educator: educatorId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const courses = await Course.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        courses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalCourses: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching educator courses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch courses'
    });
  }
};

// Get courses for authenticated educator
export const getMyEducatorCourses = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const educatorId = req.user.id;

    const filter = { educator: educatorId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const courses = await Course.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('educator', 'firstName lastName email');

    const total = await Course.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      courses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalCourses: total
      }
    });
  } catch (error) {
    console.error('Error fetching my educator courses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch courses'
    });
  }
};

// Search courses
export const searchCourses = async (req, res) => {
  try {
    const { q, page = 1, limit = 20, category, level } = req.query;

    if (!q) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }

    const filter = {
      status: 'published',
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    };

    if (category) filter.category = category;
    if (level) filter.level = level;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const courses = await Course.find(filter)
      .populate('educator', 'firstName lastName profileImage')
      .sort({ 'stats.averageRating': -1, 'stats.totalStudents': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-courseContent.lectures.videoUrl -courseContent.lectures.videoPublicId');

    const total = await Course.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        courses,
        query: q,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalResults: total
        }
      }
    });
  } catch (error) {
    console.error('Error searching courses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search courses'
    });
  }
};

// Get featured courses
export const getFeaturedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ 
      status: 'published', 
      featured: true 
    })
      .populate('educator', 'firstName lastName profileImage')
      .sort({ 'stats.averageRating': -1 })
      .limit(12)
      .select('-courseContent.lectures.videoUrl -courseContent.lectures.videoPublicId');

    res.status(200).json({
      status: 'success',
      data: { courses }
    });
  } catch (error) {
    console.error('Error fetching featured courses:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch featured courses'
    });
  }
};

// Publish course
export const publishCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    if (course.educator.toString() !== userId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to publish this course'
      });
    }

    // Validate course has required content
    if (!course.courseContent || course.courseContent.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Course must have at least one chapter to be published'
      });
    }

    const hasLectures = course.courseContent.some(chapter => 
      chapter.lectures && chapter.lectures.length > 0
    );

    if (!hasLectures) {
      return res.status(400).json({
        status: 'error',
        message: 'Course must have at least one lecture to be published'
      });
    }

    course.status = 'published';
    course.publishedAt = new Date();
    await course.save();

    res.status(200).json({
      status: 'success',
      message: 'Course published successfully',
      data: { course }
    });
  } catch (error) {
    console.error('Error publishing course:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to publish course'
    });
  }
};

// Add course rating
export const addCourseRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user._id;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        status: 'error',
        message: 'Course not found'
      });
    }

    // Check if user is enrolled
    const isEnrolled = course.enrolledStudents.some(
      student => student.userId.toString() === userId.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({
        status: 'error',
        message: 'You must be enrolled in the course to rate it'
      });
    }

    await course.addRating(userId, rating, review);

    res.status(200).json({
      status: 'success',
      message: 'Rating added successfully',
      data: {
        averageRating: course.stats.averageRating,
        totalReviews: course.stats.totalReviews
      }
    });
  } catch (error) {
    console.error('Error adding course rating:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add rating'
    });
  }
};

// Placeholder implementations for remaining functions
export const getCourseBySlug = async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
};

export const deleteCourse = async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
};

export const updateChapter = async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
};

export const deleteChapter = async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
};

export const updateLecture = async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
};

export const deleteLecture = async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
};

export const unpublishCourse = async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
};

export const getCourseStats = async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
};

export const getCourseRatings = async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
};