import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContextProvider";
import SearchBar from "../../components/students/SearchBar";
import { useSearchParams, Link } from "react-router-dom";
import CourseCard from "../../components/students/coursecard";
import Footer from "../../components/students/Footer";

const CourseList = () => {
  const { allCourses } = useContext(AppContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get('search') || '';
  
  const [currentSearchQuery, setCurrentSearchQuery] = useState(urlSearchQuery);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [sortBy, setSortBy] = useState('popular');

  // Handle real-time search without URL updates
  const handleRealTimeSearch = (query) => {
    setCurrentSearchQuery(query);
  };

  // Filter and sort courses
  useEffect(() => {
    let filtered = [...allCourses];
    
    // Apply search filter
    if (currentSearchQuery) {
      const lowercasedInput = currentSearchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.courseTitle?.toLowerCase().includes(lowercasedInput) ||
        course.educator?.name?.toLowerCase().includes(lowercasedInput) ||
        course.instructorName?.toLowerCase().includes(lowercasedInput) ||
        course.category?.toLowerCase().includes(lowercasedInput)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default: // popular
        filtered.sort((a, b) => (b.students || 0) - (a.students || 0));
    }

    setFilteredCourses(filtered);
  }, [currentSearchQuery, allCourses, sortBy]);

  // Update internal search when URL changes
  useEffect(() => {
    setCurrentSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Amazing Courses
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              Explore our comprehensive collection of courses and start learning today
            </p>
            
            {/* Breadcrumb */}
            <div className="flex items-center justify-center text-blue-200 mb-8">
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white">Courses</span>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <SearchBar 
              data={currentSearchQuery} 
              onRealTimeSearch={handleRealTimeSearch}
              showDropdown={true}
            />
          </div>
        </div>
      </div>

      {/* Course Results */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Results Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {currentSearchQuery ? `Search Results for "${currentSearchQuery}"` : 'All Courses'}
            </h2>
            <p className="text-gray-600">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} available
              {currentSearchQuery && (
                <span className="ml-2">
                  • Real-time results
                </span>
              )}
            </p>
          </div>
          
          {/* Filter/Sort Options */}
          <div className="flex items-center gap-4">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="popular">Sort by: Popular</option>
              <option value="newest">Sort by: Newest</option>
              <option value="rating">Sort by: Rating</option>
              <option value="price-high">Sort by: Price: High to Low</option>
            </select>
            
            {/* Clear Search Button */}
            {currentSearchQuery && (
              <button
                onClick={() => {
                  setCurrentSearchQuery('');
                  setSearchParams({});
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>

        {/* Course Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course._id || course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mb-6">
              <svg className="w-24 h-24 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">
              {currentSearchQuery ? 
                `Sorry, we couldn't find any courses matching "${currentSearchQuery}". Try adjusting your search or browse all courses.` : 
                'No courses are available at the moment.'}
            </p>
            {currentSearchQuery && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={() => {
                    setCurrentSearchQuery('');
                    setSearchParams({});
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View All Courses
                </button>
                <button 
                  onClick={() => setCurrentSearchQuery('')}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
    
  );
};

export default CourseList;
