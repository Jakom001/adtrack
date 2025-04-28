import React, { createContext, useContext, useEffect, useCallback, useMemo, useState } from 'react';
import { taskService } from '../service/taskService';
import { useAuthContext } from './AuthContext';

// Create the context
const TaskContext = createContext(null);

// Custom hook to use the context
function useTaskContext() {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}

// Provider component
function TaskContextProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuthContext();
  
  // All Tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await taskService.getTasks();

    if (result.data) {
      setTasks(result.data);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  }, []);

  // Get Task By ID
  const getSingleTask = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    const result = await taskService.getTaskById(id);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    
    return result;
  }, []);

  // Create task with user ID
  const addTask = useCallback(async (taskData) => {
    setLoading(true);
    setError(null);
    
    // check if user is authenticated
    if(!currentUser){
      setLoading(false);
      const errorMsg = "You must be logged in to add a task";
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }
    
    // Add the current user's ID to the task data
    const taskWithUserId = {
      ...taskData,
      userId: currentUser?._id 
    };
    
    const result = await taskService.addTask(taskWithUserId);
    setLoading(false);
    
    if (result.data) {
      setTasks(prevTasks => [result.data, ...prevTasks]);
    } else {
      setError(result.error);
    }
    
    return result;
  }, [currentUser]);

  // Update task
  const updateTask = useCallback(async (id, taskData) => {
    const previousTasks = [...tasks];

    // Optimistic update
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task._id === id ? { ...task, ...taskData } : task
      )
    );
    
    setLoading(true);
    setError(null);

    // check if user is logged in
    if(!currentUser){
      setLoading(false);
      const errorMsg = "You must login to update a task";
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }
    
    // Add the current user's ID to the task data
    const taskWithUserId = {
      ...taskData,
      userId: currentUser?._id 
    };
    

    
    const result = await taskService.updateTask(id, taskWithUserId);
    
    setLoading(false);

    if (result.data) {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === id ? result.data : task
        )
      );
    } else {
      setTasks(previousTasks);
      setError(result.error);
    }
    
    return result;
  }, [tasks, currentUser]);

  // Delete task
  const deleteTask = useCallback(async (id) => {
    const previousTasks = [...tasks];

    // Optimistic update
    setTasks(prevTasks =>
      prevTasks.filter(task => task._id !== id)
    );
    
    setLoading(true);
    setError(null);
    
    const result = await taskService.deleteTask(id);
    
    setLoading(false);

    if (result.error) {
      // Revert to previous state if there was an error
      setTasks(previousTasks);
      setError(result.error);
    }
    
    return result;
  }, [tasks]);

  // Search tasks
  const searchTasks = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      return { data: tasks, error: null };
    }
    
    setLoading(true);
    setError(null);
    
    const result = await taskService.searchTask(searchTerm);
    
    setLoading(false);

    if (result.error) {
      setError(result.error);
    }
    
    return result;
  }, [tasks]);

  // Clear any errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
    
    return () => {
      // Any cleanup if needed
    };
  }, [fetchTasks]);


  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    tasks,
    loading,
    error,
    clearError,
    fetchTasks,
    updateTask,
    deleteTask,
    addTask,
    getSingleTask,
    searchTasks,
  }), [
    tasks,
    loading,
    error,
    clearError,
    fetchTasks,
    updateTask,
    deleteTask,
    addTask,
    getSingleTask,
    searchTasks,
  ]);

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
}

// Export both the hook and provider
export { useTaskContext, TaskContextProvider };