import React from 'react';
import { useAuthContext } from '../../context/AuthContext'

const Navbar = () => {
  const { isAuthenticated, logout, currentUser } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect could be handled here or in the auth context
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className='flex justify-between items-center bg-gray-800 text-white'>
      <div className="flex h-[80px] items-center p-4">
        <h1 className='text-xl font-bold'>AdTrack</h1>
      </div>
      
      <nav className='p-4'>
        <ul className='flex gap-4 items-center'>
          <li className='hover:text-gray-300 cursor-pointer'>Home</li>
          <li className='hover:text-gray-300 cursor-pointer'>About</li>
          <li className='hover:text-gray-300 cursor-pointer'>Services</li>
          <li className='hover:text-gray-300 cursor-pointer'>Contact</li>
          
          {isAuthenticated && (
            <>
              <li className='ml-4 text-gray-300'>
                Hi, {currentUser?.firstName || 'User'}
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  className='ml-2 px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors cursor-pointer'
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;