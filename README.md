 # BookMyShow Learning Management System - Backend

A comprehensive Node.js/Express backend for the learning management system with MongoDB, Cloudinary integration, and Clerk authentication.

## Features

- 🔐 **Authentication**: Clerk integration for user management
- 📁 **File Upload**: Cloudinary integration for images and videos
- 📊 **Database**: MongoDB with Mongoose ODM
- 🎯 **Course Management**: Complete course creation and management
- 📈 **Progress Tracking**: Watch history and enrollment tracking
- 🔒 **Security**: Rate limiting, input validation, error handling
- 📱 **API**: RESTful API with comprehensive endpoints

## Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account
- Clerk account for authentication
- Cloudinary account for file storage

### Installation

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your actual credentials
   ```

3. **Configure Services**

   **MongoDB:**
   - Local: `mongodb://localhost:27017/bookmyshow-lms`
   - Atlas: Get connection string from MongoDB Atlas

   **Clerk Authentication:**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com/)
   - Create a new application
   - Copy the publishable key and secret key

   **Cloudinary:**
   - Go to [Cloudinary Dashboard](https://cloudinary.com/console)
   - Copy cloud name, API key, and API secret

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require a Bearer token from Clerk in the Authorization header:
```
Authorization: Bearer your_clerk_jwt_token
```

### Endpoints

#### Courses
- `GET /courses` - Get all courses (with filters)
- `GET /courses/:id` - Get course by ID
- `POST /courses` - Create course (educator only)
- `PUT /courses/:id` - Update course (owner only)
- `POST /courses/:id/chapters` - Add chapter to course
- `POST /courses/:id/chapters/:chapterId/lectures` - Add lecture to chapter

#### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users/stats` - Get user statistics
- `GET /users/dashboard` - Get dashboard data

#### Enrollments
- `POST /enrollments/enroll` - Enroll in course
- `GET /enrollments/status/:courseId` - Check enrollment status
- `POST /enrollments/progress` - Update watch progress
- `POST /enrollments/complete-lecture` - Mark lecture complete

#### Uploads
- `POST /upload/course-image` - Upload course thumbnail
- `POST /upload/lecture-video` - Upload lecture video
- `POST /upload/profile-image` - Upload profile image

### Example Requests

#### Create Course
```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete React Development",
    "description": "Learn React from basics to advanced",
    "category": "Programming",
    "level": "Intermediate",
    "price": {
      "amount": 99.99,
      "isFree": false
    },
    "learningOutcomes": ["Build React apps", "Understand hooks"]
  }'
```

#### Enroll in Course
```bash
curl -X POST http://localhost:5000/api/enrollments/enroll \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "course_id_here",
    "enrollmentType": "free"
  }'
```

## Database Schema

### User Model
- Basic user information from Clerk
- Enrolled courses and progress
- Created courses (for educators)
- User preferences and statistics

### Course Model
- Course metadata (title, description, category)
- Course content (chapters and lectures)
- Pricing and enrollment information
- Ratings and statistics

### Enrollment Model
- User-course relationship
- Progress tracking
- Notes and bookmarks
- Watch history

### Watch History Model
- Detailed video viewing analytics
- Session tracking
- Completion tracking

## File Upload

### Supported Formats
- **Images**: JPG, PNG, WebP (course thumbnails, profile images)
- **Videos**: MP4, MOV, AVI (lecture content)

### Upload Process
1. Files are uploaded to Cloudinary
2. Automatic optimization and transformation
3. URLs stored in database
4. Responsive delivery to frontend

## Security Features

- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Joi schema validation
- **Error Handling**: Comprehensive error responses
- **Authentication**: Clerk JWT verification
- **File Validation**: Type and size limits

## Environment Variables

| Variable | Description | Required |
|----------|-------------|-----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment | No (default: development) |

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (not implemented yet)

### Project Structure
```
backend/
├── config/          # Database and service configurations
├── controllers/     # Route handlers and business logic
├── middleware/      # Custom middleware functions
├── models/          # MongoDB/Mongoose models
├── routes/          # API route definitions
├── server.js        # Main application entry point
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Check network connectivity for Atlas

2. **Clerk Authentication Errors**
   - Verify Clerk keys in `.env`
   - Check JWT token format
   - Ensure frontend is sending correct headers

3. **Cloudinary Upload Failures**
   - Verify Cloudinary credentials
   - Check file size limits
   - Ensure supported file formats

4. **CORS Issues**
   - Update `FRONTEND_URL` in `.env`
   - Check CORS configuration in server.js

### Logs
The server provides detailed logging:
- Request/response logs
- Error stack traces (development)
- Upload progress
- Database operations

## Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Configure proper CORS settings
4. Set up SSL/HTTPS
5. Use a process manager like PM2
6. Set up monitoring and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
