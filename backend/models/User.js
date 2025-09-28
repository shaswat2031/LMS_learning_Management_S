import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  profileImage: {
    url: String,
    publicId: String
  },
  role: {
    type: String,
    enum: ['student', 'educator', 'admin'],
    default: 'student'
  },
  bio: {
    type: String,
    maxlength: 500
  },
  website: String,
  socialLinks: {
    twitter: String,
    linkedin: String,
    github: String
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    },
    language: { type: String, default: 'en' },
    timezone: String
  },
  enrolledCourses: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedLectures: [{
      lectureId: String,
      completedAt: { type: Date, default: Date.now }
    }],
    lastWatched: {
      chapterId: String,
      lectureId: String,
      timestamp: Number, // in seconds
      lastAccessedAt: { type: Date, default: Date.now }
    }
  }],
  createdCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  stats: {
    totalWatchTime: { type: Number, default: 0 }, // in minutes
    coursesCompleted: { type: Number, default: 0 },
    certificatesEarned: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    lastActiveDate: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  verificationStatus: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ clerkId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'enrolledCourses.courseId': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Methods
userSchema.methods.enrollInCourse = async function(courseId) {
  const existingEnrollment = this.enrolledCourses.find(
    enrollment => enrollment.courseId.toString() === courseId.toString()
  );
  
  if (!existingEnrollment) {
    this.enrolledCourses.push({
      courseId,
      enrolledAt: new Date(),
      progress: 0,
      completedLectures: []
    });
    await this.save();
  }
  
  return this;
};

userSchema.methods.updateWatchProgress = async function(courseId, chapterId, lectureId, timestamp) {
  const enrollment = this.enrolledCourses.find(
    e => e.courseId.toString() === courseId.toString()
  );
  
  if (enrollment) {
    enrollment.lastWatched = {
      chapterId,
      lectureId,
      timestamp,
      lastAccessedAt: new Date()
    };
    
    // Mark lecture as completed if watched more than 80%
    const existingLecture = enrollment.completedLectures.find(
      l => l.lectureId === lectureId
    );
    
    if (!existingLecture && timestamp > 0) {
      // You would need lecture duration to calculate completion percentage
      // For now, we'll mark as completed when timestamp is provided
      enrollment.completedLectures.push({
        lectureId,
        completedAt: new Date()
      });
    }
    
    await this.save();
  }
  
  return this;
};

userSchema.methods.calculateCourseProgress = function(courseId) {
  const enrollment = this.enrolledCourses.find(
    e => e.courseId.toString() === courseId.toString()
  );
  
  return enrollment ? enrollment.progress : 0;
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Generate verification token
userSchema.methods.generateVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  this.verificationToken = token;
  return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User;