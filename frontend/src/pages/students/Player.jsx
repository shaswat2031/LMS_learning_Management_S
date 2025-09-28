import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext } from '../../context/AppContextProvider';
import { useAuth } from '../../context/AuthContext';
import YouTube from 'react-youtube';

const Player = () => {
  const { courseId, chapterId, lectureId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  
  const { allCourses, calculateChapterTime } = useContext(AppContext);
  const [courseData, setCourseData] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedLectures, setCompletedLectures] = useState(new Set());

  useEffect(() => {
    if (allCourses.length > 0 && courseId) {
      const course = allCourses.find(c => c._id === courseId);
      if (course) {
        setCourseData(course);
        
        // Decode URL parameters to handle special characters
        const decodedChapterId = decodeURIComponent(chapterId);
        const decodedLectureId = decodeURIComponent(lectureId);
        
        // Find current chapter and lecture
        const chapter = course.courseContent?.find(ch => ch.chapterId === decodedChapterId);
        const lecture = chapter?.chapterContent?.find(lec => lec.lectureId === decodedLectureId);
        
        setCurrentChapter(chapter);
        setCurrentLecture(lecture);
        
        // Check access permissions
        if (!isPreview && course.coursePrice > 0) {
          const isEnrolled = course.enrolledStudents?.includes(user?.id);
          if (!isEnrolled && !lecture?.isPreviewFree) {
            alert('Access denied. Please enroll in this course.');
            navigate(`/course-detail/${courseId}`);
            return;
          }
        }
      }
    }
  }, [allCourses, courseId, chapterId, lectureId, user, isPreview, navigate]);

  const handleLectureComplete = () => {
    if (currentLecture) {
      setCompletedLectures(prev => new Set([...prev, currentLecture.lectureId]));
    }
  };

  const navigateToLecture = (newChapterId, newLectureId) => {
    const searchQuery = isPreview ? '?preview=true' : '';
    navigate(`/player/${courseId}/${encodeURIComponent(newChapterId)}/${encodeURIComponent(newLectureId)}${searchQuery}`);
  };

  const getNextLecture = () => {
    if (!courseData || !currentChapter || !currentLecture) return null;
    
    const currentChapterIndex = courseData.courseContent.findIndex(ch => ch.chapterId === currentChapter.chapterId);
    const currentLectureIndex = currentChapter.chapterContent.findIndex(lec => lec.lectureId === currentLecture.lectureId);
    
    // Next lecture in same chapter
    if (currentLectureIndex < currentChapter.chapterContent.length - 1) {
      return {
        chapter: currentChapter,
        lecture: currentChapter.chapterContent[currentLectureIndex + 1]
      };
    }
    
    // First lecture of next chapter
    if (currentChapterIndex < courseData.courseContent.length - 1) {
      const nextChapter = courseData.courseContent[currentChapterIndex + 1];
      return {
        chapter: nextChapter,
        lecture: nextChapter.chapterContent[0]
      };
    }
    
    return null;
  };

  const getPreviousLecture = () => {
    if (!courseData || !currentChapter || !currentLecture) return null;
    
    const currentChapterIndex = courseData.courseContent.findIndex(ch => ch.chapterId === currentChapter.chapterId);
    const currentLectureIndex = currentChapter.chapterContent.findIndex(lec => lec.lectureId === currentLecture.lectureId);
    
    // Previous lecture in same chapter
    if (currentLectureIndex > 0) {
      return {
        chapter: currentChapter,
        lecture: currentChapter.chapterContent[currentLectureIndex - 1]
      };
    }
    
    // Last lecture of previous chapter
    if (currentChapterIndex > 0) {
      const prevChapter = courseData.courseContent[currentChapterIndex - 1];
      return {
        chapter: prevChapter,
        lecture: prevChapter.chapterContent[prevChapter.chapterContent.length - 1]
      };
    }
    
    return null;
  };

  const extractYouTubeId = (url) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url?.match(regex);
    return match ? match[1] : null;
  };

  const nextLecture = getNextLecture();
  const previousLecture = getPreviousLecture();

  if (!courseData || !currentChapter || !currentLecture) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading course content...</p>
        </div>
      </div>
    );
  }

  const youtubeId = extractYouTubeId(currentLecture.lectureUrl);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Course Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-gray-800 overflow-hidden flex-shrink-0`}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white truncate">{courseData.courseTitle}</h3>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {isPreview && (
            <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-3 mb-4">
              <p className="text-yellow-200 text-sm">
                🎥 Preview Mode - Limited Access
              </p>
            </div>
          )}
        </div>
        
        <div className="overflow-y-auto h-full pb-20">
          {courseData.courseContent?.map((chapter, chapterIndex) => (
            <div key={chapter.chapterId} className="border-b border-gray-700 last:border-b-0">
              <div className="p-4 bg-gray-750">
                <h4 className="font-medium text-gray-200 mb-2">
                  Chapter {chapterIndex + 1}: {chapter.chapterTitle}
                </h4>
                <p className="text-sm text-gray-400">
                  {chapter.chapterContent?.length} lectures • {calculateChapterTime(chapter)}
                </p>
              </div>
              
              <div className="space-y-1">
                {chapter.chapterContent?.map((lecture, lectureIndex) => {
                  const isCurrentLecture = lecture.lectureId === currentLecture.lectureId;
                  const isCompleted = completedLectures.has(lecture.lectureId);
                  const canAccess = isPreview ? lecture.isPreviewFree : true;
                  
                  return (
                    <button
                      key={lecture.lectureId}
                      onClick={() => canAccess && navigateToLecture(chapter.chapterId, lecture.lectureId)}
                      disabled={!canAccess}
                      className={`w-full text-left p-3 hover:bg-gray-700 transition-colors flex items-center gap-3 ${
                        isCurrentLecture ? 'bg-blue-600' : ''
                      } ${!canAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : isCurrentLecture ? (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V11z" />
                            </svg>
                          </div>
                        ) : canAccess ? (
                          <div className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          </div>
                        ) : (
                          <div className="w-6 h-6 flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${isCurrentLecture ? 'text-white' : 'text-gray-300'}`}>
                          {lectureIndex + 1}. {lecture.lectureTitle}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{lecture.lectureDuration} min</span>
                          {lecture.isPreviewFree && (
                            <span className="text-xs bg-green-600 text-white px-1 py-0.5 rounded">FREE</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            
            <div>
              <h2 className="font-semibold text-white">{currentLecture.lectureTitle}</h2>
              <p className="text-sm text-gray-400">
                {currentChapter.chapterTitle} • {currentLecture.lectureDuration} minutes
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate(`/course-detail/${courseId}`)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
            >
              Back to Course
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="flex-1 bg-black flex items-center justify-center relative">
          {youtubeId ? (
            <YouTube
              videoId={youtubeId}
              opts={{
                width: '100%',
                height: '100%',
                playerVars: {
                  autoplay: 1,
                  rel: 0,
                  modestbranding: 1,
                },
              }}
              onEnd={handleLectureComplete}
              className="w-full h-full"
            />
          ) : (
            <div className="text-center text-gray-400">
              <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-lg">Video not available</p>
              <p className="text-sm">Please check the lecture URL</p>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => previousLecture && navigateToLecture(previousLecture.chapter.chapterId, previousLecture.lecture.lectureId)}
              disabled={!previousLecture}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <button
              onClick={handleLectureComplete}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-medium"
            >
              Mark Complete
            </button>

            <button
              onClick={() => nextLecture && navigateToLecture(nextLecture.chapter.chapterId, nextLecture.lecture.lectureId)}
              disabled={!nextLecture}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
