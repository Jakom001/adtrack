import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register, loading: authLoading, error: authError, isAuthenticated, clearError } = useAuthContext();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        termsAccepted: false
    });
    
    const [formErrors, setFormErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
        return () => {
            clearError();
        };
    }, [isAuthenticated, navigate, clearError]);

    const validateForm = () => {
        let newErrors = {};
        
        if (!formData.firstName.trim()) {
            newErrors.firstName = "First Name is required";
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last Name is required";
        }
        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = "Phone number must be 10 digits";
        }
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
        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }
        if (!formData.termsAccepted) {
            newErrors.termsAccepted = "You must agree to the Terms and Conditions";
        }

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const inputValue = type === 'checkbox' ? checked : value;
        
        setFormData(prev => ({ ...prev, [name]: inputValue }));
        
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
        if (authError) clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess("");
        
        if (!validateForm()) return;
        setLoading(true);

        try {
            const { termsAccepted, ...apiFormData } = formData;
            const result = await register(apiFormData);
            
            if (result.data.success) {
                setSuccess("Registration successful! Redirecting to login...");
                setFormData({
                    firstName: '',
                    lastName: '',
                    phone: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    termsAccepted: false
                });
                
                setTimeout(() => navigate("/login"), 2000);
            }
        } catch (error) {
            console.error("Registration error:", error);
        } finally {
            setLoading(false);
        }
    };

    const isLoading = loading || authLoading;

    return (
        <div className='flex flex-col items-center justify-center min-h-screen text-center bg-grayColor'>
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl transition-all duration-300 hover:translate-y-1">
                <div className="flex flex-col items-center justify-center gap-3 mb-6">
                    <h1 className='text-3xl font-bold text-gray-900'>Adtrack</h1>
                    <div className='bg-primary w-12 h-1 rounded-md'></div>
                    <p className='text-gray-700 text-lg font-medium'>Create your account</p>
                    <p className='text-gray-700'>
                        Already have an account? 
                        <span className='text-blue-500 cursor-pointer ml-1' onClick={() => navigate("/login")}>Login</span>
                    </p>
                </div>

                {success && <div className="p-3 bg-green-100 text-green-700 rounded mb-4">{success}</div>}
                {authError && <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{authError}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex flex-col">
                            <label className="text-left text-sm font-medium text-gray-700 mb-2">
                                First Name<span className='text-red-500 font-bold'>*</span>
                            </label>
                            <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            {formErrors.firstName && <div className="text-left text-red-500 text-xs mt-1">{formErrors.firstName}</div>}
                        </div>

                        <div className="flex flex-col">
                            <label className="text-left text-sm font-medium text-gray-700 mb-2">
                                Last Name<span className='text-red-500 font-bold'>*</span>
                            </label>
                            <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            {formErrors.lastName && <div className="text-left text-red-500 text-xs mt-1">{formErrors.lastName}</div>}
                        </div>
                    </div>

                    <div className="mb-6 flex flex-col">
                        <label className="text-left text-sm font-medium text-gray-700 mb-2">
                            Phone Number<span className='text-red-500 font-bold'>*</span>
                        </label>
                        <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="1234567890"
                        />
                        {formErrors.phone && <div className="text-left text-red-500 text-xs mt-1">{formErrors.phone}</div>}
                    </div>

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
                        <label className="text-left text-sm font-medium text-gray-700 mb-2">
                            Password<span className='text-red-500 font-bold'>*</span>
                        </label>
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

                    <div className="mb-6 flex flex-col">
                        <label className="text-left text-sm font-medium text-gray-700 mb-2">
                            Confirm Password<span className='text-red-500 font-bold'>*</span>
                        </label>
                        <div className="relative">
                            <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                            <span
                                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </span>
                        </div>
                        {formErrors.confirmPassword && <div className="text-left text-red-500 text-xs mt-1">{formErrors.confirmPassword}</div>}
                    </div>

                    <div className='flex items-start gap-2 mb-6'>
                        <input 
                            type="checkbox" 
                            id="termsAccepted" 
                            name="termsAccepted"
                            checked={formData.termsAccepted}
                            onChange={handleChange}
                            className="rounded text-primary focus:ring-primary mt-1"
                        />
                        <label htmlFor="termsAccepted" className='text-sm font-medium text-gray-700'>
                            I agree to the <span className='text-blue-500 cursor-pointer' onClick={() => navigate("/terms-conditions")}>Terms & Conditions</span>
                            <span className='text-red-500 font-bold'>*</span>
                        </label>
                    </div>
                    {formErrors.termsAccepted && <div className="text-left text-red-500 text-xs -mt-4 mb-4">{formErrors.termsAccepted}</div>}

                    <button
                        type="submit"
                        className="w-full p-3 bg-primary text-white rounded-xl cursor-pointer hover:bg-opacity-90 disabled:opacity-50 mb-6 font-medium"
                        disabled={isLoading}
                    >
                        {isLoading ? "Registering..." : "Create Account"}
                    </button>

                    <div className='border-t border-gray-300 pt-4 mb-4'></div>
                    <p className='text-gray-700 text-sm'>
                        Already have an account? 
                        <span className='text-blue-500 cursor-pointer ml-1' onClick={() => navigate("/login")}>Login here</span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;