import React, { useState, useEffect, useContext, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContextProvider'

const SearchBar = ({ data, onRealTimeSearch, showDropdown = true }) => {
  const navigate = useNavigate()
  const { allCourses } = useContext(AppContext)
  const [input, setInput] = useState(data ? data : '')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const searchRef = useRef(null)
  const timeoutRef = useRef(null)

  // Real-time search with debouncing
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (input.trim() && showDropdown) {
        const lowercasedInput = input.toLowerCase()
        const filtered = allCourses.filter(course =>
          course.courseTitle?.toLowerCase().includes(lowercasedInput) ||
          course.educator?.name?.toLowerCase().includes(lowercasedInput) ||
          course.instructorName?.toLowerCase().includes(lowercasedInput) ||
          course.category?.toLowerCase().includes(lowercasedInput)
        ).slice(0, 8) // Limit to 8 suggestions
        
        setSuggestions(filtered)
        setShowSuggestions(filtered.length > 0)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }

      // Call real-time search callback if provided
      if (onRealTimeSearch) {
        onRealTimeSearch(input.trim())
      }
    }, 300) // 300ms debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [input, allCourses, onRealTimeSearch, showDropdown])

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const onSearchHandler = (e) => {
    e.preventDefault()
    if (input.trim()) {
      navigate(`/course-list?search=${encodeURIComponent(input.trim())}`)
    } else {
      navigate('/course-list')
    }
    setShowSuggestions(false)
    console.log('Search input:', input)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearchHandler(e)
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    setHighlightedIndex(-1)
  }

  const handleSuggestionClick = (course) => {
    setInput(course.courseTitle)
    setShowSuggestions(false)
    navigate(`/course-list?search=${encodeURIComponent(course.courseTitle)}`)
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSuggestionClick(suggestions[highlightedIndex])
        } else {
          onSearchHandler(e)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setHighlightedIndex(-1)
        break
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 relative" ref={searchRef}>
      <form 
        onSubmit={handleSubmit}
        className="max-w-xl w-full md:h-14 h-12 flex items-center bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200 relative z-20"
      >
        <img 
          src={assets.search_icon} 
          alt="search-icon" 
          className='w-5 h-5 md:w-6 md:h-6 ml-4 opacity-60' 
        />
        <input 
          type="text" 
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => input.trim() && suggestions.length > 0 && setShowSuggestions(true)}
          placeholder='Search for courses, instructors, etc.'  
          className='flex-1 h-full outline-none text-gray-700 px-4 bg-transparent placeholder-gray-400'
        />
        <button 
          type="submit" 
          className='bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 md:py-3 md:px-8 rounded-full transition-colors duration-200 mr-1 font-medium'
        >
          Search
        </button>
      </form>

      {/* Real-time Search Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && showDropdown && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-gray-500 px-3 py-2 border-b border-gray-100">
              {suggestions.length} course{suggestions.length > 1 ? 's' : ''} found
            </div>
            {suggestions.map((course, index) => (
              <div
                key={course._id || course.id || index}
                className={`flex items-center p-3 cursor-pointer transition-colors ${
                  index === highlightedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleSuggestionClick(course)}
              >
                <img 
                  src={course.image || '/api/placeholder/40/40'} 
                  alt={course.courseTitle}
                  className="w-10 h-10 rounded object-cover mr-3 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {course.courseTitle}
                  </h4>
                  <p className="text-sm text-gray-500 truncate">
                    {course.educator?.name || course.instructorName} • {course.category}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-2">
                  <span className="text-sm font-semibold text-blue-600">
                    ${course.price}
                  </span>
                </div>
              </div>
            ))}
            <div className="border-t border-gray-100 p-3">
              <Link
                to={`/course-list?search=${encodeURIComponent(input.trim())}`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center"
                onClick={() => setShowSuggestions(false)}
              >
                See all results for "{input.trim()}" →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar