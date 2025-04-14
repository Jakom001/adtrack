import api from "./api";

export const categoryService = {
  getCategories: async (params = {}) => {
    try {
      const response = await api.get('/category/all-categories', { params });
      return { data: response.data.data.categories, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to fetch the categories. Please try again" 
      };
    }
  },

  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/category/single-category/${id}`);
      return { data: response.data.data.category, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to fetch the category details" 
      };
    }
  },

  addCategory: async (categoryData) => {
    try {
      const response = await api.post("/category/create-category", categoryData);
      return { data: response.data.data.category, error: null };
    } catch (error) {
      return {
        data: null, 
        error: error.response?.data?.error || "Failed to add the category" 
      };
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/category/update-category/${id}`, categoryData);
      return { data: response.data.data.category, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to update the category" 
      };
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/category/delete-category/${id}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to delete the category" 
      };
    }
  },

  searchCategory: async (searchTerm) => {
    try {
      const response = await api.get('/category/search', { params: { q: searchTerm } });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to search categories." 
      };
    }
  }
};
