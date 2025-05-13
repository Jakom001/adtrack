import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/layout/Dashboard';
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
import ProjectList from './pages/projects/ProjectList';
import AddProject from './pages/projects/AddProject';
import UpdateProject from './pages/projects/UpdateProject';
import TaskList from './pages/tasks/TaskList';
import AddTask from './pages/tasks/AddTask';
import UpdateTask from './pages/tasks/updateTask';

// Context Providers
import { CategoryContextProvider } from './context/CategoryContext';
import { TaskContextProvider } from './context/TaskContext';
import { ProjectContextProvider } from './context/ProjectContext';
import AddFeature from './pages/features/AddFeature';
import { FeatureContextProvider } from './context/FeatureContext';
import FeatureList from './pages/features/FeatureList';
import UpdateFeature from './pages/features/updateFeature';

AOS.init({ once: false });

function App() {
  const location = useLocation();
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  return (
    <AuthContextProvider>
      <div className="flex flex-col min-h-screen">
        {/* Navbar is shown on all routes except login and register */}
        {!isPublicRoute && <Navbar />}
        
        <div className="flex flex-1 w-full">
          {/* Sidebar is shown on all routes except login and register */}
          {!isPublicRoute && <Sidebar />}
          
          <div className={`flex-1 ${!isPublicRoute ? 'ml-64' : ''} w-full`}>
            <Routes>
              {/* Public Routes */}
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
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  
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
                  <Route path='/tasks'>
                    <Route index element={<TaskList />} />
                    <Route path='add' element={<AddTask />} />
                    <Route path="edit/:id" element={<UpdateTask />} />
                  </Route>

                  {/* Feature Routes */}
                  <Route path='/features'>
                    <Route index element={<FeatureList />} />
                    <Route path='add' element={<AddFeature />} />
                    <Route path="edit/:id" element={<UpdateFeature />} />
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
          </div>
        </div>
      </div>
    </AuthContextProvider>
  );
}

// Component to wrap multiple context providers
const MultiContextProvider = ({ children }) => {
  return (
    <CategoryContextProvider>
      <ProjectContextProvider>
        <TaskContextProvider>
          <FeatureContextProvider>
          {children}
          </FeatureContextProvider>
        </TaskContextProvider>
      </ProjectContextProvider>      
    </CategoryContextProvider>
  );
};

export default App;