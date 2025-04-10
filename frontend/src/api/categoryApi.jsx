import api from "./api";

export const categoryService = {
    getCategories: async (params ={}) =>{
        try{
            const response = await api.get('/category/all-categories')
            return {data: response.data, error: null}
        }catch (error){
            return{
                data: null,
                error: error.response?.data?.error || "Failed to fetch the catehgories. Please try again"
            };
        }
    },

    getCategoryById: async (id) =>{
        try{
            const response = await api.get(`category/sing-category/${id}`);
            return {data: response.data, error:null}
        }catch (error){
            return {
                data: null,
                error: error.response?.data?.error || "Failed to fetch the category details"
            }
        }
    },

    addCategory: async (categoryData) => {
        try{
            const response = api.post("/category/add-category", categoryData)
            return { data: response.data, error: null}
        }catch (error) {
            return {data:null, 
                error: error.response?.data?.error || "Failed to add the category"
            }
        }
    },

    editCategory: async (id, categoryData) =>{
        try{
            const response = await api.put(`/category/edit-category/${id}`, categoryData);
            return {data:response.data, error:null};
        }catch (error){
            return {
                data: null,
                error: error.response?.data?.error || "Failed to edit the category"
            }
        }
    },

    deleteCategory: async (id) => {
        try{
            const response = await api.delete(`category/delete-category/${id}`)
            return {data: response.data, error:null}
        }catch (error){
            return {
                data:null,
                error: error.response?.data?.error || "Failed to delete the category"
                
            }
        }
    },

    searchCategory: async (searchTerm) =>{
        try{
            const response = await api.get(`/products/search`, {params: {q: searchTerm}});
            return {
                data: response.data,
                error: null
            }
        }catch (error){
            return {
                data: null,
                error: error.response?.data?.error || "Failed to search categories." 
            }
        }
    }


}
    
