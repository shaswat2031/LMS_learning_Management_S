import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { courseApi } from '../../services/api';

// Helper function to convert duration string to seconds
const convertDurationToSeconds = (durationStr) => {
  if (!durationStr) return 0;
  const parts = durationStr.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0]) || 0;
    const seconds = parseInt(parts[1]) || 0;
    return minutes * 60 + seconds;
  }
  return parseInt(durationStr) || 0;
};

const AddCourse = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: '',
    level: '',
    language: '',
    price: '',
    thumbnail: null,
    requirements: [''],
    outcomes: [''],
    curriculum: [{
      title: '',
      lectures: [{ title: '', duration: '', videoUrl: '' }]
    }]
  });

  const categories = [
    'Programming', 'Design', 'Business', 'Marketing', 
    'Data Science', 'Photography', 'Music', 'Language'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese'];

  const handleInputChange = (field, value) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setCourseData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addSection = () => {
    setCourseData(prev => ({
      ...prev,
      curriculum: [...prev.curriculum, {
        title: '',
        lectures: [{ title: '', duration: '', videoUrl: '' }]
      }]
    }));
  };

  const addLecture = (sectionIndex) => {
    setCourseData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((section, i) => 
        i === sectionIndex 
          ? { ...section, lectures: [...section.lectures, { title: '', duration: '', videoUrl: '' }] }
          : section
      )
    }));
  };

  const removeLecture = (sectionIndex, lectureIndex) => {
    setCourseData(prev => ({
      ...prev,
      curriculum: prev.curriculum.map((section, i) => 
        i === sectionIndex 
          ? { ...section, lectures: section.lectures.filter((_, j) => j !== lectureIndex) }
          : section
      )
    }));
  };

  const removeSection = (sectionIndex) => {
    if (courseData.curriculum.length > 1) {
      setCourseData(prev => ({
        ...prev,
        curriculum: prev.curriculum.filter((_, i) => i !== sectionIndex)
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add basic course info
      formData.append('title', courseData.title);
      formData.append('subtitle', courseData.subtitle);
      formData.append('description', courseData.description);
      formData.append('category', courseData.category);
      formData.append('level', courseData.level);
      formData.append('language', courseData.language);
      
      // Add pricing
      formData.append('price[amount]', courseData.price || 0);
      formData.append('price[isFree]', courseData.price === '' || courseData.price === '0');
      
      // Add thumbnail if selected
      if (courseData.thumbnail) {
        formData.append('thumbnail', courseData.thumbnail);
      }
      
      // Add requirements and outcomes
      courseData.requirements.filter(req => req.trim()).forEach((req, index) => {
        formData.append(`requirements[${index}]`, req);
      });
      
      courseData.outcomes.filter(outcome => outcome.trim()).forEach((outcome, index) => {
        formData.append(`outcomes[${index}]`, outcome);
      });
      
      // Add curriculum
      formData.append('courseContent', JSON.stringify(
        courseData.curriculum.map((section, sectionIndex) => ({
          chapterId: `chapter-${sectionIndex + 1}`,
          title: section.title,
          lectures: section.lectures.map((lecture, lectureIndex) => ({
            lectureId: `lecture-${sectionIndex + 1}-${lectureIndex + 1}`,
            title: lecture.title,
            duration: convertDurationToSeconds(lecture.duration),
            videoUrl: lecture.videoUrl,
            description: '',
            isPreview: lectureIndex === 0, // First lecture as preview
            order: lectureIndex
          }))
        }))
      ));

      // Create course via API
      const response = await courseApi.create(formData);
      
      if (response.status === 'success') {
        alert('Course created successfully!');
        navigate('/educator/my-courses');
      } else {
        throw new Error(response.message || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course. Please try again.');
    }
  };

  const steps = [
    { id: 1, name: 'Basic Info', icon: '📝' },
    { id: 2, name: 'Course Goals', icon: '🎯' },
    { id: 3, name: 'Curriculum', icon: '📚' },
    { id: 4, name: 'Pricing & Publish', icon: '💰' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= step.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step.id ? '✓' : step.icon}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Course Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                <input
                  type="text"
                  value={courseData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Complete React Developer Course"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Subtitle</label>
                <input
                  type="text"
                  value={courseData.subtitle}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  placeholder="A brief, engaging description of your course"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Description</label>
                <textarea
                  rows={6}
                  value={courseData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Detailed description of what students will learn..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={courseData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                  <select
                    value={courseData.level}
                    onChange={(e) => handleInputChange('level', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Level</option>
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={courseData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Language</option>
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <img src={assets.upload_area} alt="Upload" className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  <input type="file" className="hidden" accept="image/*" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Course Goals */}
        {currentStep === 2 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Goals & Requirements</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What will students learn?</h3>
                {courseData.outcomes.map((outcome, index) => (
                  <div key={index} className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => handleArrayChange('outcomes', index, e.target.value)}
                      placeholder="Enter a learning outcome"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {courseData.outcomes.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('outcomes', index)}
                        className="px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('outcomes')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2"
                >
                  <span>+</span> Add another outcome
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Requirements</h3>
                {courseData.requirements.map((requirement, index) => (
                  <div key={index} className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                      placeholder="Enter a requirement"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {courseData.requirements.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('requirements', index)}
                        className="px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('requirements')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2"
                >
                  <span>+</span> Add another requirement
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Curriculum */}
        {currentStep === 3 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Build Your Curriculum</h2>
            
            <div className="space-y-6">
              {courseData.curriculum.map((section, sectionIndex) => (
                <div key={sectionIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Section {sectionIndex + 1} Title
                      </label>
                      {courseData.curriculum.length > 1 && (
                        <button
                          onClick={() => removeSection(sectionIndex)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove Section
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => {
                        const newCurriculum = [...courseData.curriculum];
                        newCurriculum[sectionIndex].title = e.target.value;
                        setCourseData(prev => ({ ...prev, curriculum: newCurriculum }));
                      }}
                      placeholder="Section title"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    {section.lectures.map((lecture, lectureIndex) => (
                      <div key={lectureIndex} className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <input
                            type="text"
                            placeholder="Lecture title"
                            value={lecture.title}
                            onChange={(e) => {
                              const newCurriculum = [...courseData.curriculum];
                              newCurriculum[sectionIndex].lectures[lectureIndex].title = e.target.value;
                              setCourseData(prev => ({ ...prev, curriculum: newCurriculum }));
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            placeholder="Duration (e.g., 10:30)"
                            value={lecture.duration}
                            onChange={(e) => {
                              const newCurriculum = [...courseData.curriculum];
                              newCurriculum[sectionIndex].lectures[lectureIndex].duration = e.target.value;
                              setCourseData(prev => ({ ...prev, curriculum: newCurriculum }));
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="mb-3">
                          <input
                            type="url"
                            placeholder="YouTube URL or video link (e.g., https://youtu.be/dQw4w9WgXcQ)"
                            value={lecture.videoUrl}
                            onChange={(e) => {
                              const newCurriculum = [...courseData.curriculum];
                              newCurriculum[sectionIndex].lectures[lectureIndex].videoUrl = e.target.value;
                              setCourseData(prev => ({ ...prev, curriculum: newCurriculum }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>🎥</span>
                            <span className={lecture.videoUrl ? "text-green-600" : "text-gray-500"}>
                              {lecture.videoUrl ? "Video URL added" : "Add YouTube or video URL above"}
                            </span>
                          </div>
                          {section.lectures.length > 1 && (
                            <button
                              onClick={() => removeLecture(sectionIndex, lectureIndex)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => addLecture(sectionIndex)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2"
                    >
                      <span>+</span> Add lecture
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addSection}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
              >
                <div className="text-gray-600">
                  <span className="text-2xl block mb-2">+</span>
                  Add New Section
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Pricing & Publish */}
        {currentStep === 4 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing & Publish</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setCourseData(prev => ({ ...prev, thumbnail: file }));
                      }
                    }}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className="cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-gray-700"
                  >
                    <img src={assets.file_upload_icon} alt="Upload" className="w-12 h-12 mb-2" />
                    <span className="text-sm font-medium">
                      {courseData.thumbnail ? `Selected: ${courseData.thumbnail.name}` : "Click to upload course thumbnail"}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={courseData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">Set to $0 for a free course</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">Course Summary</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>Title:</strong> {courseData.title || 'Not set'}</p>
                  <p><strong>Category:</strong> {courseData.category || 'Not set'}</p>
                  <p><strong>Level:</strong> {courseData.level || 'Not set'}</p>
                  <p><strong>Sections:</strong> {courseData.curriculum.length}</p>
                  <p><strong>Total Lectures:</strong> {courseData.curriculum.reduce((acc, section) => acc + section.lectures.length, 0)}</p>
                  <p><strong>Price:</strong> ${courseData.price || '0.00'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="text-sm text-gray-700">I agree to the instructor terms and conditions</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Publish Course
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;