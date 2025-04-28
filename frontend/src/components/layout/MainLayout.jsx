import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen pt-[80px]"> {/* Changed h-screen to min-h-screen for better content handling */}
      {/* Main Content Area */}
      <div className="flex-1 w-full overflow-y-auto">
        <main className="p-6 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;