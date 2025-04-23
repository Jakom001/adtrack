import { Routes, Route, useLocation, Outlet } from 'react-router-dom';
import './App.css';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Contact from './pages/contact';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthContextProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Pages
import AddCategory from './pages/categories/AddCategory';
import UpdateCategory from './pages/categories/UpdateCategory';

// Context Providers
import CategoryContextProvider from './context/CategoryContext';


AOS.init({ once: false });

function App() {
  const location = useLocation();
  const publicRoutes = ['/login', '/register', ];

  return (
    <>
      {!publicRoutes.includes(location.pathname) && <Navbar />}
      
      <AuthContextProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Protected Routes with Multiple Contexts */}
          <Route element={<ProtectedRoute />}>
            {/* Dashboard Layout with all contexts */}
            <Route element={
              <MultiContextProvider>
                <Outlet />
              </MultiContextProvider>
            }>
              {/* Category Routes */}
              <Route path="/categories">
                {/* <Route index element={<CategoriesList />} /> */}
                <Route path="add" element={<AddCategory />} />
                { <Route path="edit/:id" element={<UpdateCategory />} /> }
              </Route>
    
              
              
              
              
            </Route>
          </Route>
          
          {/* Admin-only Routes */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            {/* <Route path="/admin/*" element={<AdminDashboard />} /> */}
          </Route>
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthContextProvider>
    </>
  );
}

// Component to wrap multiple context providers
const MultiContextProvider = ({ children }) => {
  return (
    <CategoryContextProvider>
            {children}
    </CategoryContextProvider>
  );
};

export default App;



// import { lazy, Suspense } from 'react';

// // Lazy load components
// const CategoriesList = lazy(() => import('./pages/categories/CategoriesList'));
// const AddCategory = lazy(() => import('./pages/categories/AddCategory'));
// // ... other lazy imports

// // Then in your Routes
// <Route path="/categories">
//   <Route index element={
//     <Suspense fallback={<div>Loading...</div>}>
//       <CategoriesList />
//     </Suspense>
//   } />
//   {/* Other routes with Suspense */}
// </Route>