import api from "./api";

export const projectService = {
  getProjects: async (params = {}) => {
    try {
      const response = await api.get('/project/all-projects', { params });
      return { data: response.data.data.projects, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to fetch the projects. Please try again" 
      };
    }
  },

  getProjectById: async (id) => {
    try {
      const response = await api.get(`/project/single-project/${id}`);
      return { data: response.data.data.project, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to fetch the project details" 
      };
    }
  },

  addProject: async (projectData) => {
    try {
      const response = await api.post("/project/add-project", projectData);
      return { 
        data: response.data.data.project, 
        error: null,
        success: response.data.message || "Project added successfully" 
      };
    } catch (error) {
      return {
        data: null, 
        error: error.response?.data?.error || "Failed to add the project" 
      };
    }
  },

  updateProject: async (id, projectData) => {
    try {
      const response = await api.put(`/project/update-project/${id}`, projectData);
      return { data: response.data.data.project, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to update the project" 
      };
    }
  },

  deleteProject: async (id) => {
    try {
      const response = await api.delete(`/project/delete-project/${id}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to delete the project" 
      };
    }
  },

  searchProject: async (searchTerm) => {
    try {
      const response = await api.get('/project/search', { params: { q: searchTerm } });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to search projects." 
      };
    }
  }
};