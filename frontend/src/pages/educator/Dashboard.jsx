import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../services/api';
import { assets } from '../../assets/assets';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [userStatsResponse, dashboardResponse] = await Promise.all([
          userApi.getStats(),
          userApi.getDashboard()
        ]);

        if (userStatsResponse.status === 'success') {
          setStats({
            totalStudents: userStatsResponse.data.stats.teaching?.totalStudents || 0,
            totalCourses: userStatsResponse.data.stats.teaching?.totalCourses || 0,
            totalRevenue: userStatsResponse.data.stats.teaching?.totalRevenue || 0,
            monthlyGrowth: userStatsResponse.data.stats.teaching?.monthlyGrowth || 0
          });
        }

        if (dashboardResponse.status === 'success') {
          setDashboardData(dashboardResponse.data.dashboard);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, {user?.firstName || 'Educator'}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Here's what's happening with your courses today.
            </p>
          </div>
          <div className="flex gap-3">
            <Link 
              to="/educator/add-course"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <img src={assets.add_icon} alt="" className="w-5 h-5" />
              Create Course
            </Link>
            <Link 
              to="/educator/my-courses"
              className="border border-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              View Courses
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <img src={assets.person_tick_icon} alt="" className="w-6 h-6" />
            </div>
            <span className="text-green-600 text-sm font-medium">+{stats.monthlyGrowth}%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalStudents.toLocaleString()}</h3>
          <p className="text-gray-600">Total Students</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <img src={assets.my_course_icon} alt="" className="w-6 h-6" />
            </div>
            <span className="text-blue-600 text-sm font-medium">Active</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalCourses}</h3>
          <p className="text-gray-600">Published Courses</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <img src={assets.earning_icon} alt="" className="w-6 h-6" />
            </div>
            <span className="text-green-600 text-sm font-medium">This month</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">${stats.totalRevenue.toLocaleString()}</h3>
          <p className="text-gray-600">Total Revenue</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">⭐</span>
            </div>
            <span className="text-yellow-600 text-sm font-medium">Avg Rating</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">4.8</h3>
          <p className="text-gray-600">Course Rating</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <Link to="/educator/activity" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {dashboardData?.recentActivity?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <img 
                      src={activity.user?.imageUrl || assets.profile_img}
                      alt={activity.user?.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{activity.user?.name}</span>
                        <span className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded-full">
                          {activity.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{activity.courseTitle}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-3">
            <Link 
              to="/educator/add-course"
              className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                <img src={assets.add_icon} alt="" className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Create New Course</p>
                <p className="text-sm text-gray-600">Start building your next course</p>
              </div>
            </Link>
            
            <Link 
              to="/educator/student-enroll"
              className="flex items-center gap-3 p-3 hover:bg-green-50 rounded-lg transition-colors group"
            >
              <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
                <img src={assets.person_tick_icon} alt="" className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">View Students</p>
                <p className="text-sm text-gray-600">Manage your enrollments</p>
              </div>
            </Link>
            
            <Link 
              to="/educator/earnings"
              className="flex items-center gap-3 p-3 hover:bg-yellow-50 rounded-lg transition-colors group"
            >
              <div className="w-10 h-10 bg-yellow-100 group-hover:bg-yellow-200 rounded-lg flex items-center justify-center transition-colors">
                <img src={assets.earning_icon} alt="" className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Check Earnings</p>
                <p className="text-sm text-gray-600">View your revenue stats</p>
              </div>
            </Link>
            
            <Link 
              to="/educator/analytics"
              className="flex items-center gap-3 p-3 hover:bg-purple-50 rounded-lg transition-colors group"
            >
              <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center transition-colors">
                <span className="text-purple-600 text-xl">📊</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Analytics</p>
                <p className="text-sm text-gray-600">Course performance data</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;