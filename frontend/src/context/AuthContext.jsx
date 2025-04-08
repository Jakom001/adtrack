import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within a AuthProvider");
    }
    return context;
}

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch the current user when the component mounts
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await api.get("/auth/current-user", { withCredentials: true });
                setToken(response.data.user);
            } catch (err) {
                setToken(null);
                setError(err.response ? err.response.data.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };
        fetchCurrentUser();
    }, []);
    useLayoutEffect(() => {
        const authInterceptor = api.interceptors.request.use((config) =>{
            config.headers.Authorization = 
            !config._retry && token 
            ? `Bearer ${token}`
            : config.headers.Authorization;
            return config;
        })
        return () => {
            api.interceptors.request.eject(authInterceptor);
        };
    }, [token]);
    
    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading, error, setError }}>
        {children}
        </AuthContext.Provider>
    );
}

