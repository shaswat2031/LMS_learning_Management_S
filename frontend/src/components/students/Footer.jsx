import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'

const Footer = () => {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    console.log('Subscribe email:', email)
    setEmail('')
    // Add success message or API call here
  }

  return (
    <footer className='bg-gray-900 text-white'>
      <div className='max-w-7xl mx-auto'>
        {/* Main Footer Content */}
        <div className='px-6 py-16'>
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-12'>
            
            {/* Company Info - Takes more space */}
            <div className='lg:col-span-5'>
              <div className='flex items-center mb-6'>
                <img src={assets.logo} alt="Edemy" className='w-10 h-10 mr-3' />
                <h3 className='text-2xl font-bold text-white'>Edemy</h3>
              </div>
              <p className='text-gray-300 leading-relaxed text-base mb-6 max-w-md'>
                Transform your career with world-class online courses. Learn from industry experts and join thousands of successful graduates.
              </p>
              
              {/* Social Media Icons */}
              <div className='flex space-x-4'>
                <a href='#' className='w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300'>
                  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z'/>
                  </svg>
                </a>
                <a href='#' className='w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300'>
                  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z'/>
                  </svg>
                </a>
                <a href='#' className='w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300'>
                  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Company Links */}
            <div className='lg:col-span-3'>
              <h4 className='text-lg font-semibold mb-6 text-white'>Company</h4>
              <div className='space-y-4'>
                <Link to='/' className='block text-gray-300 hover:text-blue-400 transition-colors duration-200 text-base'>
                  Home
                </Link>
                <Link to='/about' className='block text-gray-300 hover:text-blue-400 transition-colors duration-200 text-base'>
                  About Us
                </Link>
                <Link to='/courses' className='block text-gray-300 hover:text-blue-400 transition-colors duration-200 text-base'>
                  Courses
                </Link>
                <Link to='/contact' className='block text-gray-300 hover:text-blue-400 transition-colors duration-200 text-base'>
                  Contact Us
                </Link>
                <Link to='/privacy' className='block text-gray-300 hover:text-blue-400 transition-colors duration-200 text-base'>
                  Privacy Policy
                </Link>
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className='lg:col-span-4'>
              <h4 className='text-lg font-semibold mb-6 text-white'>Stay Updated</h4>
              <p className='text-gray-300 mb-6 text-base leading-relaxed'>
                Get the latest courses, articles, and career tips delivered to your inbox weekly.
              </p>
              
              <form onSubmit={handleSubscribe} className='space-y-4'>
                <div className='relative'>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='Enter your email address'
                    className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-700 transition-all duration-200'
                    required
                  />
                </div>
                <button
                  type='submit'
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900'
                >
                  Subscribe Now
                </button>
              </form>
              
              <p className='text-xs text-gray-400 mt-3'>
                No spam. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Section */}
        <div className='border-t border-gray-800 px-6 py-6'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <p className='text-gray-400 text-sm mb-4 md:mb-0'>
              © 2024 Edemy. All rights reserved.
            </p>
            <div className='flex space-x-6 text-sm'>
              <Link to='/terms' className='text-gray-400 hover:text-blue-400 transition-colors'>
                Terms of Service
              </Link>
              <Link to='/privacy' className='text-gray-400 hover:text-blue-400 transition-colors'>
                Privacy Policy
              </Link>
              <Link to='/cookies' className='text-gray-400 hover:text-blue-400 transition-colors'>
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
