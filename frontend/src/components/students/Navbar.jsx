import React, { useState, useEffect, useContext } from 'react'
import { assets } from '../../assets/assets.js'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { AppContext } from '../../context/AppContextProvider.jsx'
import AuthModal from '../auth/AuthModal.jsx'

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isCourseListPage = location.pathname.includes('/course-list')
  const { setIsEducator } = useContext(AppContext)

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isMobileMenuOpen])

  return (
    <>
      <nav className={`flex items-center justify-between px-4 py-3 shadow-sm relative z-50 ${isCourseListPage ? 'bg-blue-50' : 'bg-white'}`}>
        <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
          <img onClick={() => navigate('/')} src={assets.logo} alt="Logo" className='w-28 lg:w-32 cursor-pointer'/>
        </Link>
        
        {/* Desktop Menu */}
        <div className='hidden md:flex items-center gap-4'> 
          {user && (
            <Link 
              to={user.role === 'educator' ? '/educator' : '/educator'} 
              className='text-gray-600 hover:text-blue-600 transition-colors'
            >
              {user.role === 'educator' ? 'Educator Dashboard' : 'Become Educator'}
            </Link>
          )}
          
          {isAuthenticated && (
            <Link to='/my-enrollments' className='text-gray-600 hover:text-blue-600 transition-colors'>
              My Enrollments
            </Link>
          )}
          
          {isCourseListPage && (
            <Link to='/course-list' className='text-blue-600 font-medium'>
              Courses
            </Link>
          )}
          
          <div className='flex items-center gap-3'>
            {isAuthenticated ? (
              <div className='flex items-center gap-2'>
                <span className='text-sm text-gray-600'>Hi, {user?.firstName}</span>
                <div className='relative'>
                  <button 
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium hover:bg-blue-200 transition-colors'
                  >
                    {user?.firstName?.[0]?.toUpperCase()}
                  </button>
                  {isUserDropdownOpen && (
                    <div className='absolute right-0 top-10 bg-white shadow-lg rounded-lg py-2 min-w-[150px] border'>
                      <Link 
                        to='/profile' 
                        className='block px-4 py-2 text-gray-700 hover:bg-gray-100'
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <button 
                        onClick={() => { logout(); setIsUserDropdownOpen(false); }}
                        className='block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100'
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)} 
                className='bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors'
              >
                Create Account
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className='md:hidden p-2 text-gray-600 hover:text-gray-800'
        >
          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            {isMobileMenuOpen ? (
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            ) : (
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden'>
          <div className='fixed top-0 right-0 h-full w-80 max-w-[85%] bg-white shadow-xl transform transition-transform duration-300'>
            <div className='p-4 border-b'>
              <img src={assets.logo} alt="Logo" className='w-24'/>
            </div>
            
            <div className='p-4 space-y-4'>
              {isAuthenticated && (
                <div className='flex items-center gap-3 pb-4 border-b'>
                  <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium'>
                    {user?.firstName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className='font-medium'>{user?.firstName} {user?.lastName}</p>
                    <p className='text-sm text-gray-500'>{user?.email}</p>
                  </div>
                </div>
              )}
              
              {user && (
                <Link 
                  to={user.role === 'educator' ? '/educator' : '/educator'} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className='block py-2 text-gray-700 hover:text-blue-600'
                >
                  {user.role === 'educator' ? 'Educator Dashboard' : 'Become Educator'}
                </Link>
              )}
              
              {isAuthenticated && (
                <Link to='/my-enrollments' onClick={() => setIsMobileMenuOpen(false)}
                  className='block py-2 text-gray-700 hover:text-blue-600'>
                  My Enrollments
                </Link>
              )}
              
              {isCourseListPage && (
                <Link to='/course-list' onClick={() => setIsMobileMenuOpen(false)}
                  className='block py-2 text-blue-600 font-medium'>
                  Courses
                </Link>
              )}
              
              <div className='pt-4 space-y-3'>
                {isAuthenticated ? (
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className='w-full py-2 border border-red-500 text-red-500 rounded-full hover:bg-red-50'>
                    Sign Out
                  </button>
                ) : (
                  <button onClick={() => { setShowAuthModal(true); setIsMobileMenuOpen(false); }}
                    className='w-full py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700'>
                    Create Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode="login"
      />
    </>
  )
}

export default Navbar
