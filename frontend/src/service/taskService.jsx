import api from "./api";

export const taskService = {
  getTasks: async (params = {}) => {
    try {
      const response = await api.get('/task/all-tasks', { params });
      return { data: response.data.data.tasks, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to fetch the tasks. Please try again" 
      };
    }
  },

  getTaskById: async (id) => {
    try {
      const response = await api.get(`/task/single-task/${id}`);
      return { data: response.data.data.task, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to fetch the task details" 
      };
    }
  },

  addTask: async (taskData) => {
    try {
      const response = await api.post("/task/add-task", taskData);
      return { 
        data: response.data.data.task, 
        error: null,
        success: response.data.message || "Task added successfully" 
      };
    } catch (error) {
      return {
        data: null, 
        error: error.response?.data?.error || "Failed to add the task" 
      };
    }
  },

  updateTask: async (id, taskData) => {
    try {
      const response = await api.put(`/task/update-task/${id}`, taskData);
      return { data: response.data.data.task, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to update the task" 
      };
    }
  },

  deleteTask: async (id) => {
    try {
      const response = await api.delete(`/task/delete-task/${id}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to delete the task" 
      };
    }
  },

  searchTask: async (searchTerm) => {
    try {
      const response = await api.get('/task/search', { params: { q: searchTerm } });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to search tasks." 
      };
    }
  }
};