// API configuration and utility functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Create API instance with default config
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add auth token if available and not explicitly disabled
    if (options.auth !== false) {
      const token = getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const config = {
      method: 'GET',
      ...options,
      headers
    };

    // Handle request body
    if (config.body && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    } else if (config.body instanceof FormData) {
      // Remove Content-Type for FormData (browser sets it automatically with boundary)
      delete headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      
      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMessage = data?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${config.method} ${url}`, error);
      throw error;
    }
  }

  // HTTP methods
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body });
  }
}

const api = new ApiClient();

// User API functions
export const userApi = {
  // Get user profile
  getProfile: () => api.get('/users/profile'),

  // Update user profile
  updateProfile: (userData) => api.put('/users/profile', userData),

  // Get user stats
  getStats: () => api.get('/users/stats'),

  // Get user dashboard
  getDashboard: () => api.get('/users/dashboard'),

  // Get user enrollments
  getEnrollments: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/users/enrollments?${queryParams}`);
  },

  // Switch user role
  switchRole: (role) => api.post('/users/switch-role', { role }),

  // Update preferences
  updatePreferences: (preferences) => 
    api.put('/users/preferences', { preferences })
};

// Course API functions
export const courseApi = {
  // Create new course
  create: (formData) => api.post('/courses', formData),

  // Get all courses with filters
  getCourses: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    return api.get(`/courses${queryString ? `?${queryString}` : ''}`);
  },

  // Get course by ID
  getCourse: (id) => api.get(`/courses/${id}`),

  // Search courses
  searchCourses: (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters });
    return api.get(`/courses/search?${params}`);
  },

  // Create course (educator only)
  createCourse: (courseData) => {
    const formData = new FormData();
    
    // Add course data
    Object.entries(courseData).forEach(([key, value]) => {
      if (key === 'thumbnail' && value instanceof File) {
        formData.append('thumbnail', value);
      } else if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    return api.post('/courses', formData);
  },

  // Update course
  updateCourse: (id, courseData) => {
    if (courseData instanceof FormData) {
      return api.put(`/courses/${id}`, courseData);
    }
    
    const formData = new FormData();
    Object.entries(courseData).forEach(([key, value]) => {
      if (key === 'thumbnail' && value instanceof File) {
        formData.append('thumbnail', value);
      } else if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    return api.put(`/courses/${id}`, formData);
  },

  // Delete course
  deleteCourse: (id) => api.delete(`/courses/${id}`),

  // Add chapter to course
  addChapter: (courseId, chapterData) => 
    api.post(`/courses/${courseId}/chapters`, chapterData),

  // Add lecture to chapter
  addLecture: (courseId, chapterId, lectureData) => {
    const formData = new FormData();
    
    Object.entries(lectureData).forEach(([key, value]) => {
      if (key === 'video' && value instanceof File) {
        formData.append('video', value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    return api.post(`/courses/${courseId}/chapters/${chapterId}/lectures`, formData);
  },

  // Add course rating  
  addRating: (id, rating, review) => 
    api.post(`/courses/${id}/rating`, { rating, review }),

  // Get educator's courses (from authenticated user)
  getEducatorCourses: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/courses/educator?${queryParams}`);
  }
};

// Enrollment API functions
export const enrollmentApi = {
  // Enroll in course
  enroll: (courseId, enrollmentType = 'free') => 
    api.post('/enrollments/enroll', { courseId, enrollmentType }),

  // Check enrollment status
  getStatus: (courseId) => api.get(`/enrollments/status/${courseId}`),

  // Get enrollment progress
  getProgress: (courseId) => api.get(`/enrollments/progress/${courseId}`),

  // Update watch progress
  updateProgress: (progressData) => 
    api.post('/enrollments/progress', progressData),

  // Mark lecture complete
  markLectureComplete: (progressData) => 
    api.post('/enrollments/complete-lecture', progressData),

  // Get notes
  getNotes: (courseId, params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/enrollments/notes/${courseId}?${queryParams}`);
  },

  // Add note
  addNote: (noteData) => api.post('/enrollments/notes', noteData),

  // Get bookmarks
  getBookmarks: (courseId, params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/enrollments/bookmarks/${courseId}?${queryParams}`);
  },

  // Add bookmark
  addBookmark: (bookmarkData) => api.post('/enrollments/bookmarks', bookmarkData)
};

// Upload API functions
export const uploadApi = {
  // Upload course image
  uploadCourseImage: (file) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    return api.post('/upload/course-image', formData);
  },

  // Upload lecture video
  uploadVideo: (file) => {
    const formData = new FormData();
    formData.append('video', file);
    return api.post('/upload/lecture-video', formData);
  },

  // Upload profile image
  uploadProfileImage: (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    return api.post('/upload/profile-image', formData);
  }
};

// Export the main API client
export { api };

// Health check function
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health', { auth: false });
    return response.status === 'success';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};