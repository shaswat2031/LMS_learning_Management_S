import mongoose from 'mongoose';

const watchHistorySchema = new mongoose.Schema({
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
  chapterId: {
    type: String,
    required: true
  },
  lectureId: {
    type: String,
    required: true
  },
  watchSessions: [{
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: Date,
    startPosition: {
      type: Number, // in seconds
      default: 0
    },
    endPosition: Number, // in seconds
    duration: Number, // actual watch duration in seconds
    completed: {
      type: Boolean,
      default: false
    },
    deviceInfo: {
      userAgent: String,
      ip: String,
      platform: String
    }
  }],
  totalWatchTime: {
    type: Number, // in seconds
    default: 0
  },
  lastWatchPosition: {
    type: Number, // in seconds
    default: 0
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  firstWatchedAt: {
    type: Date,
    default: Date.now
  },
  lastWatchedAt: {
    type: Date,
    default: Date.now
  },
  watchQuality: {
    type: String,
    enum: ['auto', '240p', '360p', '480p', '720p', '1080p'],
    default: 'auto'
  },
  playbackSpeed: {
    type: Number,
    default: 1.0
  },
  interactions: [{
    type: {
      type: String,
      enum: ['play', 'pause', 'seek', 'skip', 'rewind', 'speed_change', 'quality_change']
    },
    timestamp: Number, // position in video
    value: String, // additional data like speed value
    occurredAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
watchHistorySchema.index({ userId: 1, courseId: 1, chapterId: 1, lectureId: 1 });
watchHistorySchema.index({ userId: 1, lastWatchedAt: -1 });
watchHistorySchema.index({ courseId: 1, isCompleted: 1 });

// Methods
watchHistorySchema.methods.startWatchSession = function(startPosition = 0, deviceInfo = {}) {
  const session = {
    startTime: new Date(),
    startPosition,
    deviceInfo
  };
  
  this.watchSessions.push(session);
  this.lastWatchedAt = new Date();
  
  return this.watchSessions[this.watchSessions.length - 1];
};

watchHistorySchema.methods.endWatchSession = async function(endPosition, lectureDuration) {
  const currentSession = this.watchSessions[this.watchSessions.length - 1];
  
  if (currentSession && !currentSession.endTime) {
    currentSession.endTime = new Date();
    currentSession.endPosition = endPosition;
    
    // Calculate session duration
    const sessionDuration = Math.max(0, endPosition - currentSession.startPosition);
    currentSession.duration = sessionDuration;
    
    // Update total watch time
    this.totalWatchTime += sessionDuration;
    this.lastWatchPosition = endPosition;
    
    // Calculate completion percentage
    if (lectureDuration > 0) {
      this.completionPercentage = Math.min(100, Math.round((endPosition / lectureDuration) * 100));
      
      // Mark as completed if watched more than 80%
      if (this.completionPercentage >= 80 && !this.isCompleted) {
        this.isCompleted = true;
        this.completedAt = new Date();
        currentSession.completed = true;
      }
    }
    
    await this.save();
  }
  
  return this;
};

watchHistorySchema.methods.updateWatchPosition = async function(position) {
  this.lastWatchPosition = position;
  this.lastWatchedAt = new Date();
  
  await this.save();
  return this;
};

watchHistorySchema.methods.addInteraction = async function(type, timestamp, value = '') {
  this.interactions.push({
    type,
    timestamp,
    value,
    occurredAt: new Date()
  });
  
  // Keep only last 50 interactions per lecture
  if (this.interactions.length > 50) {
    this.interactions = this.interactions.slice(-50);
  }
  
  await this.save();
  return this;
};

// Static methods
watchHistorySchema.statics.getUserWatchStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$userId',
        totalWatchTime: { $sum: '$totalWatchTime' },
        totalLectures: { $sum: 1 },
        completedLectures: {
          $sum: { $cond: ['$isCompleted', 1, 0] }
        },
        coursesWatched: { $addToSet: '$courseId' }
      }
    },
    {
      $project: {
        totalWatchTimeHours: { $divide: ['$totalWatchTime', 3600] },
        totalLectures: 1,
        completedLectures: 1,
        completionRate: {
          $multiply: [
            { $divide: ['$completedLectures', '$totalLectures'] },
            100
          ]
        },
        uniqueCourses: { $size: '$coursesWatched' }
      }
    }
  ]);
  
  return stats[0] || {
    totalWatchTimeHours: 0,
    totalLectures: 0,
    completedLectures: 0,
    completionRate: 0,
    uniqueCourses: 0
  };
};

watchHistorySchema.statics.getCourseWatchStats = async function(courseId) {
  const stats = await this.aggregate([
    { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: '$courseId',
        totalViewers: { $addToSet: '$userId' },
        totalWatchTime: { $sum: '$totalWatchTime' },
        averageWatchTime: { $avg: '$totalWatchTime' },
        completionRate: {
          $avg: { $cond: ['$isCompleted', 100, 0] }
        }
      }
    },
    {
      $project: {
        totalViewers: { $size: '$totalViewers' },
        totalWatchTimeHours: { $divide: ['$totalWatchTime', 3600] },
        averageWatchTimeMinutes: { $divide: ['$averageWatchTime', 60] },
        completionRate: { $round: ['$completionRate', 2] }
      }
    }
  ]);
  
  return stats[0] || {
    totalViewers: 0,
    totalWatchTimeHours: 0,
    averageWatchTimeMinutes: 0,
    completionRate: 0
  };
};

const WatchHistory = mongoose.model('WatchHistory', watchHistorySchema);
export default WatchHistory;