import React from 'react';
import { MonitorCheck, FolderOpenDot, CalendarClock, ChartBarStacked, LogOut } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import { Link, NavLink } from 'react-router-dom';

const Sidebar = () => {
  const { logout } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout Failed");
    }
  };
  
  return (
    <div className='h-screen w-64 fixed left-0 top-[80px] flex flex-col z-30 bg-white pt-2 border-r border-gray-200'>
      {/* Navigation links section */}
      <div className="flex-1 px-6 overflow-y-auto custom-scrollbar">
        <NavLink to="/dashboard" className={({isActive}) => 
          `mt-4 flex items-center gap-2 py-2 px-2 rounded-xl hover:bg-grayColor ${isActive ? 'bg-primary hover:bg-secondary text-white' : ''}`
        }>
          <MonitorCheck /> Dashboard
        </NavLink>
        <div className="my-4 border-b border-gray-300 w-full"></div>

        <NavLink to="/categories" className={({isActive}) => 
          `my-2 flex items-center gap-2 py-2 px-2 rounded-xl hover:bg-grayColor ${isActive ? 'bg-primary hover:bg-secondary text-white' : ''}`
        }>
          <ChartBarStacked /> Categories
        </NavLink>

        <NavLink to="/projects" className={({isActive}) => 
          `my-2 flex items-center gap-2 py-2 px-2 rounded-xl hover:bg-grayColor ${isActive ? 'bg-primary hover:bg-secondary text-white' : ''}`
        }>
          <FolderOpenDot /> Projects
        </NavLink>

       

        <NavLink to="/tasks" className={({isActive}) => 
          `my-2 flex items-center gap-2 py-2 px-2 rounded-xl hover:bg-grayColor ${isActive ? 'bg-primary hover:bg-secondary text-white' : ''}`
        }>
          <CalendarClock /> Today
        </NavLink>
      </div>
      
      <div className="px-6 mb-6 mt-auto">
        <button onClick={handleLogout} className="flex items-center gap-2 py-2 px-2 rounded-xl hover:bg-grayColor cursor-pointer w-full">
          <LogOut /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;