import mongoose from 'mongoose';
import Course from './models/Course.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create test courses
const seedCourses = async () => {
  try {
    // Find an educator user (or create one)
    let educator = await User.findOne({ role: 'educator' });
    
    if (!educator) {
      // Create a test educator
      educator = new User({
        firstName: 'Test',
        lastName: 'Educator',
        email: 'educator@test.com',
        password: 'password123',
        role: 'educator',
        isEmailVerified: true
      });
      await educator.save();
      console.log('Created test educator:', educator.email);
    }

    // Create test courses
    const testCourses = [
      {
        title: 'Complete React Developer Course',
        subtitle: 'Master React from basics to advanced',
        description: 'Learn React.js from scratch with hands-on projects and real-world examples.',
        category: 'Programming',
        level: 'Beginner',
        language: 'English',
        price: {
          amount: 49.99,
          isFree: false
        },
        educator: educator._id,
        thumbnail: {
          url: 'https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=React+Course',
          publicId: null
        },
        requirements: [
          'Basic HTML knowledge',
          'Basic JavaScript knowledge'
        ],
        outcomes: [
          'Build modern React applications',
          'Understand React hooks and components',
          'Deploy React apps to production'
        ],
        courseContent: [
          {
            chapterId: 'chapter-1',
            title: 'Introduction to React',
            lectures: [
              {
                lectureId: 'lecture-1-1',
                title: 'What is React?',
                duration: 630, // 10:30 in seconds
                videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
                description: 'Learn the basics of React framework',
                isPreview: true,
                order: 0
              },
              {
                lectureId: 'lecture-1-2',
                title: 'Setting up the development environment',
                duration: 945, // 15:45 in seconds
                videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
                description: 'Set up your React development environment',
                isPreview: false,
                order: 1
              }
            ]
          },
          {
            chapterId: 'chapter-2',
            title: 'React Components',
            lectures: [
              {
                lectureId: 'lecture-2-1',
                title: 'Creating your first component',
                duration: 1215, // 20:15 in seconds
                videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
                description: 'Learn how to create React components',
                isPreview: false,
                order: 0
              }
            ]
          }
        ],
        tags: ['react', 'javascript', 'frontend'],
        status: 'published'
      },
      {
        title: 'Node.js Backend Development',
        subtitle: 'Build scalable backend applications',
        description: 'Learn to create REST APIs and backend services with Node.js and Express.',
        category: 'Programming',
        level: 'Intermediate',
        language: 'English',
        price: {
          amount: 0,
          isFree: true
        },
        educator: educator._id,
        thumbnail: {
          url: 'https://via.placeholder.com/800x600/68D391/FFFFFF?text=Node.js+Course',
          publicId: null
        },
        requirements: [
          'JavaScript fundamentals',
          'Understanding of HTTP protocols'
        ],
        outcomes: [
          'Build REST APIs with Express.js',
          'Implement authentication and authorization',
          'Work with databases'
        ],
        courseContent: [
          {
            chapterId: 'chapter-1',
            title: 'Getting Started with Node.js',
            lectures: [
              {
                lectureId: 'lecture-1-1',
                title: 'Introduction to Node.js',
                duration: 720, // 12:00 in seconds
                videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
                description: 'Learn the basics of Node.js runtime',
                isPreview: true,
                order: 0
              }
            ]
          }
        ],
        tags: ['nodejs', 'backend', 'api'],
        status: 'published'
      }
    ];

    // Clear existing courses
    await Course.deleteMany({});
    console.log('Cleared existing courses');

    // Insert test courses
    for (const courseData of testCourses) {
      const course = new Course(courseData);
      await course.save();
      
      // Add course to educator's created courses
      await User.findByIdAndUpdate(
        educator._id,
        { $push: { createdCourses: course._id } }
      );
      
      console.log(`Created course: ${course.title}`);
    }

    console.log('✅ Courses seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
};

// Run the seeder
const runSeeder = async () => {
  await connectDB();
  await seedCourses();
};

runSeeder();