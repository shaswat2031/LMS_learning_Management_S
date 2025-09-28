import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
  lectureId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  videoUrl: {
    type: String,
    required: true
  },
  videoPublicId: String, // Cloudinary public ID
  duration: {
    type: Number, // in seconds
    required: true
  },
  previewUrl: String, // Video thumbnail
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['pdf', 'doc', 'link', 'image', 'code']
    }
  }],
  isPreview: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: false });

const chapterSchema = new mongoose.Schema({
  chapterId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  lectures: [lectureSchema],
  order: {
    type: Number,
    default: 0
  }
}, { _id: false });

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  subtitle: {
    type: String,
    maxlength: 300
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  thumbnail: {
    url: {
      type: String,
      required: true
    },
    publicId: String // Cloudinary public ID
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Programming', 
      'Design', 
      'Business', 
      'Marketing', 
      'Data Science', 
      'Photography', 
      'Music', 
      'Language',
      'Health & Fitness',
      'Personal Development'
    ]
  },
  level: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels']
  },
  language: {
    type: String,
    required: true,
    default: 'English'
  },
  price: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    discountPrice: {
      type: Number,
      min: 0
    },
    isFree: {
      type: Boolean,
      default: false
    }
  },
  educator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseContent: [chapterSchema],
  outcomes: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  enrolledStudents: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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
    }
  }],
  ratings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  stats: {
    totalStudents: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    totalDuration: {
      type: Number, // in minutes
      default: 0
    },
    totalLectures: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'review'],
    default: 'draft'
  },
  publishedAt: Date,
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    slug: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  previewVideo: {
    url: String,
    publicId: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ 'price.isFree': 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ educator: 1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ 'stats.averageRating': -1 });
courseSchema.index({ 'stats.totalStudents': -1 });
courseSchema.index({ createdAt: -1 });

// Virtual for total duration in formatted string
courseSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.stats.totalDuration / 60);
  const minutes = this.stats.totalDuration % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

// Methods
courseSchema.methods.calculateStats = function() {
  // Calculate total lectures and duration
  let totalLectures = 0;
  let totalDuration = 0;
  
  this.courseContent.forEach(chapter => {
    totalLectures += chapter.lectures.length;
    chapter.lectures.forEach(lecture => {
      totalDuration += lecture.duration || 0;
    });
  });
  
  this.stats.totalLectures = totalLectures;
  this.stats.totalDuration = Math.ceil(totalDuration / 60); // Convert to minutes
  
  // Calculate average rating
  if (this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    this.stats.averageRating = Number((sum / this.ratings.length).toFixed(1));
    this.stats.totalReviews = this.ratings.length;
  }
  
  // Update total students
  this.stats.totalStudents = this.enrolledStudents.length;
};

courseSchema.methods.enrollStudent = async function(userId) {
  const existingEnrollment = this.enrolledStudents.find(
    student => student.userId.toString() === userId.toString()
  );
  
  if (!existingEnrollment) {
    this.enrolledStudents.push({
      userId,
      enrolledAt: new Date(),
      progress: 0
    });
    this.stats.totalStudents = this.enrolledStudents.length;
    await this.save();
  }
  
  return this;
};

courseSchema.methods.addRating = async function(userId, rating, review) {
  // Remove existing rating if any
  this.ratings = this.ratings.filter(
    r => r.userId.toString() !== userId.toString()
  );
  
  // Add new rating
  this.ratings.push({
    userId,
    rating,
    review,
    createdAt: new Date()
  });
  
  // Recalculate stats
  this.calculateStats();
  await this.save();
  
  return this;
};

// Pre-save middleware to update stats
courseSchema.pre('save', function(next) {
  if (this.isModified('courseContent') || this.isModified('ratings') || this.isModified('enrolledStudents')) {
    this.calculateStats();
  }
  this.lastUpdated = new Date();
  next();
});

// Generate slug from title
courseSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.seo.slug) {
    this.seo.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

const Course = mongoose.model('Course', courseSchema);
export default Course;