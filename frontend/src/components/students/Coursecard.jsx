import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'
import { AppContext } from '../../context/AppContextProvider'

const CourseCard = ({ course }) => {
    const context = useContext(AppContext)
    const { currency } = context
    
    if (!course) return null

    const discountedPrice = course.coursePrice ? 
        (course.coursePrice - (course.discount || 0) * course.coursePrice / 100).toFixed(2) : 
        '0.00'

    // Use direct course rating or default value
    const rating = course.rating || 4.5
    const reviewCount = course.reviewCount || 22
    
    // Debug log to check what we're getting from context
    console.log('Context values:', context)

   
    return (
        <Link 
            to={`/course-detail/${course._id || course.id}`}
            className="group block bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
        >
            {/* Course Thumbnail */}
            <div className="relative overflow-hidden">
                <img 
                    src={course.courseThumbnail || '/placeholder-course.jpg'} 
                    alt={course.courseTitle || 'Course thumbnail'}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {course.discount && course.discount > 0 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                        {course.discount}% OFF
                    </div>
                )}
            </div>

            {/* Course Content */}
            <div className="p-5">
                {/* Course Title */}
                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.courseTitle || 'Course Title'}
                </h3>
                
                {/* Educator Name */}
                <p className="text-sm text-gray-600 mb-3">
                    By {course.educator?.name || course.instructorName || 'Unknown Instructor'}
                </p>
                
                {/* Rating Section */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-yellow-600 font-semibold text-sm">{rating}</span>
                    <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => {
                            const isFilled = i < Math.floor(rating);
                            const isHalfFilled = i === Math.floor(rating) && rating % 1 >= 0.5;
                            
                            return (
                                <div key={i} className="relative">
                                    <img 
                                        src={assets.star_dull_icon} 
                                        alt="star outline" 
                                        className="w-4 h-4"
                                    />
                                    {(isFilled || isHalfFilled) && (
                                        <img 
                                            src={assets.rating_star} 
                                            alt="star filled" 
                                            className={`absolute top-0 left-0 w-4 h-4 ${
                                                isHalfFilled ? 'clip-path-half' : ''
                                            }`}
                                            style={isHalfFilled ? { clipPath: 'inset(0 50% 0 0)' } : {}}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <span className="text-gray-500 text-sm">({reviewCount} reviews)</span>
                </div>
                
                {/* Price Section */}
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-800">
                        {currency}{discountedPrice}
                    </span>
                    {course.discount && course.discount > 0 && (
                        <span className="text-sm text-gray-500 line-through">
                            {currency}{course.coursePrice?.toFixed(2)}
                        </span>
                    )}
                </div>

                {/* Course Level/Category (if available) */}
                {course.level && (
                    <div className="mt-3">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                            {course.level}
                        </span>
                    </div>
                )}
            </div>
        </Link>
    )
}

export default CourseCard
