import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollmentType: {
    type: String,
    enum: ['free', 'paid', 'preview'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  paymentDetails: {
    amount: Number,
    currency: String,
    transactionId: String,
    paymentMethod: String,
    paidAt: Date
  },
  progress: {
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedLectures: [{
      chapterId: String,
      lectureId: String,
      completedAt: {
        type: Date,
        default: Date.now
      },
      watchTime: Number // in seconds
    }],
    totalWatchTime: {
      type: Number, // in minutes
      default: 0
    },
    lastWatched: {
      chapterId: String,
      lectureId: String,
      timestamp: Number, // in seconds
      lastAccessedAt: {
        type: Date,
        default: Date.now
      }
    }
  },
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedAt: Date,
    certificateUrl: String,
    certificateId: String
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    ratedAt: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'suspended'],
    default: 'active'
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  expiresAt: Date, // For time-limited courses
  notes: [{
    chapterId: String,
    lectureId: String,
    content: String,
    timestamp: Number, // Position in video where note was made
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  bookmarks: [{
    chapterId: String,
    lectureId: String,
    title: String,
    timestamp: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Compound indexes
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ userId: 1, status: 1 });
enrollmentSchema.index({ courseId: 1, status: 1 });
enrollmentSchema.index({ enrolledAt: -1 });

// Methods
enrollmentSchema.methods.updateProgress = async function() {
  const Course = mongoose.model('Course');
  const course = await Course.findById(this.courseId);
  
  if (!course) return this;
  
  let totalLectures = 0;
  course.courseContent.forEach(chapter => {
    totalLectures += chapter.lectures.length;
  });
  
  const completedCount = this.progress.completedLectures.length;
  this.progress.percentage = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;
  
  // Mark as completed if 100% progress
  if (this.progress.percentage === 100 && this.status === 'active') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  await this.save();
  return this;
};

enrollmentSchema.methods.markLectureComplete = async function(chapterId, lectureId, watchTime = 0) {
  const existingLecture = this.progress.completedLectures.find(
    lecture => lecture.chapterId === chapterId && lecture.lectureId === lectureId
  );
  
  if (!existingLecture) {
    this.progress.completedLectures.push({
      chapterId,
      lectureId,
      completedAt: new Date(),
      watchTime
    });
    
    this.progress.totalWatchTime += Math.ceil(watchTime / 60); // Convert to minutes
    await this.updateProgress();
  }
  
  return this;
};

enrollmentSchema.methods.updateLastWatched = async function(chapterId, lectureId, timestamp) {
  this.progress.lastWatched = {
    chapterId,
    lectureId,
    timestamp,
    lastAccessedAt: new Date()
  };
  
  await this.save();
  return this;
};

enrollmentSchema.methods.addNote = async function(chapterId, lectureId, content, timestamp) {
  this.notes.push({
    chapterId,
    lectureId,
    content,
    timestamp,
    createdAt: new Date()
  });
  
  await this.save();
  return this;
};

enrollmentSchema.methods.addBookmark = async function(chapterId, lectureId, title, timestamp) {
  const existingBookmark = this.bookmarks.find(
    bookmark => bookmark.chapterId === chapterId && 
                bookmark.lectureId === lectureId && 
                bookmark.timestamp === timestamp
  );
  
  if (!existingBookmark) {
    this.bookmarks.push({
      chapterId,
      lectureId,
      title,
      timestamp,
      createdAt: new Date()
    });
    
    await this.save();
  }
  
  return this;
};

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;