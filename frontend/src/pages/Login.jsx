import React from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';

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
        
        try{
            const response = await axios.post('http://localhost:5000/api/login', formData);
            setLoading(false);
            setMessage(response.data.message);
            // const response = await fetch('http://localhost:5000/api/login', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(formData)
            // });
            // const data = await response.json();
            // setLoading(false);
            // if(!response.ok){
            //     setErrors(data.message);
            //     return;
            // }
            // setMessage(data.message);
            // navigate('/dashboard');
        }catch(error){
            setLoading(false);
            setErrors(error.response?.data?.message);
        }

        
    };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen text-center'>
        <div className="w-96 bg-white p-6 rounded-lg shadow-lg">
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>
            Login 
          </h2>
        {message && <div className="p-3 bg-green-100 text-green-700 rounded">{message}</div>}
        {errors && <div className="p-3 bg-red-100 text-red-700 rounded">{errors}</div>}

        <form onSubmit={handleSubmit}>
            <div className="mb-4 flex items-center justify-between gap-4">  
                <label className="block text-sm font-medium text-gray-700 mb-1 w-20">
                    Email: 
                </label>
                <div className='flex w-full flex-col items-start'>
                    <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    
                    />
                    {formErrors.email && <div className="text-red-500 text-xs">{formErrors.email}</div>}
                </div>
                
            </div>
            <div className="mb-4 flex items-center justify-between gap-4">
                <label className="block text-sm font-medium text-gray-700 mb-1 w-20">
                    Password: 
                </label>
                <div className='flex flex-col w-full items-start'>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {formErrors.password && <div className="text-red-500 text-xs">{formErrors.password}</div>}
                </div>
                
            </div>
            <div className="flex items-center justify-between gap-4">
                <button
                    type="submit"
                  className="w-full p-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 disabled:opacity-50"
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
