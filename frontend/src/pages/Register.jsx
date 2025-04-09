import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register, error: authError, isAuthenticated, clearError } = useAuth();
    
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
    
    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home');
        }
        
        return () => {
            clearError();
        };
    }, [isAuthenticated, navigate, clearError]);
    
    const validateForm = () => {
        let newErrors = {}
        
        if(!formData.firstName.trim()){
            newErrors.firstName = "First Name is required";
        }

        if(!formData.lastName.trim()){
            newErrors.lastName = "Last Name is required";
        }

        if(!formData.phone.trim()){
            newErrors.phone = "Phone number is required";
        } else if(!/^\d{10}$/.test(formData.phone)){
            newErrors.phone = "Phone number must be 10 digits";
        }

        if(!formData.email.trim()){
            newErrors.email = "Email is required";
        } else if(!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)){
            newErrors.email = "Email is invalid";
        }

        if (!formData.password.trim()){
            newErrors.password = "Password is required";
        } else if(formData.password.length < 8){
            newErrors.password = "Password must be at least 8 characters";
        }

        if (!formData.confirmPassword.trim()){
            newErrors.confirmPassword = "Please confirm your password";
        } else if(formData.password !== formData.confirmPassword){
            newErrors.confirmPassword = "Passwords do not match";
        }

        if(!formData.termsAccepted){
            newErrors.termsAccepted = "You must agree to the Terms and Conditions";
        }

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        const inputValue = type === 'checkbox' ? checked : value;
        
        setFormData((prevData) => ({
            ...prevData,
            [name]: inputValue
        }));
        
        if(formErrors[name]) {
            setFormErrors((prevErrors) => ({
                ...prevErrors,
                [name]: null
            }));
        }
        
        clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess("");
        
        if(!validateForm()) return;
        setLoading(true);
        
        const { termsAccepted, confirmPassword, ...apiFormData } = formData;
        
        const result = await register(apiFormData);
        setLoading(false);

        if (result.success) {
            setSuccess(result.message || "Registration successful! Please login.");
            setFormData({ 
                firstName: '',
                lastName: '',
                phone: '',
                email: '',
                password: '',
                confirmPassword: '',
                termsAccepted: false
            });

            setTimeout(() => {
                navigate("/login");
            }, 2000);
        }
    };

    return (
        <div className='flex flex-col items-center justify-center min-h-screen text-center bg-grayColor'>
            {success && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-auto max-w-lg p-4 bg-green-100 text-green-700 rounded-lg shadow-lg flex items-center justify-between">
                    <span>{success}</span>
                    <X 
                        size={20} 
                        className="ml-4 cursor-pointer hover:text-green-900" 
                        onClick={() => setSuccess("")}
                    />
                </div>
            )}
            {authError && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-auto max-w-lg p-4 bg-red-100 text-red-700 rounded-lg shadow-lg flex items-center justify-between">
                    <span>{authError}</span>
                    <X 
                        size={20} 
                        className="ml-4 cursor-pointer hover:text-red-900" 
                        onClick={() => clearError()}
                    />
                </div>
            )}

            <div className="w-xl bg-white px-12 py-8 m-8 rounded-2xl shadow-2xl transition-all duration-300 hover:translate-y-[-3px]">
                {/* Rest of the component remains the same as in your original code */}
                <div className="flex flex-col items-center justify-center gap-3 mb-6">
                    <h1 className='text-3xl font-bold text-gray-900'>Adtrack</h1>
                    <div className='bg-primary w-12 h-1 rounded-md'></div>
                    <p className='text-gray-700 text-lg font-medium'>Create your account</p>
                    <p className='text-gray-700'>
                        Already have an account? 
                        <span className='text-blue-500 cursor-pointer' onClick={() => navigate("/login")}> Login</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* All form fields remain the same as in your original code */}
                    <div className="mb-6 flex flex-col">  
                        <label className="text-left text-sm font-medium text-gray-700 mb-4">
                            First Name<span className='text-red-500 font-bold'>*</span>
                        </label>
                        <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                        {formErrors.firstName && <div className="text-left text-red-500 text-xs mt-1">{formErrors.firstName}</div>}
                    </div>

                    {/* Continue with all other form fields as in your original code */}
                    {/* ... */}

                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="w-full p-2 bg-primary text-white rounded-xl cursor-pointer hover:bg-secondary disabled:opacity-50 mb-2"
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Create Account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;