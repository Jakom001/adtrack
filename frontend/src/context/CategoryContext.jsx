import React, {createContext, useContext, useEffect, useState} from 'react'
import { categoryApi } from '../api/categoryApi'


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

    useEffect( () => {
        const loadCategories = async () =>{
            setLoading(true);
    
            const {data, error} = await categoryApi.getCategories;
    
            if (data){
                setCategories(data);
                setError(null)
            }else{
                setError(error);
            }
            setLoading(false)
        }
        loadCategories()
    }, []);

    const value = {
        categories,
        loading,
        error,
        setError,
        setLoading,
    
        // All Categories
        fetchCategories: async (params) =>{
            setLoading(true);
            const result = await categoryApi.getCategories(params);

            if (result.data){
                setCategories(result.data);
                setError(null);
            }else{
                setError(result.error);
            }
            setLoading(false);
            return result;
        },

        // Get Category By ID
        getCategory: async (id) =>{
            setLoading(true);
            const result = await categoryApi.getCategoryById(id);
            setLoading(false)

            if (result.error){
                setError(result.error)
            }else{
                setError(result.error)
            }

            return result
        }

        // Create category
        addCategory: async ()
    }
}

