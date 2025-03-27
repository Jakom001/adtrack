import { useState } from 'react'
import './App.css'
import Navbar from './components/layout/Navbar'
import { Routes, Route } from'react-router-dom'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Contact from './pages/contact'
import Login from './pages/Login'
import Register from './pages/Register'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Navbar/>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="contact" element={<Contact count={count} />} />
      <Route path="*" element={() => <NotFound />} />

      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
    </Routes>
    </>
  )
}

export default App
