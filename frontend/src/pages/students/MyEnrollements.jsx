import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContextProvider';
import { useAuth } from '../../context/AuthContext';

const MyEnrollments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { allCourses, calculateRating } = useContext(AppContext);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, completed, in-progress

  useEffect(() => {
    if (allCourses.length > 0 && user) {
      // Filter courses where user is enrolled
      let userEnrolledCourses = allCourses.filter(course => 
        course.enrolledStudents?.includes(user.id)
      );
      
      // For demo purposes, if no enrolled courses found, enroll user in first 3 courses
      if (userEnrolledCourses.length === 0 && allCourses.length > 0) {
        userEnrolledCourses = allCourses.slice(0, 3).map(course => ({
          ...course,
          enrolledStudents: [...(course.enrolledStudents || []), user.id]
        }));
      }
      
      setEnrolledCourses(userEnrolledCourses);
      setLoading(false);
    }
  }, [allCourses, user]);

  const calculateProgress = (course) => {
    // Mock progress calculation - in real app, this would come from user progress data
    const totalLectures = course.courseContent?.reduce((total, chapter) => 
      total + (chapter.chapterContent?.length || 0), 0
    ) || 0;
    
    // Create consistent pseudo-random progress based on course ID and user ID
    // This ensures the same progress is shown each time for the same course
    if (!user || totalLectures === 0) return 0;
    
    const seed = (course._id?.toString() + user.id).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const pseudoRandom = Math.abs(seed) % 100;
    const progressVariants = [15, 35, 60, 85, 100];
    const selectedProgress = progressVariants[pseudoRandom % progressVariants.length];
    
    return Math.min(selectedProgress, 100);
  };

  const continueLearning = (course) => {
    try {
      // Navigate to first chapter and lecture
      const firstChapter = course.courseContent?.[0];
      const firstLecture = firstChapter?.chapterContent?.[0];
      
      if (firstChapter && firstLecture) {
        const courseId = course._id;
        const chapterId = firstChapter.chapterId || firstChapter.title || '1';
        const lectureId = firstLecture.lectureId || firstLecture.title || '1';
        
        navigate(`/player/${courseId}/${encodeURIComponent(chapterId)}/${encodeURIComponent(lectureId)}`);
      } else {
        // Fallback: navigate to course detail page
        navigate(`/course-detail/${course._id}`);
      }
    } catch (error) {
      console.error('Error navigating to player:', error);
      navigate(`/course-detail/${course._id}`);
    }
  };

  const filteredCourses = enrolledCourses.filter(course => {
    const progress = calculateProgress(course);
    switch (filter) {
      case 'completed':
        return progress >= 100;
      case 'in-progress':
        return progress > 0 && progress < 100;
      default:
        return true;
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-8">Please sign in to view your enrolled courses.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning</h1>
              <p className="text-gray-600">
                {enrolledCourses.length} {enrolledCourses.length === 1 ? 'course' : 'courses'} enrolled
              </p>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { key: 'all', label: 'All Courses' },
                { key: 'in-progress', label: 'In Progress' },
                { key: 'completed', label: 'Completed' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === tab.key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6">
              <svg className="w-24 h-24 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {filter === 'completed' ? 'No completed courses yet' :
               filter === 'in-progress' ? 'No courses in progress' :
               'No enrolled courses'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' ? 
                "You haven't enrolled in any courses yet. Explore our course catalog to start learning!" :
                `Switch to 'All Courses' to see your enrolled courses.`}
            </p>
            {filter === 'all' && (
              <Link
                to="/course-list"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-block"
              >
                Browse Courses
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const progress = calculateProgress(course);
              const rating = calculateRating(course);
              const totalLectures = course.courseContent?.reduce((total, chapter) => 
                total + (chapter.chapterContent?.length || 0), 0
              ) || 0;
              
              return (
                <div key={course._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Course Image */}
                  <div className="relative">
                    <img 
                      src={course.courseThumbnail || '/api/placeholder/400/200'} 
                      alt={course.courseTitle}
                      className="w-full h-48 object-cover"
                    />
                    
                    {/* Progress Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="flex items-center justify-between text-white text-sm mb-2">
                        <span>{Math.round(progress)}% complete</span>
                        <span>{totalLectures} lectures</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {progress >= 100 ? (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Completed
                        </span>
                      ) : progress > 0 ? (
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          In Progress
                        </span>
                      ) : (
                        <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Not Started
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Course Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {course.courseTitle}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{rating.toFixed(1)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{course.courseContent?.length || 0} chapters</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => continueLearning(course)}
                        className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V11z" />
                        </svg>
                        {progress > 0 ? 'Continue' : 'Start'}
                      </button>
                      
                      <Link
                        to={`/course-detail/${course._id}`}
                        className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEnrollments;