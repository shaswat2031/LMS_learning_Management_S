import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import WatchHistory from '../models/WatchHistory.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { uploadToCloudinary, deleteFromCloudinary } from '../middleware/upload.js';

// Helper function to generate token and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateAuthToken();
  console.log('Generated token:', token.substring(0, 20) + '...');
  
  // Remove password from output
  const userData = user.toObject();
  delete userData.password;
  
  res.status(statusCode).json({
    status: 'success',
    token,
    user: userData
  });
};

// Register user
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role = 'student' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role
    });

    await user.save();

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Registration failed'
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Login failed'
    });
  }
};

// Logout user (client-side token removal)
export const logoutUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('enrolledCourses.courseId', 'title thumbnail stats')
      .populate('createdCourses', 'title thumbnail stats')
      .select('-password');

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user data'
    });
  }
};

// Update password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Update password error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Password update failed'
    });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with this email address'
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // In production, send email with reset token
    // For now, return the token (remove this in production)
    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent to email',
      resetToken // Remove this line in production
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Password reset failed'
    });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Hash token and find user
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({
      status: 'error',
      message: 'Password reset failed'
    });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId)
      .populate('enrolledCourses.courseId', 'title thumbnail stats')
      .populate('createdCourses', 'title thumbnail stats')
      .select('-__v');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user profile'
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.email;
    delete updateData.password;
    delete updateData.role;
    delete updateData.enrolledCourses;
    delete updateData.createdCourses;
    delete updateData.isVerified;
    delete updateData.verificationToken;
    delete updateData.resetPasswordToken;
    delete updateData.resetPasswordExpires;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile'
    });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get enrollment stats
    const totalEnrollments = user.enrolledCourses.length;
    const completedCourses = user.enrolledCourses.filter(
      enrollment => enrollment.progress >= 100
    ).length;

    // Get watch history stats
    const watchStats = await WatchHistory.getUserWatchStats(userId);

    // Get created courses stats (if educator)
    let createdCoursesStats = null;
    if (user.role === 'educator') {
      const createdCourses = await Course.find({ educator: userId });
      createdCoursesStats = {
        totalCourses: createdCourses.length,
        totalStudents: createdCourses.reduce((sum, course) => sum + course.stats.totalStudents, 0),
        averageRating: createdCourses.length > 0 
          ? createdCourses.reduce((sum, course) => sum + course.stats.averageRating, 0) / createdCourses.length
          : 0
      };
    }

    const stats = {
      learning: {
        totalEnrollments,
        completedCourses,
        completionRate: totalEnrollments > 0 ? (completedCourses / totalEnrollments) * 100 : 0,
        totalWatchTimeHours: watchStats.totalWatchTimeHours,
        streakDays: user.stats.streakDays
      },
      teaching: createdCoursesStats
    };

    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user statistics'
    });
  }
};

// Get user enrollments
export const getUserEnrollments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, status } = req.query;

    const filter = { userId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const enrollments = await Enrollment.find(filter)
      .populate('courseId', 'title thumbnail category level stats educator')
      .populate('courseId.educator', 'firstName lastName profileImage')
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Enrollment.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        enrollments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalEnrollments: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user enrollments:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch enrollments'
    });
  }
};

// Get user watch history
export const getUserWatchHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, courseId } = req.query;

    const filter = { userId };
    if (courseId) filter.courseId = courseId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const watchHistory = await WatchHistory.find(filter)
      .populate('courseId', 'title thumbnail')
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

// Get user dashboard data
export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Recent enrollments
    const recentEnrollments = await Enrollment.find({ userId })
      .populate('courseId', 'title thumbnail category stats')
      .sort({ enrolledAt: -1 })
      .limit(5);

    // Continue watching (courses with progress but not completed)
    const continueWatching = await Enrollment.find({
      userId,
      'progress.percentage': { $gt: 0, $lt: 100 },
      status: 'active'
    })
      .populate('courseId', 'title thumbnail category')
      .sort({ 'progress.lastWatched.lastAccessedAt': -1 })
      .limit(5);

    // Recommended courses (based on enrolled categories)
    const enrolledCategories = await Enrollment.find({ userId })
      .populate('courseId', 'category')
      .distinct('courseId.category');

    const recommendedCourses = await Course.find({
      category: { $in: enrolledCategories },
      status: 'published',
      _id: { $nin: recentEnrollments.map(e => e.courseId._id) }
    })
      .populate('educator', 'firstName lastName profileImage')
      .sort({ 'stats.averageRating': -1 })
      .limit(6);

    // Recent achievements
    const achievements = [];
    
    // Check for completion achievements
    const completedCourses = await Enrollment.find({
      userId,
      status: 'completed'
    }).countDocuments();

    if (completedCourses > 0) {
      achievements.push({
        type: 'course_completion',
        title: 'Course Completed',
        description: `Completed ${completedCourses} course${completedCourses > 1 ? 's' : ''}`,
        earnedAt: new Date()
      });
    }

    const dashboard = {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        role: user.role
      },
      recentEnrollments,
      continueWatching,
      recommendedCourses,
      achievements,
      stats: {
        totalEnrollments: recentEnrollments.length,
        completedCourses,
        totalWatchTime: user.stats.totalWatchTime
      }
    };

    res.status(200).json({
      status: 'success',
      data: { dashboard }
    });
  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard data'
    });
  }
};

// Upload profile image
export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Delete old profile image if it exists
    if (user.profileImage?.publicId) {
      await deleteFromCloudinary(user.profileImage.publicId);
    }

    // Upload new image
    const imageData = await uploadToCloudinary(
      req.file,
      'profile-images',
      {
        transformation: [
          { width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto:good' }
        ]
      }
    );

    // Update user profile
    user.profileImage = {
      url: imageData.url,
      publicId: imageData.publicId
    };
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Profile image updated successfully',
      data: {
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload profile image'
    });
  }
};

// Update user preferences
export const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { preferences },
      { new: true, runValidators: true }
    ).select('preferences');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Preferences updated successfully',
      data: { preferences: user.preferences }
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update preferences'
    });
  }
};

// Switch user role (student/educator)
export const switchUserRole = async (req, res) => {
  try {
    const userId = req.user._id;
    const { role } = req.body;

    if (!['student', 'educator'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role. Must be either "student" or "educator"'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('role firstName lastName email');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Role switched to ${role} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Error switching user role:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to switch role'
    });
  }
};

// Placeholder implementations for remaining functions
export const getUserCourses = async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
};

export const deleteUser = async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
};

export const searchUsers = async (req, res) => {
  res.status(501).json({ status: 'error', message: 'Not implemented yet' });
};