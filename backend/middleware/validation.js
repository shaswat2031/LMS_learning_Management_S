import Joi from 'joi';

// Generic validation middleware
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: errorMessage
      });
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
};

// Course validation schemas
export const courseSchemas = {
  create: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    subtitle: Joi.string().max(300).optional(),
    description: Joi.string().min(20).max(2000).required(),
    category: Joi.string().valid(
      'Programming', 'Design', 'Business', 'Marketing', 
      'Data Science', 'Photography', 'Music', 'Language',
      'Health & Fitness', 'Personal Development'
    ).required(),
    level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced', 'All Levels').required(),
    language: Joi.string().default('English'),
    price: Joi.alternatives().try(
      Joi.number().min(0), // Allow simple number from FormData
      Joi.object({
        amount: Joi.number().min(0).required(),
        currency: Joi.string().default('USD'),
        discountPrice: Joi.number().min(0).optional(),
        isFree: Joi.boolean().default(false)
      })
    ).required(),
    outcomes: Joi.alternatives().try(
      Joi.array().items(Joi.string().trim()).min(1), // Array format
      Joi.any() // Allow FormData format (outcomes[0], outcomes[1], etc.)
    ).optional(),
    requirements: Joi.alternatives().try(
      Joi.array().items(Joi.string().trim()), // Array format  
      Joi.any() // Allow FormData format (requirements[0], requirements[1], etc.)
    ).optional(),
    courseContent: Joi.string().optional(), // JSON string from FormData
    tags: Joi.array().items(Joi.string().lowercase().trim()).optional()
  }).unknown(true), // Allow unknown fields for FormData structure
  
  update: Joi.object({
    title: Joi.string().min(5).max(200).optional(),
    subtitle: Joi.string().max(300).optional(),
    description: Joi.string().min(20).max(2000).optional(),
    category: Joi.string().valid(
      'Programming', 'Design', 'Business', 'Marketing', 
      'Data Science', 'Photography', 'Music', 'Language',
      'Health & Fitness', 'Personal Development'
    ).optional(),
    level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced', 'All Levels').optional(),
    language: Joi.string().optional(),
    price: Joi.object({
      amount: Joi.number().min(0).optional(),
      currency: Joi.string().optional(),
      discountPrice: Joi.number().min(0).optional(),
      isFree: Joi.boolean().optional()
    }).optional(),
    outcomes: Joi.array().items(Joi.string().trim()).optional(),
    requirements: Joi.array().items(Joi.string().trim()).optional(),
    tags: Joi.array().items(Joi.string().lowercase().trim()).optional(),
    status: Joi.string().valid('draft', 'published', 'archived', 'review').optional()
  }),
  
  addChapter: Joi.object({
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(500).optional(),
    order: Joi.number().integer().min(0).optional()
  }),
  
  addLecture: Joi.object({
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).optional(),
    duration: Joi.number().integer().min(1).required(), // in seconds
    isPreview: Joi.boolean().default(false),
    order: Joi.number().integer().min(0).optional()
  })
};

// User validation schemas
export const userSchemas = {
  register: Joi.object({
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
    role: Joi.string().valid('student', 'educator').default('student')
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  updatePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(100).required()
  }),
  
  forgotPassword: Joi.object({
    email: Joi.string().email().required()
  }),
  
  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).max(100).required()
  }),
  
  updateProfile: Joi.object({
    firstName: Joi.string().min(1).max(50).optional(),
    lastName: Joi.string().min(1).max(50).optional(),
    bio: Joi.string().max(500).optional(),
    website: Joi.string().uri().optional(),
    socialLinks: Joi.object({
      twitter: Joi.string().uri().optional(),
      linkedin: Joi.string().uri().optional(),
      github: Joi.string().uri().optional()
    }).optional(),
    preferences: Joi.object({
      notifications: Joi.object({
        email: Joi.boolean().optional(),
        push: Joi.boolean().optional(),
        marketing: Joi.boolean().optional()
      }).optional(),
      language: Joi.string().optional(),
      timezone: Joi.string().optional()
    }).optional()
  })
};

// Enrollment validation schemas
export const enrollmentSchemas = {
  enroll: Joi.object({
    courseId: Joi.string().hex().length(24).required(),
    enrollmentType: Joi.string().valid('free', 'paid', 'preview').required()
  }),
  
  updateProgress: Joi.object({
    chapterId: Joi.string().required(),
    lectureId: Joi.string().required(),
    timestamp: Joi.number().min(0).optional(),
    watchTime: Joi.number().min(0).optional()
  }),
  
  addNote: Joi.object({
    chapterId: Joi.string().required(),
    lectureId: Joi.string().required(),
    content: Joi.string().min(1).max(1000).required(),
    timestamp: Joi.number().min(0).optional()
  }),
  
  addRating: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    review: Joi.string().max(1000).optional()
  })
};

// Query validation schemas
export const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),
  
  courseFilters: Joi.object({
    category: Joi.string().optional(),
    level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced', 'All Levels').optional(),
    isFree: Joi.boolean().optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    search: Joi.string().min(1).max(100).optional(),
    tags: Joi.string().optional() // comma-separated tags
  })
};