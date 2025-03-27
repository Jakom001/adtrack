import api from "./api"; 

// Function to handle user login
export const loginUser = async (formData) => {
    try {
        const response = await api.post("/auth/login", formData);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data?.error || "Something went wrong. Please try again!" };
    }
};

// Function to handle user registration
export const registerUser = async (formData) => {
    try {
        const response = await api.post("/auth/register", formData);
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error: error.response?.data?.error || "Registration failed!" };
    }
};
