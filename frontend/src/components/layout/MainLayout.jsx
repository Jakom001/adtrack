import React from 'react'
import { Outlet } from 'react-router-dom'


const MainLayout = () => {
  return (
    <div className='flex h-screen '> 
      
      
      
      {/* Main Content Area */}
      <div className="flex-1 ml-64 overflow-y-auto"> {/* ml-64 to offset the sidebar width */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout