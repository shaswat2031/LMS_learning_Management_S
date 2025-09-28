import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../../context/AppContextProvider'
import CourseCard from './coursecard'

const CourseSection = () => {
  const { allCourses } = useContext(AppContext)
  return (
    <div className='relative py-20 md:py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 overflow-hidden'>
      {/* Background decorative elements */}
      <div className='absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob'></div>
      <div className='absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000'></div>
      <div className='absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000'></div>
      
      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-16'>
          {/* Main heading with gradient text */}
          <h2 className='text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight'>
            Learn From The Best
          </h2>
          
          {/* Subtitle */}
          <p className='text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-4 leading-relaxed'>
            Our courses are designed and taught by industry experts who bring real-world experience to every lesson.
          </p>
          
          {/* Additional description */}
          <p className='text-base md:text-lg text-gray-500 max-w-2xl mx-auto mb-12'>
            Join thousands of students who have transformed their careers with our comprehensive learning platform.
          </p>

          {/* Featured Courses Grid */}
          {allCourses && allCourses.length > 0 && (
            <div className='mb-16'>
              <h3 className='text-2xl font-semibold text-gray-800 mb-8'>Featured Courses</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto'>
                {allCourses.slice(0, 4).map(course => (
                  <CourseCard key={course._id || course.id} course={course} />
                ))}
              </div>
            </div>
          )}

          {/* Enhanced CTA button */}
          <div className='flex justify-center'>
            <Link 
              to="/course-list" 
              onClick={() => window.scrollTo(0, 0)}
              className='group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300'
            >
              <span>Explore All Courses</span>
              <svg className='w-5 h-5 group-hover:translate-x-1 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Custom CSS moved to global styles or use Tailwind animations */}
      <style>
        {`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          
          .animate-blob {
            animation: blob 7s infinite;
          }
          
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}
      </style>
    </div>
  )
}

export default CourseSection