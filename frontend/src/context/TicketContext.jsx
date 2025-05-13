import React, { createContext, useContext, useEffect, useCallback, useMemo, useState } from 'react';
import { ticketService } from '../service/ticketService';
import { useAuthContext } from './AuthContext';

// Create the context
const TicketContext = createContext(null);

// Custom hook to use the context
function useTicketContext() {
  const context = useContext(TicketContext);

  if (!context) {
    throw new Error("useTicketContext must be used within a TicketProvider");
  }
  return context;
}

// Provider component
function TicketContextProvider({ children }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuthContext();
  
  // All Tickets
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await ticketService.getTickets();

    if (result.data) {
      setTickets(result.data);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  }, []);

  // Get Ticket By ID
  const getSingleTicket = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    const result = await ticketService.getTicketById(id);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
    
    return result;
  }, []);

  // Create ticket with user ID
  const addTicket = useCallback(async (ticketData) => {
    setLoading(true);
    setError(null);
    
    // check if user is authenticated
    if(!currentUser){
      setLoading(false);
      const errorMsg = "You must be logged in to add a ticket";
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }
    
    // Add the current user's ID to the ticket data
    const ticketWithUserId = {
      ...ticketData,
      userId: currentUser?._id 
    };
    
    const result = await ticketService.addTicket(ticketWithUserId);
    setLoading(false);
    
    if (result.data) {
      setTickets(prevTickets => [result.data, ...prevTickets]);
    } else {
      setError(result.error);
    }
    
    return result;
  }, [currentUser]);

  // Update ticket
  const updateTicket = useCallback(async (id, ticketData) => {
    const previousTickets = [...tickets];

    // Optimistic update
    setTickets(prevTickets =>
      prevTickets.map(ticket =>
        ticket._id === id ? { ...ticket, ...ticketData } : ticket
      )
    );
    
    setLoading(true);
    setError(null);

    // check if user is logged in
    if(!currentUser){
      setLoading(false);
      const errorMsg = "You must login to update a ticket";
      setError(errorMsg);
      return { data: null, error: errorMsg };
    }
    
    // Add the current user's ID to the ticket data
    const ticketWithUserId = {
      ...ticketData,
      userId: currentUser?._id 
    };
    

    
    const result = await ticketService.updateTicket(id, ticketWithUserId);
    
    setLoading(false);

    if (result.data) {
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket._id === id ? result.data : ticket
        )
      );
    } else {
      setTickets(previousTickets);
      setError(result.error);
    }
    
    return result;
  }, [tickets, currentUser]);

  // Delete ticket
  const deleteTicket = useCallback(async (id) => {
    const previousTickets = [...tickets];

    // Optimistic update
    setTickets(prevTickets =>
      prevTickets.filter(ticket => ticket._id !== id)
    );
    
    setLoading(true);
    setError(null);
    
    const result = await ticketService.deleteTicket(id);
    
    setLoading(false);

    if (result.error) {
      // Revert to previous state if there was an error
      setTickets(previousTickets);
      setError(result.error);
    }
    
    return result;
  }, [tickets]);

  // Search tickets
  const searchTickets = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      return { data: tickets, error: null };
    }
    
    setLoading(true);
    setError(null);
    
    const result = await ticketService.searchTicket(searchTerm);
    
    setLoading(false);

    if (result.error) {
      setError(result.error);
    }
    
    return result;
  }, [tickets]);

  // Clear any errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load tickets on mount
  useEffect(() => {
    fetchTickets();
    
    return () => {
      // Any cleanup if needed
    };
  }, [fetchTickets]);


  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    tickets,
    loading,
    error,
    clearError,
    fetchTickets,
    updateTicket,
    deleteTicket,
    addTicket,
    getSingleTicket,
    searchTickets,
  }), [
    tickets,
    loading,
    error,
    clearError,
    fetchTickets,
    updateTicket,
    deleteTicket,
    addTicket,
    getSingleTicket,
    searchTickets,
  ]);

  return (
    <TicketContext.Provider value={contextValue}>
      {children}
    </TicketContext.Provider>
  );
}

// Export both the hook and provider
export { useTicketContext, TicketContextProvider };