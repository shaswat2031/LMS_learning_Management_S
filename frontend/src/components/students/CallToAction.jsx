import React from 'react'
import { Link } from 'react-router-dom'

const CallToAction = () => {
  return (
    <div className='bg-blue-600 py-16 px-4'>
      <div className='max-w-4xl mx-auto text-center text-white'>
        <h2 className='text-3xl md:text-4xl font-bold mb-4'>
          Ready to Start Learning?
        </h2>
        <p className='text-lg mb-8 opacity-90'>
          Join thousands of students and transform your career today
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link 
            to='/course-list'
            className='bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors'
          >
            Browse Courses
          </Link>
          <Link 
            to='/educator'
            className='border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors'
          >
            Become Instructor
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CallToAction
