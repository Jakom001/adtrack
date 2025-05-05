import React, { createContext, useContext, useEffect, useCallback, useMemo, useState } from 'react';
import { projectService } from '../service/projectService';
import { useAuthContext } from './AuthContext';
import { useCategoryContext } from './CategoryContext';

// Create the context
const ProjectContext = createContext(null);

// Custom hook to use the context
function useProjectContext() {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }
  return context;
}

// Provider component
function ProjectContextProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuthContext();
  const { categories } = useCategoryContext();
  
  // All Projects
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await projectService.getProjects();

    if (result.data) {
      setProjects(result.data);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  }, []);

  // Get Project By ID
  const getSingleProject = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    const result = await projectService.getProjectById(id);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    
    return result;
  }, []);

  // Create project with user ID
  const addProject = useCallback(async (projectData) => {
    setLoading(true);
    setError(null);
    
    // check if user is authenticated
    if(!currentUser){
      setLoading(false);
      const errorMsg = "You must be logged in to add a project";
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }
    
    // Add the current user's ID to the project data
    const projectWithUserId = {
      ...projectData,
      userId: currentUser?._id 
    };
    
    const result = await projectService.addProject(projectWithUserId);
    
    setLoading(false);
    
    if (result.data) {
      // Find the category object that matches the categoryId
      const categoryObj = categories.find(cat => cat._id === projectData.categoryId);
      
      // Add the new project with the full category object to the projects list
      const newProject = {
        ...result.data,
        category: categoryObj || { title: "Loading..." } // Fallback in case category isn't found
      };
      
      setProjects(prevProjects => [newProject, ...prevProjects]);
    } else {
      setError(result.error);
    }
    
    return result;
  }, [currentUser, categories]);

  // Update project
  const updateProject = useCallback(async (id, projectData) => {
    const previousProjects = [...projects];

    // Get the category object for the new categoryId if it's being updated
    const categoryObj = projectData.categoryId 
      ? categories.find(cat => cat._id === projectData.categoryId)
      : null;

    // Optimistic update with category data
    setProjects(prevProjects =>
      prevProjects.map(project => {
        if (project._id === id) {
          return { 
            ...project, 
            ...projectData,
            // Keep existing category if not being updated, otherwise use the new one
            category: categoryObj || project.category
          };
        }
        return project;
      })
    );
    
    setLoading(true);
    setError(null);

    // check if user is logged in
    if(!currentUser){
      setLoading(false);
      const errorMsg = "You must login to update a project";
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }
    
    // Add the current user's ID to the project data
    const projectWithUserId = {
      ...projectData,
      userId: currentUser?._id 
    };
    
    const result = await projectService.updateProject(id, projectWithUserId);
    
    setLoading(false);

    if (result.data) {
      // Make sure the updated project has the correct category info
      const updatedProject = {
        ...result.data,
        category: categoryObj || 
                 projects.find(p => p._id === id)?.category || 
                 { title: "Loading..." }
      };
      
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project._id === id ? updatedProject : project
        )
      );
    } else {
      setProjects(previousProjects);
      setError(result.error);
    }
    
    return result;
  }, [projects, currentUser, categories]);

  // Delete project
  const deleteProject = useCallback(async (id) => {
    const previousProjects = [...projects];

    // Optimistic update
    setProjects(prevProjects =>
      prevProjects.filter(project => project._id !== id)
    );
    
    setLoading(true);
    setError(null);
    
    const result = await projectService.deleteProject(id);
    
    setLoading(false);

    if (result.error) {
      // Revert to previous state if there was an error
      setProjects(previousProjects);
      setError(result.error);
    }
    
    return result;
  }, [projects]);

  // Search projects
  const searchProjects = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      return { data: projects, error: null };
    }
    
    setLoading(true);
    setError(null);
    
    const result = await projectService.searchProject(searchTerm);
    
    setLoading(false);

    if (result.error) {
      setError(result.error);
    }
    
    return result;
  }, [projects]);

  // Clear any errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load projects on mount
  useEffect(() => {
    fetchProjects();
    
    return () => {
      // Any cleanup if needed
    };
  }, [fetchProjects]);


  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    projects,
    loading,
    error,
    clearError,
    fetchProjects,
    updateProject,
    deleteProject,
    addProject,
    getSingleProject,
    searchProjects,
  }), [
    projects,
    loading,
    error,
    clearError,
    fetchProjects,
    updateProject,
    deleteProject,
    addProject,
    getSingleProject,
    searchProjects,
  ]);

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}

// Export both the hook and provider
export { useProjectContext, ProjectContextProvider };