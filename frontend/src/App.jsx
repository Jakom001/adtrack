import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Contact from './pages/contact';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init({
  once: false
}
);
function App() {
  const [count, setCount] = useState(0);
  const location = useLocation();

  // Hide Navbar on login and register pages
  const hideNavbarRoutes = ['/login', '/register'];

  return (
    <>
      {!hideNavbarRoutes.includes(location.pathname) && <Navbar />}
      <AuthProvider>
        <Routes>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="contact" element={<Contact count={count} />} />
        <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
