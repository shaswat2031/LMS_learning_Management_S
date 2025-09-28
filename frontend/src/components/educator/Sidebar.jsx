import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { assets } from '../../assets/assets';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    {
      category: 'Overview',
      items: [
        { name: 'Dashboard', href: '/educator/educator', icon: assets.home_icon },
        { name: 'Analytics', href: '/educator/analytics', icon: '📈' },
      ]
    },
    {
      category: 'Content',
      items: [
        { name: 'My Courses', href: '/educator/my-courses', icon: assets.my_course_icon },
        { name: 'Add Course', href: '/educator/add-course', icon: assets.add_icon },
        { name: 'Course Reviews', href: '/educator/reviews', icon: '⭐' },
      ]
    },
    {
      category: 'Students',
      items: [
        { name: 'Enrollments', href: '/educator/student-enroll', icon: assets.person_tick_icon },
        { name: 'Messages', href: '/educator/messages', icon: '💬' },
        { name: 'Certificates', href: '/educator/certificates', icon: '🏆' },
      ]
    },
    {
      category: 'Business',
      items: [
        { name: 'Earnings', href: '/educator/earnings', icon: assets.earning_icon },
        { name: 'Reports', href: '/educator/reports', icon: '📊' },
        { name: 'Payments', href: '/educator/payments', icon: '💳' },
      ]
    },
    {
      category: 'Settings',
      items: [
        { name: 'Profile', href: '/educator/profile', icon: assets.user_icon },
        { name: 'Preferences', href: '/educator/preferences', icon: '⚙️' },
        { name: 'Help Center', href: '/educator/help', icon: '❓' },
      ]
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img src={assets.logo} alt="Logo" className="h-8 w-auto" />
            <div>
              <h2 className="font-semibold text-gray-900">EduPanel</h2>
              <p className="text-xs text-gray-500">Instructor</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-6">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {category.category}
              </h3>
              <ul className="space-y-1 px-2">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Link
                      to={item.href}
                      onClick={() => window.innerWidth < 1024 && onClose()}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                        isActive(item.href)
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {typeof item.icon === 'string' && item.icon.startsWith('/') ? (
                        <img 
                          src={item.icon} 
                          alt="" 
                          className={`w-5 h-5 ${isActive(item.href) ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'}`} 
                        />
                      ) : (
                        <span className="text-lg">{item.icon}</span>
                      )}
                      {item.name}
                      
                      {/* Active indicator */}
                      {isActive(item.href) && (
                        <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm">🚀</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">Upgrade Plan</h4>
                <p className="text-xs text-gray-600">Get advanced features</p>
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
