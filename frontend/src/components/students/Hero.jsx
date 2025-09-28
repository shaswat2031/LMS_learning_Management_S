import React from 'react'
import SearchBar from '../students/SearchBar'

const Hero = () => {
  return (
    <div className='relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-20 md:py-32 bg-gray-50 overflow-hidden'>
      {/* Content */}
      <div className='relative z-10 max-w-5xl mx-auto'>
        {/* Main heading */}
        <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight max-w-4xl mx-auto'>
          Empower your future with the courses designed to{' '}
          <span className='text-blue-600 relative inline-block'>
            fit your choice
            {/* Underline decoration */}
            <div className='absolute -bottom-1 left-0 right-0 h-3 bg-blue-200 opacity-60 rounded-full'></div>
          </span>
          .
        </h1>

        {/* Description paragraph */}
        <div className='mb-12'>
          <p className='text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
            We bring together world-class instructors, interactive content, and a supportive community to help you achieve your personal and professional goals.
          </p>
          <SearchBar showDropdown={false} />
        </div>

        
      </div>
    </div>
  )
}

export default Hero
