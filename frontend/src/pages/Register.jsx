import React from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../api/authApi';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = React.useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [formErrors, setFormErrors] = React.useState({});
    const [errors, setErrors] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const validateForm = () => {
        let newErrors = {}
        
        // First Name validation
        if(!formData.firstName.trim()){
            newErrors.firstName = "First Name is required";
        }

        // Last Name validation
        if(!formData.lastName.trim()){
            newErrors.lastName = "Last Name is required";
        }

        // Phone validation
        if(!formData.phone.trim()){
            newErrors.phone = "Phone number is required";
        } else if(!/^\d{10}$/.test(formData.phone)){
            newErrors.phone = "Phone number must be 10 digits";
        }

        // Email validation
        if(!formData.email.trim()){
            newErrors.email = "Email is required";
        } else if(!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)){
            newErrors.email = "Email is invalid";
        }

        // Password validation
        if (!formData.password.trim()){
            newErrors.password = "Password is required";
        } else if(formData.password.length < 8){
            newErrors.password = "Password must be at least 8 characters";
        }

        // Confirm Password validation
        if (!formData.confirmPassword.trim()){
            newErrors.confirmPassword = "Please confirm your password";
        } else if(formData.password !== formData.confirmPassword){
            newErrors.confirmPassword = "Passwords do not match";
        }

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
        if(formErrors[name]) setFormErrors((prevErrors) => ({
            ...prevErrors,
            [name]: null
        }));
        if(errors) setErrors("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setErrors("");
        if(!validateForm()) return;
        setLoading(true);
        
        const { data, error } = await registerUser(formData); 

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
                confirmPassword: ''
            });

            setTimeout(() => {
                navigate("/login");
            }, 2000);
        }
    };


    return (
        <div className='flex flex-col items-center justify-center min-h-screen text-center'>
            <div className="w-xl bg-white p-6 rounded-lg shadow-lg">
              <h2 className='text-2xl font-bold text-gray-900 mb-6'>
                Register 
              </h2>
            {message && <div className="p-3 bg-green-100 text-green-700 rounded mb-4">{message}</div>}
            {errors && <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{errors}</div>}
    
            <form onSubmit={handleSubmit}>
                <div className="mb-4 flex flex-col">  
                    <label className="text-left text-sm font-medium text-gray-700 mb-1">
                        First Name
                    </label>
                    <div className='flex flex-col w-full'>
                        <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        />
                        {formErrors.firstName && <div className="text-red-500 text-xs mt-1">{formErrors.firstName}</div>}
                    </div>
                </div>
    
                <div className="mb-4 flex flex-col">  
                    <label className="text-left text-sm font-medium text-gray-700 mb-1">
                        Last Name
                    </label>
                    <div className='flex flex-col w-full'>
                        <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        />
                        {formErrors.lastName && <div className="text-red-500 text-xs mt-1">{formErrors.lastName}</div>}
                    </div>
                </div>
    
                <div className="mb-4 flex flex-col">  
                    <label className="text-left text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                    </label>
                    <div className='flex flex-col w-full'>
                        <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        />
                        {formErrors.phone && <div className="text-red-500 text-xs mt-1">{formErrors.phone}</div>}
                    </div>
                </div>
    
                <div className="mb-4 flex flex-col">  
                    <label className="text-left text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <div className='flex flex-col w-full'>
                        <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        />
                        {formErrors.email && <div className="text-red-500 text-xs mt-1">{formErrors.email}</div>}
                    </div>
                </div>
    
                <div className="mb-4 flex flex-col">
                    <label className="text-left text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <div className='flex flex-col w-full'>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {formErrors.password && <div className="text-red-500 text-xs mt-1">{formErrors.password}</div>}
                    </div>
                </div>
    
                <div className="mb-4 flex flex-col">
                    <label className="text-left text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                    </label>
                    <div className='flex flex-col w-full'>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {formErrors.confirmPassword && <div className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</div>}
                    </div>
                </div>
    
                <div className="flex items-center">
                    <button
                        type="submit"
                      className="w-full p-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 disabled:opacity-50"
                      disabled={loading}
                    >
                       {loading ? "Registering..." : "Register"}
                    </button>
                </div>
            </form>
            </div>
        </div>
      )
    }

export default Register