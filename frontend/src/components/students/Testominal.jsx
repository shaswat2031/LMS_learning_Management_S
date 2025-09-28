import React from 'react'
import { assets } from '../../assets/assets'

const Testimonial = () => {
  // Sample testimonial data
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Software Developer",
      image: assets.profile_img || "/default-avatar.jpg",
      rating: 5,
      text: "The courses here completely transformed my career. The instructors are amazing and the content is always up-to-date with industry standards."
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Data Analyst",
      image: assets.profile_img2 || "/default-avatar.jpg",
      rating: 5,
      text: "I went from zero coding knowledge to landing my dream job in just 6 months. The step-by-step approach really works!"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "UX Designer",
      image: assets.profile_img3 || "/default-avatar.jpg",
      rating: 5,
      text: "Excellent platform with practical projects. The community support and mentor guidance made all the difference in my learning journey."
    }
  ]

  return (
    <div className='py-16 px-4 bg-gray-50'>
      <div className='max-w-6xl mx-auto'>
        {/* Section Header */}
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-800 mb-4'>
            What Our Students Say
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Join thousands of successful graduates who transformed their careers with our courses
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className='bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300'
            >
              {/* Stars Rating */}
              <div className='flex items-center mb-4'>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <img 
                    key={i}
                    src={assets.rating_star}
                    alt="star"
                    className='w-5 h-5'
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className='text-gray-700 mb-6 leading-relaxed'>
                "{testimonial.text}"
              </p>

              {/* User Info */}
              <div className='flex items-center'>
                <img 
                  src={testimonial.image}
                  alt={testimonial.name}
                  className='w-12 h-12 rounded-full object-cover mr-4'
                />
                <div>
                  <h4 className='font-semibold text-gray-800'>
                    {testimonial.name}
                  </h4>
                  <p className='text-sm text-gray-500'>
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className='mt-16 text-center'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div>
              <div className='text-3xl font-bold text-blue-600 mb-2'>95%</div>
              <div className='text-gray-600'>Success Rate</div>
            </div>
            
            <div>
              <div className='text-3xl font-bold text-blue-600 mb-2'>10k+</div>
              <div className='text-gray-600'>Happy Students</div>
            </div>
            
            <div>
              <div className='text-3xl font-bold text-blue-600 mb-2'>4.8/5</div>
              <div className='text-gray-600'>Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Testimonial
