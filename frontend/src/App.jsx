import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar'
import Home from './pages/Home';
import MainLayout from './components/layout/MainLayout';
import NotFound from './pages/NotFound';
import Contact from './pages/contact';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthContextProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Pages
import CategoryList from './pages/categories/CategoryList';
import AddCategory from './pages/categories/AddCategory';
import UpdateCategory from './pages/categories/UpdateCategory';


// Context Providers
import {CategoryContextProvider} from './context/CategoryContext';
import ProjectList from './pages/projects/ProjectList';
import AddProject from './pages/projects/AddProject';
import UpdateProject from './pages/projects/UpdateProject';
import { ProjectContextProvider } from './context/ProjectContext';
import TaskList from './pages/tasks/TaskList';
import AddTask from './pages/tasks/AddTask';
import UpdateTask from './pages/tasks/updateTask';

AOS.init({ once: false });

function App() {
  const location = useLocation();
  const publicRoutes = ['/login', '/register'];

  return (
    <AuthContextProvider>
      {/* Navbar is shown on all routes except login and register */}
      {!publicRoutes.includes(location.pathname) && <div><Navbar /> <Sidebar /></div> }
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes with Multiple Contexts and MainLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={
            <MultiContextProvider>
              <MainLayout />
            </MultiContextProvider>
          }>
            {/* Dashboard route */}
            <Route path="/dashboard" element={<div>Dashboard Content</div>} />
            
            {/* Category Routes */}
            <Route path="/categories">
              <Route index element={<CategoryList />} />
              <Route path="add" element={<AddCategory />} />
              <Route path="edit/:id" element={<UpdateCategory />} />
            </Route>

            {/* Projects Routes */}
            <Route path="/projects">
              <Route index element={<ProjectList />} />
              <Route path="add" element={<AddProject />} />
              <Route path="edit/:id" element={<UpdateProject />} />
            </Route>

            {/* Tasks Routes */}
            <Route path='/today'>
              <Route index element={<TaskList/>}/>
              <Route path='add' element={<AddTask/>}/>
              <Route path="edit/:id" element={<UpdateTask />} />
            </Route>

          </Route>
        </Route>
        
        {/* Admin-only Routes */}
        <Route element={<ProtectedRoute adminOnly={true} />}>
          <Route path="/admin/*" element={<div>Admin Dashboard</div>} />
        </Route>
        
        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthContextProvider>
  );
}

// Component to wrap multiple context providers
const MultiContextProvider = ({ children }) => {
  return (
    <CategoryContextProvider>
      <ProjectContextProvider>
        {children}
      </ProjectContextProvider>      
    </CategoryContextProvider>
  );
};

export default App;