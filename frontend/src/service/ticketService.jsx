import api from "./api";

export const ticketService = {
  getTickets: async (params = {}) => {
    try {
      const response = await api.get('/ticket/all-tickets', { params });
      return { data: response.data.data.tickets, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to fetch the tickets. Please try again" 
      };
    }
  },

  getTicketById: async (id) => {
    try {
      const response = await api.get(`/ticket/single-ticket/${id}`);
      return { data: response.data.data.ticket, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to fetch the ticket details" 
      };
    }
  },

  addTicket: async (ticketData) => {
    try {
      const response = await api.post("/ticket/add-ticket", ticketData);
      return { 
        data: response.data.data.ticket, 
        error: null,
        success: response.data.message || "Ticket added successfully" 
      };
    } catch (error) {
      return {
        data: null, 
        error: error.response?.data?.error || "Failed to add the ticket" 
      };
    }
  },

  updateTicket: async (id, ticketData) => {
    try {
      const response = await api.put(`/ticket/update-ticket/${id}`, ticketData);
      return { data: response.data.data.ticket, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to update the ticket" 
      };
    }
  },

  deleteTicket: async (id) => {
    try {
      const response = await api.delete(`/ticket/delete-ticket/${id}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to delete the ticket" 
      };
    }
  },

  searchTicket: async (searchTerm) => {
    try {
      const response = await api.get('/ticket/search', { params: { q: searchTerm } });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error.response?.data?.error || "Failed to search tickets." 
      };
    }
  }
};