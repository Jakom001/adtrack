import React, { createContext, useContext, useEffect, useCallback, useMemo, useState } from 'react';
import { categoryService } from '../service/categoryService';
import { useAuthContext } from './AuthContext';

// Create the context
const CategoryContext = createContext(null);

// Custom hook to use the context
function useCategoryContext() {
  const context = useContext(CategoryContext);

  if (!context) {
    throw new Error("useCategoryContext must be used within a CategoryProvider");
  }
  return context;
}

// Provider component
function CategoryContextProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuthContext();
  
  // All Categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await categoryService.getCategories();
    
    if (result.data) {
      setCategories(result.data);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  }, []);

  // Get Category By ID
  const getSingleCategory = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    const result = await categoryService.getCategoryById(id);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    
    return result;
  }, []);

  // Create category with user ID
  const addCategory = useCallback(async (categoryData) => {
    setLoading(true);
    setError(null);
    
    // check if user is authenticated
    if(!currentUser){
      setLoading(false);
      const errorMsg = "You must be logged in to add a category";
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }
    
    // Add the current user's ID to the category data
    const categoryWithUserId = {
      ...categoryData,
      userId: currentUser?._id 
    };
    
    const result = await categoryService.addCategory(categoryWithUserId);
    
    setLoading(false);
    
    if (result.data) {
      setCategories(prevCategories => [result.data, ...prevCategories]);
    } else {
      setError(result.error);
    }
    
    return result;
  }, [currentUser]);

  // Update category
  const updateCategory = useCallback(async (id, categoryData) => {
    const previousCategories = [...categories];

    // Optimistic update
    setCategories(prevCategories =>
      prevCategories.map(category =>
        category._id === id ? { ...category, ...categoryData } : category
      )
    );
    
    setLoading(true);
    setError(null);

    // check if user is logged in
    if(!currentUser){
      setLoading(false);
      const errorMsg = "You must login to update a category";
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }
    
    // Add the current user's ID to the category data
    const categoryWithUserId = {
      ...categoryData,
      userId: currentUser?._id 
    };
    

    
    const result = await categoryService.updateCategory(id, categoryWithUserId);
    
    setLoading(false);

    if (result.data) {
      setCategories(prevCategories => 
        prevCategories.map(category => 
          category._id === id ? result.data : category
        )
      );
    } else {
      setCategories(previousCategories);
      setError(result.error);
    }
    
    return result;
  }, [categories, currentUser]);

  // Delete category
  const deleteCategory = useCallback(async (id) => {
    const previousCategories = [...categories];

    // Optimistic update
    setCategories(prevCategories =>
      prevCategories.filter(category => category._id !== id)
    );
    
    setLoading(true);
    setError(null);
    
    const result = await categoryService.deleteCategory(id);
    
    setLoading(false);

    if (result.error) {
      // Revert to previous state if there was an error
      setCategories(previousCategories);
      setError(result.error);
    }
    
    return result;
  }, [categories]);

  // Search categories
  const searchCategories = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      return { data: categories, error: null };
    }
    
    setLoading(true);
    setError(null);
    
    const result = await categoryService.searchCategory(searchTerm);
    
    setLoading(false);

    if (result.error) {
      setError(result.error);
    }
    
    return result;
  }, [categories]);

  // Clear any errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
    
    return () => {
      // Any cleanup if needed
    };
  }, [fetchCategories]);


  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    categories,
    loading,
    error,
    clearError,
    fetchCategories,
    updateCategory,
    deleteCategory,
    addCategory,
    getSingleCategory,
    searchCategories,
  }), [
    categories,
    loading,
    error,
    clearError,
    fetchCategories,
    updateCategory,
    deleteCategory,
    addCategory,
    getSingleCategory,
    searchCategories,
  ]);

  return (
    <CategoryContext.Provider value={contextValue}>
      {children}
    </CategoryContext.Provider>
  );
}

// Export both the hook and provider
export { useCategoryContext, CategoryContextProvider };