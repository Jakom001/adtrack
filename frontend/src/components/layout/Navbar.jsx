import React, {useState, useEffect, useRef} from 'react';
import { useAuthContext } from '../../context/AuthContext'
import {Link} from 'react-router-dom'
import { LogOut, Moon, Sun, Sunrise, Sunset, SwitchCamera } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout, currentUser } = useAuthContext();
  const [userToggle, setUserToggle] = useState(false);
  const dropdownRef = useRef(null);

  const flname = ((currentUser?.firstName?.charAt(0) ?? '') + (currentUser?.lastName?.charAt(0) ?? '')).toUpperCase();

  // Handle click outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserToggle(false);
      }
    };

    // Add event listener when dropdown is open
    if (userToggle) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userToggle]);

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect could be handled here or in the auth context
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleUserToggle = () => {
    setUserToggle(toggle => !toggle);
  };

  const greetingText = () =>{
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning,'
    if (hour < 16) return 'Good Afternoon,'
    return 'Good Morning,'
  }

  return (
    <div className='w-screen flex justify-between items-center bg-white fixed top-0 z-40'>
      <div className="flex h-[80px] items-center p-4">
        <Link to='/' className='pl-4 text-xl font-bold'>AdTrack</Link>
      </div>
      {isAuthenticated && (
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary  to-secondary bg-clip-text text-transparent">
        {greetingText()} {currentUser?.firstName || 'User'}
        </h1>
      )}
      
      <nav className='p-4'>
        <div className='flex gap-4 items-center'>
         
          {isAuthenticated ? (
            <div ref={dropdownRef} className="relative">
              <button 
                onClick={handleUserToggle} 
                className='mr-6 w-8 p-2 h-8 flex items-center justify-center rounded-full bg-primary text-white font-bold cursor-pointer'
              >
                {flname}
              </button>
              
              {userToggle && (
                <div className='bg-white shadow-xl z-40 p-4 mt-2 absolute top-10 right-0 text-gray-500 flex flex-col gap-2 min-w-[250px] rounded-lg '>
                  <div className="flex items-center justify-around">
                    <p className='cursor-pointer'><Sun/></p>
                    <p className='cursor-pointer'><Moon/></p>
                  </div>
                  <div className="my-4 border-b border-gray-300 w-full"></div>
                  <p className='text-sm'>ACCOUNT</p>
                  <div className='flex items-center gap-4'>
                    <div className='w-12 p-4 h-12 flex items-center justify-center rounded-full bg-primary text-white font-bold'>
                      {flname}
                    </div>
                    <div>
                      <div className='flex gap-2'>
                        <p>{(currentUser?.firstName?.charAt(0).toUpperCase() + currentUser?.firstName?.slice(1).toLowerCase()) || ''}</p> 
                        <p>{(currentUser?.lastName?.charAt(0).toUpperCase() + currentUser?.lastName?.slice(1).toLowerCase()) || ''}</p>
                      </div>
                      <p>{currentUser?.email || ''}</p>
                    </div>
                  </div>

                  <Link to="/dashboard" className="flex items-center gap-2 py-2 px-2 rounded-xl hover:bg-grayColor">
                    <SwitchCamera /> Switch Accounts
                  </Link>
                  <Link to="/dashboard" className="flex items-center gap-2 py-2 px-2 rounded-xl hover:bg-grayColor">
                    <SwitchCamera /> Manage Accounts
                  </Link>
                  <div className="my-4 border-b border-gray-300 w-full"></div>
                  <Link to="/dashboard" className="flex items-center gap-2 py-2 px-2 rounded-xl hover:bg-grayColor">
                    <SwitchCamera /> Todos
                  </Link>
                  
                  <Link to="/dashboard" className="flex items-center gap-2 py-2 px-2 rounded-xl hover:bg-grayColor">
                    <SwitchCamera /> Today
                  </Link>
                  <div className="my-4 border-b border-gray-300 w-full"></div>
                  <button 
                    onClick={handleLogout} 
                    className='my-2 flex items-center gap-2 py-2 px-2 rounded-xl hover:bg-grayColor cursor-pointer w-full'
                  >
                    <LogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to='/login' className='hover:text-gray-300 cursor-pointer'>Sign in</Link>
              <Link to='register' className='hover:text-gray-300 cursor-pointer'>Sign up</Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;