import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/authApi';
import { Eye, EyeOff, X } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
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
    const [errors, setErrors] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
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
        
        if(errors) setErrors("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setErrors("");
        if(!validateForm()) return;
        setLoading(true);
        
        const { termsAccepted, ...apiFormData } = formData;
        
        const { data, error } = await registerUser(apiFormData); 

        setLoading(false);

        if (error) {
            setErrors(error); 
        } else {
            setMessage(data.message);
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
        {message && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-auto max-w-lg p-4 bg-green-100 text-green-700 rounded-lg shadow-lg flex items-center justify-between">
                <span>{message}</span>
                <X 
                    size={20} 
                    className="ml-4 cursor-pointer hover:text-green-900" 
                    onClick={() => setMessage("")}
                />
            </div>
        )}
        {errors && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-auto max-w-lg p-4 bg-red-100 text-red-700 rounded-lg shadow-lg flex items-center justify-between">
                <span>{errors}</span>
                <X 
                    size={20} 
                    className="ml-4 cursor-pointer hover:text-red-900" 
                    onClick={() => setErrors("")}
                />
            </div>
        )}

        <div className="w-xl bg-white px-12 py-8 m-8 rounded-2xl shadow-2xl transition-all duration-300 hover:translate-y-[-3px]">
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

                <div className="mb-6 flex flex-col">  
                    <label className="text-left text-sm font-medium text-gray-700 mb-4">
                        Last Name<span className='text-red-500 font-bold'>*</span>
                    </label>
                    <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                    />
                    {formErrors.lastName && <div className="text-left text-red-500 text-xs mt-1">{formErrors.lastName}</div>}
                </div>

                <div className="mb-6 flex flex-col">  
                    <label className="text-left text-sm font-medium text-gray-700 mb-4">
                        Phone Number<span className='text-red-500 font-bold'>*</span>
                    </label>
                    <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    {formErrors.phone && <div className="text-left text-red-500 text-xs mt-1">{formErrors.phone}</div>}
                </div>

                <div className="mb-6 flex flex-col">  
                    <label className="text-left text-sm font-medium text-gray-700 mb-4">
                        Email Address<span className='text-red-500 font-bold'>*</span>
                    </label>
                    <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {formErrors.email && <div className="text-left text-red-500 text-xs mt-1">{formErrors.email}</div>}
                </div>

                <div className="mb-6 flex flex-col">
                    <label className="text-left text-sm font-medium text-gray-700 mb-4">
                        Password<span className='text-red-500 font-bold'>*</span>
                    </label>
                    <div className="relative">
                        <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
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
                    <label className="text-left text-sm font-medium text-gray-700 mb-4">
                        Confirm Password<span className='text-red-500 font-bold'>*</span>
                    </label>
                    <div className="relative">
                        <input
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
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

                <div className='flex flex-col mb-6'>
                    <div className='flex items-center gap-2 mb-2'>
                    <input 
                        type="checkbox" 
                        id="terms" 
                        name="termsAccepted"
                        checked={formData.termsAccepted}
                        onChange={handleChange}
                    />
                    <label htmlFor="terms" className='text-sm font-medium text-gray-700'>
                        I agree to the 
                        <span className='text-blue-500 cursor-pointer' onClick={() => navigate("/terms-conditions")}> Terms and Conditions</span>
                    </label>
                    </div>
                   
                    {formErrors.termsAccepted && <div className="text-left text-red-500 text-xs ml-2">{formErrors.termsAccepted}</div>}
                </div>

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
  )
}

export default Register