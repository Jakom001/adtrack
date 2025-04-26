import React, { createContext, useContext, useEffect, useCallback, useMemo, useState } from 'react';
import { projectService } from '../service/projectService';
import { useAuthContext } from './AuthContext';

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
  
  // All Projects
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await projectService.getProjects();
    console.log(result)
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
      setProjects(prevProjects => [result.data, ...prevProjects]);
    } else {
      setError(result.error);
    }
    
    return result;
  }, [currentUser]);

  // Update project
  const updateProject = useCallback(async (id, projectData) => {
    const previousProjects = [...projects];

    // Optimistic update
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project._id === id ? { ...project, ...projectData } : project
      )
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
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project._id === id ? result.data : project
        )
      );
    } else {
      setProjects(previousProjects);
      setError(result.error);
    }
    
    return result;
  }, [projects, currentUser]);

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