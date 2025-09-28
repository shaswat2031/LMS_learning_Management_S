import React from 'react'
import Hero from '../../components/students/Hero'
import Companies from '../../components/students/Companies'
import CourseSection from '../../components/students/coursesection'
import Testimonial from '../../components/students/Testominal'
import CallToAction from '../../components/students/CallToAction'
import Footer from '../../components/students/Footer'

const Home = () => {
  return (
    <div className='flex flex-col item-center space-y-7 text-center'>
      <Hero />
      <Companies />
      <CourseSection />
      <Testimonial />
      <CallToAction />
      <Footer />
    </div>
  )
}

export default Home
