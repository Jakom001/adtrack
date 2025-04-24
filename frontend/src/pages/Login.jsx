import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login, loading: authLoading, error: authError, isAuthenticated, clearError } = useAuthContext();
    
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [formErrors, setFormErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Check URL parameters for session expired message
        const params = new URLSearchParams(window.location.search);
        if (params.get('session') === 'expired') {
            setFormErrors({general: 'Your session has expired. Please log in again.'});
        }
        
        // Redirect if already authenticated
        if (isAuthenticated) {
            setSuccess("Already logged in. Redirecting...");
            setTimeout(() => navigate("/home"), 2000);
        }
        
        // Clean up errors when component unmounts
        return () => {
            clearError();
        };
    }, [isAuthenticated, navigate, clearError]);

    const validateForm = () => {
        let newErrors = {};
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            newErrors.email = "Email is invalid";
        }
        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }
        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
        // Clear field-specific errors when user types
        if (formErrors[name]) setFormErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
        // Clear auth errors when user makes changes
        if (authError) clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess("");
        
        if (!validateForm()) return;
        setLoading(true);

        try {
            const result = await login(formData);
            
            // Check if result exists and has data property before accessing success
            if (result && result.data && result.data.success) {
                setSuccess("Login successful! Redirecting...");
                setFormData({ email: "", password: "" });
                // The redirect will be handled by the useEffect when isAuthenticated changes
            } else if (result && result.error) {
                // Display the error from the result if present
                setFormErrors({general: result.error});
            }
        } catch (error) {
            console.error("Login error:", error);
            setFormErrors({general: "Login failed. Please try again."});
        } finally {
            setLoading(false);
        }
    };

    // Combined loading state from local and auth context
    const isLoading = loading || authLoading;

    return (
        <div className='flex flex-col items-center justify-center min-h-screen text-center bg-grayColor'>
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl transition-all duration-300 hover:translate-y-1">
                <div className="flex flex-col items-center justify-center gap-3 mb-6">
                    <h1 className='text-3xl font-bold text-gray-900'>Adtrack</h1>
                    <div className='bg-primary w-12 h-1 rounded-md'></div>
                    <p className='text-gray-700 text-lg font-medium'>Welcome back! Log in to your account</p>
                    <p className='text-gray-700'>
                        Don't have an account? 
                        <span className='text-blue-500 cursor-pointer ml-1' onClick={() => navigate("/register")}>Register</span>
                    </p>
                </div>

                {success && <div className="p-3 bg-green-100 text-green-700 rounded mb-4">{success}</div>}
                {authError && <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{authError}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-6 flex flex-col">
                        <label className="text-left text-sm font-medium text-gray-700 mb-2">
                            Email<span className='text-red-500 font-bold'>*</span>
                        </label>
                        <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        {formErrors.email && <div className="text-left text-red-500 text-xs mt-1">{formErrors.email}</div>}
                    </div>

                    <div className="mb-6 flex flex-col">
                        <div className='flex justify-between'>
                            <label className="text-left text-sm font-medium text-gray-700 mb-2">
                                Password<span className='text-red-500 font-bold'>*</span>
                            </label>
                            <p className='text-blue-500 cursor-pointer text-sm' onClick={() => navigate("/forgot-password")}>Forgot Password?</p>
                        </div>

                        <div className="relative">
                            <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            <span
                                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </span>
                        </div>
                        {formErrors.password && <div className="text-left text-red-500 text-xs mt-1">{formErrors.password}</div>}
                    </div>

                    <div className='flex items-center gap-2 mb-6'>
                        <input type="checkbox" id="remember" className="rounded text-primary focus:ring-primary" />
                        <label htmlFor="remember" className='text-sm font-medium text-gray-700'>Remember me</label>
                    </div>

                    <button
                        type="submit"
                        className="w-full p-3 bg-primary text-white rounded-xl cursor-pointer hover:bg-opacity-90 disabled:opacity-50 mb-6 font-medium"
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>

                    <div className='border-t border-gray-300 pt-4 mb-4'></div>
                    <p className='text-gray-700 text-sm'>
                        By logging in, you agree to our 
                        <span className='text-blue-500 cursor-pointer ml-1' onClick={() => navigate("/terms-conditions")}>Terms & Conditions</span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;