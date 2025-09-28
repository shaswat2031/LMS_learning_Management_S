import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Dashboard', href: '/educator/educator' },
      { name: 'Course Creation', href: '/educator/add-course' },
      { name: 'Analytics', href: '/educator/analytics' },
      { name: 'Student Management', href: '/educator/student-enroll' },
    ],
    support: [
      { name: 'Help Center', href: '/educator/help' },
      { name: 'Community', href: '/educator/community' },
      { name: 'Instructor Guidelines', href: '/educator/guidelines' },
      { name: 'Contact Support', href: '/educator/contact' },
    ],
    resources: [
      { name: 'Teaching Center', href: '/educator/teaching-center' },
      { name: 'Best Practices', href: '/educator/best-practices' },
      { name: 'Webinars', href: '/educator/webinars' },
      { name: 'Blog', href: '/educator/blog' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Instructor Agreement', href: '/instructor-agreement' },
      { name: 'Copyright Policy', href: '/copyright' },
    ]
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={assets.logo} alt="Logo" className="h-8 w-auto filter brightness-0 invert" />
              <div>
                <h3 className="text-xl font-bold">EduPanel</h3>
                <p className="text-sm text-gray-400">Instructor Dashboard</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Empowering educators with comprehensive tools to create, manage, and grow their online courses. 
              Join thousands of instructors building successful learning experiences.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-2xl font-bold text-blue-400">10K+</div>
                <div className="text-sm text-gray-400">Active Instructors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">500K+</div>
                <div className="text-sm text-gray-400">Students Taught</div>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                <img src={assets.facebook_icon} alt="Facebook" className="w-5 h-5 filter brightness-0 invert" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                <img src={assets.twitter_icon} alt="Twitter" className="w-5 h-5 filter brightness-0 invert" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                <img src={assets.instagram_icon} alt="Instagram" className="w-5 h-5 filter brightness-0 invert" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              © {currentYear} EduPanel. All rights reserved. Made with ❤️ for educators worldwide.
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                All systems operational
              </span>
              <Link to="/status" className="hover:text-white transition-colors">
                System Status
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
