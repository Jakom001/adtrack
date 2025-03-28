import React from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import { loginUser } from '../api/authApi';
const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = React.useState({
        email: '',
        password: ''
    });
    const [formErrors, setFormErrors] = React.useState({});
    const [errors, setErrors] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const validateForm = ()=>{
        let newErrors = {}
        if(!formData.email.trim()){
            newErrors.email = "Email is required";
        }else if(!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)){
            newErrors.email = "Email is invalid";
        }
        if (!formData.password.trim()){
            newErrors.password = "Password is required";
        }else if(formData.password.length < 8){
            newErrors.password = "Password must be at least 8 characters";
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
        
        const { data, error } = await loginUser(formData); 

        setLoading(false);

        if (error) {
            setErrors(error); 
        } else {
            setMessage(data.message);
            setFormData({ email: "", password: "" });

            setTimeout(() => {
                navigate("/home");
            }, 2000);
        }
    };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen text-center'>
        <div className="w-xl bg-white p-12 rounded-lg shadow-lg">
            <div className="flex flex-col items-center justify-center gap-3 mb-6">
                <h1 className='text-3xl font-bold text-gray-900'>
                    Adtrack 
                </h1>
                <div className='bg-green-500 w-12 h-1 rounded-md'></div>
                <p className='text-gray-700 text-lg  font-medium'>Welcome back! Log in to your account</p>
                <p className='text-gray-700 text-base'>Don't have an account? <span className='text-blue-500 cursor-pointer' onClick={() => navigate("/register")}>Register</span></p>
          </div>

        {message && <div className="p-3 bg-green-100 text-green-700 rounded mb-4">{message}</div>}
        {errors && <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{errors}</div>}

        <form onSubmit={handleSubmit}>
            <div className="mb-8 flex flex-col">  
                <label className="text-left text-sm font-medium text-gray-700 mb-4 ">
                    Email<span className='text-red-500 font-bold'>*</span>
                </label>
                <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                />
                {formErrors.email && <div className="text-red-500 text-xs">{formErrors.email}</div>}
                
            </div>
            <div className="mb-8 flex flex-col">
                
                <div className='flex justify-between'>
                    <label className="text-left text-sm font-medium text-gray-700 mb-4 ">
                        Password<span className='text-red-500 font-bold'>*</span>
                    </label>
                        <p className='text-blue-500 cursor-pointer' onClick={() => navigate("/forgot-password")}>Forgot Password?</p>
                </div>
                
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {formErrors.password && <div className="text-red-500 text-xs">{formErrors.password}</div>}
    
            </div>
            <div className="flex items-center justify-between mb-8">
                <div className='flex items-center gap-2'>
                    <input type="checkbox" id="remember" />
                    <label htmlFor="remember" className='text-sm font-medium text-gray-700'>Remember me</label>
                </div>
                <p className='text-sm font-medium text-gray-700'>Privacy Policy</p>
            </div>
            <div className="flex items-center justify-between gap-4">
                <button
                    type="submit"
                  className="w-full p-2 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading}
                >
                   {loading ? "Logging in..." : "Login"}
                </button>
                
            </div>
        </form>
        </div>
    </div>
  )
}

export default Login
