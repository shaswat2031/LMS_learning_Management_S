import React from 'react'
import { Routes, useMatch } from 'react-router-dom'
import { Route } from 'react-router-dom'
import Home from './pages/students/Home.jsx'
import CourseList from './pages/students/CourseList'
import CourseDetail from './pages/students/CourseDetial'
import MyEnrollements from './pages/students/MyEnrollements'
import Player from './pages/students/Player'
import Loading from './components/students/Loading.jsx'
import Educator from './pages/educator/Educator'
import Dashboard from './pages/educator/Dashboard'
import AddCourse from './pages/educator/AddCourse'
import MyCourses from './pages/educator/mycourse.jsx'
import StudentEnroll from './pages/educator/StudentEnroll'
import Navbar from './components/students/Navbar.jsx'


const App = () => {
  const  isEducatorRoute = useMatch('/educator/*');
  return (
    <div className='text-default min-h-screen bg-white'> 
      {!isEducatorRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course-list" element={<CourseList />} />
        <Route path="/course-list/:input" element={<CourseList />} />
        <Route path="/course-detail/:id" element={<CourseDetail />} />
        <Route path="/my-enrollment" element={<MyEnrollements />} />
        <Route path="/my-enrollments" element={<MyEnrollements />} />
        <Route path="/player/:courseId/:chapterId/:lectureId" element={<Player />} />
        <Route path="/loading/:path" element={<Loading />} />
        <Route path="/educator" element={<Educator />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="add-course" element={<AddCourse />} />
          <Route path="my-courses" element={<MyCourses />} />
          <Route path="student-enroll" element={<StudentEnroll />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
