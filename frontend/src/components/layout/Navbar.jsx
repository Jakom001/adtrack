import React from 'react'

const Navbar = () => {
  return (
    <div className='flex justify-between items-center bg-gray-800 text-white'>
        <div className="flex h-[80px] items-center p-4">
            <h1 className='text-xl font-bold'>AdTrack</h1>
        </div>
        
      <nav className='p-4'>
        <ul className='flex gap-4'>
          <li>Home</li>
          <li>About</li>
          <li>Services</li>
          <li>Contact</li>
        </ul>
      </nav>
    </div>
  )
}

export default Navbar
