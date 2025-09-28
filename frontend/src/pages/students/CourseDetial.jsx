import React, { useContext, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContextProvider";
import { assets } from "../../assets/assets";
import { useAuth } from "../../context/AuthContext";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courseData, setCourseData] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const { allCourses, nofolectures, calculateChapterTime, currency } = useContext(AppContext);
  useEffect(() => {
    if (allCourses.length > 0) {
      const findcourse = allCourses.find((course) => course._id === id);
      setCourseData(findcourse || null);
      
      // Check if user is enrolled
      if (findcourse && user) {
        const userEnrolled = findcourse.enrolledStudents?.includes(user.id) || false;
        setIsEnrolled(userEnrolled);
      }
    }
  }, [allCourses, id, user]);

  // Handle course enrollment
  const handleEnrollment = async () => {
    if (!user) {
      alert('Please sign in to enroll in this course');
      return;
    }

    setEnrollmentLoading(true);
    try {
      // Simulate enrollment API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state (in real app, this would update the backend)
      if (courseData && !isEnrolled) {
        courseData.enrolledStudents = courseData.enrolledStudents || [];
        if (!courseData.enrolledStudents.includes(user.id)) {
          courseData.enrolledStudents.push(user.id);
        }
        setIsEnrolled(true);
        alert('Successfully enrolled in the course!');
      }
    } catch (error) {
      console.error('Enrollment failed:', error);
      alert('Enrollment failed. Please try again.');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  // Handle course access
  const handleCourseAccess = () => {
    if (!user) {
      alert('Please sign in to access this course');
      return;
    }

    if (!isEnrolled && courseData?.coursePrice > 0) {
      alert('Please enroll in this course to access the content');
      return;
    }

    // Navigate to player with course and first lecture
    const firstChapter = courseData?.courseContent?.[0];
    const firstLecture = firstChapter?.chapterContent?.[0];
    
    if (firstLecture) {
      navigate(`/player/${id}/${encodeURIComponent(firstChapter.chapterId)}/${encodeURIComponent(firstLecture.lectureId)}`);
    }
  };

  // Handle preview access
  const handlePreviewAccess = (chapterId, lectureId) => {
    navigate(`/player/${id}/${encodeURIComponent(chapterId)}/${encodeURIComponent(lectureId)}?preview=true`);
  };

  // Check if course is free
  const isFreeAccess = courseData?.coursePrice === 0 || courseData?.coursePrice === null;
  
  // Check if user can access content
  const canAccessContent = isFreeAccess || isEnrolled;
  // Loading state
  if (!courseData && allCourses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading course details...</p>
        </div>
      </div>
    );
  }

  // Course not found
  if (allCourses.length > 0 && !courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">📚</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Course Not Found</h2>
          <p className="text-gray-600 mb-8">The course you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const enrolledCount = courseData?.enrolledStudents?.length || 0;
  const originalPrice = courseData?.coursePrice || 0;
  const discount = courseData?.discount || 0;
  const discountedPrice = originalPrice - (originalPrice * discount / 100);
  const totalLectures = courseData ? nofolectures(courseData) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <div className="flex items-center gap-2 text-blue-200 mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-sm font-medium">Online Course</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                  {courseData?.courseTitle}
                </h1>
                <div 
                  className="text-lg text-blue-100 leading-relaxed mb-8 max-w-3xl"
                  dangerouslySetInnerHTML={{
                    __html: courseData?.courseDescription?.slice(0, 200) + '...' || '',
                  }}
                />
              </div>
              
              {/* Course Stats */}
              <div className="flex flex-wrap gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>4.8 (2,847 reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-2.196a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                  <span>{enrolledCount.toLocaleString()} students enrolled</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>{totalLectures} lectures</span>
                </div>
              </div>
            </div>

            {/* Course Thumbnail - Mobile/Tablet */}
            <div className="lg:hidden">
              <img 
                src={courseData?.courseThumbnail} 
                alt={courseData?.courseTitle}
                className="w-full h-64 object-cover rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Description */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Course Overview
              </h2>
              <div 
                className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: courseData?.courseDescription || '' }}
              />
            </div>

            {/* Course Content */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Course Structure
                <span className="text-sm font-normal text-gray-500 ml-auto">
                  {courseData?.courseContent?.length || 0} chapters • {totalLectures} lectures
                </span>
              </h2>
              
              <div className="space-y-4">
                {courseData?.courseContent?.map((chapter, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {chapter.chapterTitle}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {calculateChapterTime(chapter)}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            {chapter.chapterContent?.length || 0} lectures
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-6 py-4">
                      <div className="space-y-3">
                        {chapter.chapterContent?.map((lecture, lecIndex) => (
                          <div key={lecIndex} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <img src={assets.play_icon} alt="" className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{lecture.lectureTitle}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-sm text-gray-500">{lecture.lectureDuration} mins</span>
                                  {lecture.isPreviewFree && (
                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                      Free Preview
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {lecture.isPreviewFree ? (
                              <button 
                                onClick={() => handlePreviewAccess(chapter.chapterId, lecture.lectureId)}
                                className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V11z" />
                                </svg>
                                Preview
                              </button>
                            ) : canAccessContent ? (
                              <button 
                                onClick={() => handlePreviewAccess(chapter.chapterId, lecture.lectureId)}
                                className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V11z" />
                                </svg>
                                Watch
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 text-gray-400 text-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Locked
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Course Thumbnail - Desktop */}
              <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden">
                <img 
                  src={courseData?.courseThumbnail} 
                  alt={courseData?.courseTitle}
                  className="w-full h-48 object-cover"
                />
              </div>

              {/* Purchase Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                {/* Limited Time Offer */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <img src={assets.time_left_clock_icon} alt="" className="w-5 h-5" />
                    <span className="font-semibold text-sm">Limited Time Offer</span>
                  </div>
                  <p className="text-red-600 text-sm">5 days left at this price!</p>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-3 mb-2">
                    {isFreeAccess ? (
                      <span className="text-3xl font-bold text-green-600">
                        FREE
                      </span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-gray-900">
                          {currency}{discountedPrice.toFixed(2)}
                        </span>
                        {discount > 0 && (
                          <span className="text-xl text-gray-500 line-through">
                            {currency}{originalPrice.toFixed(2)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {isFreeAccess && (
                      <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">
                        FREE COURSE
                      </span>
                    )}
                    {isEnrolled && (
                      <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
                        ENROLLED
                      </span>
                    )}
                    {discount > 0 && !isFreeAccess && (
                      <>
                        <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">
                          {discount}% OFF
                        </span>
                        <span className="text-green-600 text-sm font-medium">
                          Save {currency}{(originalPrice * discount / 100).toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mb-6">
                  {isFreeAccess ? (
                    <button 
                      onClick={handleCourseAccess}
                      className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V11z" />
                      </svg>
                      Start Free Course
                    </button>
                  ) : isEnrolled ? (
                    <button 
                      onClick={handleCourseAccess}
                      className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V11z" />
                      </svg>
                      Continue Learning
                    </button>
                  ) : (
                    <button 
                      onClick={handleEnrollment}
                      disabled={enrollmentLoading}
                      className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {enrollmentLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Enroll Now
                        </>
                      )}
                    </button>
                  )}
                  
                  <button className="w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Add to Wishlist
                  </button>
                </div>

                {/* Course Features */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 mb-3">This course includes:</h4>
                  
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>{totalLectures} on-demand video lectures</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span>Mobile and desktop access</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Lifetime access</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </div>

                {/* 30-Day Guarantee */}
                <div className="border-t border-gray-200 pt-4 mt-6">
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    30-Day Money-Back Guarantee
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
