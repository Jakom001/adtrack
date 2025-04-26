import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProjectContext } from '../../context/ProjectContext';

const AddProject = () => {
  const navigate = useNavigate();
  const { addProject, loading, error, clearError } = useProjectContext();
  
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    if (!formData.title || !formData.title.trim()) {
      newErrors.title = "Title is required";
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
    
    const result = await addProject(formData);

    if (result.data) {
      setSuccess("Project added successfully!");
      setFormData({
        title: '',
        description: ''
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/projects');
      }, 2000);
    }
  };

  return (
    <div className='flex flex-col justify-center items-center min-h-screen text-center bg-gray-50'>
      <div className="max-w-3xl w-full">
        <div className="bg-white p-12 rounded-2xl shadow-2xl transition-all duration-300 hover:translate-y-[-3px]">
          <div className="flex flex-col items-center justify-center gap-3 mb-6">
            <h1 className='text-2xl font-bold text-gray-900'>Add Project</h1>
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
            <div className="mb-8 flex flex-col">
              <label className="text-left text-sm font-medium text-gray-700 mb-4">
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
                placeholder="Enter project title"
              />
              {formErrors.title && (
                <div className="text-left text-red-500 text-xs mt-1">
                  {formErrors.title}
                </div>
              )}
            </div>

            <div className="mb-8 flex flex-col">
              <label className="text-left text-sm font-medium text-gray-700 mb-4">
                Description
              </label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange} 
                id="description"
                rows="4"
                placeholder="Enter project description"
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
              />
            </div>

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
                ) : "Add Project"}
              </button>

              <Link 
                to="/projects" 
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

export default AddProject;