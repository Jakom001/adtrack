import React, { createContext, useContext, useEffect, useCallback, useMemo, useState } from 'react';
import { categoryService } from '../service/categoryService';
import { useAuthContext } from './AuthContext'; // Import the AuthContext

const CategoryContext = createContext(null);

export const useCategoryContext = () => {
  const context = useContext(CategoryContext);

  if (!context) {
    throw new Error("useCategoryContext must be used within a CategoryProvider");
  }
  return context;
};

export const CategoryContextProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser} = useAuthContext();
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
      const errorMsg = "You must loggeg in to add a category"
      setError(errorMsg);
      return{data:null, error:errorMsg}
    }
    // Add the current user's ID to the category data
    const categoryWithUserId = {
      ...categoryData,
      userId: currentUser?._id 
    };
    console.log("adding category with data")
    
    const result = await categoryService.addCategory(categoryWithUserId);
    
    setLoading(false);
    
    if (result.data) {
      setCategories(prevCategories => [result.data, ...prevCategories]);
    } else {
      setError(result.error);
    }
    
    return result;
  }, [currentUser]); // Add currentUser as a dependency

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
    
    const result = await categoryService.updateCategory(id, categoryData);
    
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
  }, [categories, isAuthenticated]);

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
};

export default CategoryContextProvider;