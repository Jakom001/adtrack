import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTaskContext } from '../../context/TaskContext';
import { useProjectContext } from '../../context/ProjectContext';
import { useCategoryContext } from '../../context/CategoryContext';
import { useAuthContext } from '../../context/AuthContext';

const AddTask = () => {
  const navigate = useNavigate();
  const { addTask, loading, error, clearError } = useTaskContext();
  const { projects, fetchProjects } = useProjectContext();
  const { categories, fetchCategories } = useCategoryContext();
  const { users, fetchUsers } = useAuthContext();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    comment: '',
    status: 'pending', // Default status
    categoryId: '',
    projectId: '',
    startTime: '',
    endTime: '',
    userId: '',
    breakTime: ''
  });
  
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Fetch required data for select fields
  useEffect(() => {
    fetchProjects();
    fetchCategories();
    fetchUsers();
  }, []);

  const validateForm = () => {
    let newErrors = {};
    
    if (!formData.title || !formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.status) {
      newErrors.status = "Status is required";
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }
    
    if (!formData.projectId) {
      newErrors.projectId = "Project is required";
    }
    
    if (!formData.userId) {
      newErrors.userId = "User is required";
    }
    
    // Validate start and end time if both are provided
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      
      if (end < start) {
        newErrors.endTime = "End time must be after start time";
      }
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    // Clear field-specific error when user types
    if (formErrors[name]) {
      setFormErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    }
    
    // Clear global API error
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    
    if (!validateForm()) return;
    
    const result = await addTask(formData);

    if (result.data) {
      setSuccess("Task added successfully!");
      setFormData({
        title: '',
        description: '',
        comment: '',
        status: 'pending',
        categoryId: '',
        projectId: '',
        startTime: '',
        endTime: '',
        userId: '',
        breakTime: ''
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/tasks');
      }, 2000);
    }
  };

  return (
    <div className='flex flex-col justify-center items-center min-h-screen text-center bg-gray-50'>
      <div className="max-w-3xl w-full">
        <div className="bg-white p-12 rounded-2xl shadow-2xl transition-all duration-300 hover:translate-y-[-3px]">
          <div className="flex flex-col items-center justify-center gap-3 mb-6">
            <h1 className='text-2xl font-bold text-gray-900'>Add Task</h1>
          </div>
          
          {success && (
            <div className="p-3 bg-green-100 text-green-700 rounded mb-4 transition-all duration-300">
              {success}
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded mb-4 transition-all duration-300">
              {error}
            </div>
          )}
      
          <form onSubmit={handleSubmit}>
            {/* Title Field */}
            <div className="mb-6 flex flex-col">
              <label className="text-left text-sm font-medium text-gray-700 mb-2">
                Title<span className='text-red-500 font-bold'>*</span>
              </label>
              <input
                className={`w-full px-3 py-2 border ${
                  formErrors.title ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter task title"
              />
              {formErrors.title && (
                <div className="text-left text-red-500 text-xs mt-1">
                  {formErrors.title}
                </div>
              )}
            </div>

            {/* Description Field */}
            <div className="mb-6 flex flex-col">
              <label className="text-left text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange} 
                rows="3"
                placeholder="Enter task description"
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
              />
            </div>

            {/* Project Selection */}
            <div className="mb-6 flex flex-col">
              <label className="text-left text-sm font-medium text-gray-700 mb-2">
                Project<span className='text-red-500 font-bold'>*</span>
              </label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.projectId ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
              >
                <option value="">Select a project</option>
                {projects && projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))}
              </select>
              {formErrors.projectId && (
                <div className="text-left text-red-500 text-xs mt-1">
                  {formErrors.projectId}
                </div>
              )}
            </div>

            {/* Category Selection */}
            <div className="mb-6 flex flex-col">
              <label className="text-left text-sm font-medium text-gray-700 mb-2">
                Category<span className='text-red-500 font-bold'>*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.categoryId ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
              >
                <option value="">Select a category</option>
                {categories && categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {formErrors.categoryId && (
                <div className="text-left text-red-500 text-xs mt-1">
                  {formErrors.categoryId}
                </div>
              )}
            </div>

            {/* Status Selection */}
            <div className="mb-6 flex flex-col">
              <label className="text-left text-sm font-medium text-gray-700 mb-2">
                Status<span className='text-red-500 font-bold'>*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.status ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {formErrors.status && (
                <div className="text-left text-red-500 text-xs mt-1">
                  {formErrors.status}
                </div>
              )}
            </div>

            {/* Assigned User */}
            <div className="mb-6 flex flex-col">
              <label className="text-left text-sm font-medium text-gray-700 mb-2">
                Assigned To<span className='text-red-500 font-bold'>*</span>
              </label>
              <select
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.userId ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
              >
                <option value="">Select a user</option>
                {users && users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
              {formErrors.userId && (
                <div className="text-left text-red-500 text-xs mt-1">
                  {formErrors.userId}
                </div>
              )}
            </div>

            {/* Time Fields in a flex row */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Time */}
              <div className="flex flex-col">
                <label className="text-left text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
                />
              </div>

              {/* End Time */}
              <div className="flex flex-col">
                <label className="text-left text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.endTime ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`}
                />
                {formErrors.endTime && (
                  <div className="text-left text-red-500 text-xs mt-1">
                    {formErrors.endTime}
                  </div>
                )}
              </div>
            </div>

            {/* Break Time */}
            <div className="mb-6 flex flex-col">
              <label className="text-left text-sm font-medium text-gray-700 mb-2">
                Break Time (in minutes)
              </label>
              <input
                type="number"
                name="breakTime"
                value={formData.breakTime}
                onChange={handleChange}
                placeholder="Enter break time"
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
              />
            </div>

            {/* Comment Field */}
            <div className="mb-8 flex flex-col">
              <label className="text-left text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <textarea 
                name="comment"
                value={formData.comment}
                onChange={handleChange} 
                rows="2"
                placeholder="Add any comments about this task"
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                type="submit"
                className="bg-primary text-white py-2 px-4 rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 cursor-pointer disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : "Add Task"}
              </button>

              <Link 
                to="/tasks" 
                className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-colors duration-200"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTask;