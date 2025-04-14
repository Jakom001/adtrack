import React, {createContext, useContext, useEffect, useCallback, useMemo, useState} from 'react'
import { categoryService } from '../service/categoryService'


const CategoryContext = createContext(null)

export const useCategoryContext = () =>{
    const context = useContext(CategoryContext)

    if(!context){
        throw new error("Category context must be used within the CategoryProvider")
    }
    return context
}

export const CategoryProvider = ({children}) =>{
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null);

    // All Categories
    const fetchCategories = useCallback(async () =>{
        setLoading(true);
        setError(null)
        const result = await categoryService.getCategories();
        if (result.data){
            setCategories(result.data);
            setError(null);
        }else{
            setError(result.error);
        }
        setLoading(false);

        return result;
    }, []);

    // Get Category By ID
    const getSingleCategory = useCallback(async (id) =>{
        setLoading(true);
        const result = await categoryService.getCategoryById(id);
        setLoading(false)

        if (result.error){
            setError(result.error)
        }
        return result
    }, []);

    // Create category
    const addCategory = useCallback(async (categoryData) => {
        setLoading(true);
        const result = await categoryService.addCategory(categoryData);
        setLoading(false);
    
        if (result.data) {
          setCategories(prevCategories => [...prevCategories, result.data]);
        } else {
          setError(result.error);
        }
        
        return result;
      }, []);
    

    const updateCategory = useCallback(async (id, categoryData) => {
        const previousCategories = [...categories];

        // Optimistic update
        setCategories(prevCategories =>
            prevCategories.map(category =>
                category._id === id ? {...category, ...categoryData} : category
            )
        )
        setLoading(true)

        const result = await categoryService.updateCategory(id, categoryData)
        setLoading(false)

        if(result.data){
            setCategories(prevCategories => 
                prevCategories.map(category => 
                  category._id === id ? result.data : category
                )
              );
        }else{
            setCategories(previousCategories);
            setError(result.error)
        }
        return result
    }, [categories]);


    const deleteCategory = useCallback(async (id) => {
        const previousCategories = [...categories]

        setCategories(prevCategories =>
            prevCategories.filter(category => category._id !== id)
        )
        setLoading(true)
        const result = await categoryService.deleteCategory(id)
        setLoading(false)

        if(result.error){
            setCategories(previousCategories);
            setError(result.error);
        }
        return result;
    }, [categories]);

    const searchCategories = useCallback(async (searchTerm) => {
        if (!searchTerm.trim()) {
          return { data: categories, error: null };
        }
        
        setLoading(true);
        const result = await categoryService.searchCategory(searchTerm);
        setLoading(false);
    
        if (result.error) {
          setError(result.error);
        }
        
        return result;
      }, [categories]);

    const clearError = useCallback(() => {
        setError(null)
    }, []);

    useEffect(() => {
        fetchCategories();

        return () =>{
            // Abort controller
        }
    }, [fetchCategories])

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
        <CategoryContext.Provider value = {contextValue}>
            {children}
        </CategoryContext.Provider>
    )
}

export default CategoryProvider;