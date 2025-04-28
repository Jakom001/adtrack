import React, { useState, useEffect, useCallback } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaEdit, FaTrash, FaTimes, FaPlay, FaPause } from 'react-icons/fa';
import { debounce } from 'lodash';

const TaskList = () => {
  const {
    tasks,
    loading,
    error,
    searchTasks,
    deleteTask,
    fetchTasks,
    updateTaskStatus
  } = useTaskContext();

  // State for the component
  const [displayedTasks, setDisplayedTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isSearching, setIsSearching] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (term.trim()) {
        setIsSearching(true);
        const result = await searchTasks(term);
        if (result.data) {
          setDisplayedTasks(result.data);
        }
      } else {
        clearSearch();
      }
    }, 300),
    [searchTasks]
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
    debouncedSearch(value);
  };

  // Clear search
  const clearSearch = async () => {
    setSearchTerm('');
    setIsSearching(false);
    await fetchTasks();
    setCurrentPage(1);
  };

  // Handle sort when header is clicked
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort direction icon
  const getSortDirectionIcon = (columnName) => {
    if (sortConfig.key !== columnName) {
      return <FaSort />;
    }
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // Handle delete task
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
    }
  };

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    await updateTaskStatus(id, newStatus);
  };

  // Handle timer actions (start/pause)
  const handleTimerAction = async (task) => {
    const currentTime = new Date();
    
    if (!task.startTime || task.status === 'pending') {
      // Start the timer
      await updateTaskStatus(task._id, 'in-progress', {
        startTime: currentTime,
        status: 'in-progress'
      });
    } else if (task.status === 'in-progress') {
      // Pause the timer
      let breakTime = task.breakTime ? parseFloat(task.breakTime) : 0;
      if (task.endTime) {
        const endDate = new Date(task.endTime);
        const diffInMinutes = (currentTime - endDate) / (1000 * 60);
        breakTime += diffInMinutes;
      }
      
      await updateTaskStatus(task._id, 'paused', {
        endTime: currentTime,
        breakTime: breakTime.toString(),
        status: 'paused'
      });
    } else if (task.status === 'paused') {
      // Resume the timer
      await updateTaskStatus(task._id, 'in-progress', {
        endTime: null,
        status: 'in-progress'
      });
    }
  };

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Format duration time
  const formatDuration = (startTime, endTime, breakTime) => {
    if (!startTime) return '0h 0m';
    
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    let diffInMinutes = (end - start) / (1000 * 60);
    
    // Subtract break time if exists
    if (breakTime) {
      diffInMinutes -= parseFloat(breakTime);
    }
    
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = Math.floor(diffInMinutes % 60);
    
    return `${hours}h ${minutes}m`;
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Update displayed tasks when tasks change or when sorting/filtering/pagination changes
  useEffect(() => {
    if (!tasks.length) return;
    
    let filteredTasks = [...tasks];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filteredTasks.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setDisplayedTasks(filteredTasks);
  }, [tasks, sortConfig, statusFilter]);

  // Calculate pagination indexes
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayedTasks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayedTasks.length / itemsPerPage);

  // Generate pagination buttons
  const generatePaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5; // Maximum number of page buttons to show
    
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    // Adjust the start page if we're near the end
    if (endPage - startPage + 1 < maxButtons && startPage > 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    // Add first page button if not included
    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => paginate(1)}
          className="px-3 py-1 border rounded-md bg-white text-gray-700 hover:bg-gray-50"
        >
          1
        </button>
      );
      
      // Add ellipsis if there's a gap
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-2 py-1">
            ...
          </span>
        );
      }
    }
    
    // Add page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`px-3 py-1 border rounded-md ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
        >
          {i}
        </button>
      );
    }
    
    // Add last page button if not included
    if (endPage < totalPages) {
      // Add ellipsis if there's a gap
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="px-2 py-1">
            ...
          </span>
        );
      }
      
      buttons.push(
        <button
          key="last"
          onClick={() => paginate(totalPages)}
          className="px-3 py-1 border rounded-md bg-white text-gray-700 hover:bg-gray-50"
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  };

  return (
    <div className="p-5 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-5">Tasks</h2>
      
      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-5 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <a 
            href="/tasks/add" 
            className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
          >
            Add New Task
          </a>
          
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div className="relative w-full sm:w-auto max-w-md">
          <div className="flex items-center">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button 
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="py-4 px-6 bg-red-50 text-red-600 rounded-md">Error: {error}</div>
      ) : (
        <>
          {/* Tasks table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th 
                    onClick={() => requestSort('title')} 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Title</span>
                      <span>{getSortDirectionIcon('title')}</span>
                    </div>
                  </th>
                  <th 
                    onClick={() => requestSort('status')} 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <span>{getSortDirectionIcon('status')}</span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                  >
                    Duration
                  </th>
                  <th 
                    onClick={() => requestSort('startTime')} 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden sm:table-cell"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Start Time</span>
                      <span>{getSortDirectionIcon('startTime')}</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((task, index) => (
                    <tr key={task._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {task.description.length > 50 
                                ? `${task.description.substring(0, 50)}...`
                                : task.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {formatDuration(task.startTime, task.endTime, task.breakTime)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        {task.startTime 
                          ? new Date(task.startTime).toLocaleString()
                          : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleTimerAction(task)}
                            className={`flex items-center justify-center px-3 py-1 rounded-md focus:outline-none focus:ring-2 ${
                              task.status === 'in-progress'
                                ? 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500'
                                : 'bg-primary text-white hover:bg-green-700 focus:ring-green-500'
                            }`}
                          >
                            {task.status === 'in-progress' ? (
                              <>
                                <FaPause className="mr-1" />
                                <span className="hidden sm:inline">Pause</span>
                              </>
                            ) : (
                              <>
                                <FaPlay className="mr-1" />
                                <span className="hidden sm:inline">
                                  {task.status === 'paused' ? 'Resume' : 'Start'}
                                </span>
                              </>
                            )}
                          </button>
                          <a 
                            href={`/tasks/edit/${task._id}`}
                            className="flex items-center justify-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <FaEdit className="mr-1" /> 
                            <span className="hidden sm:inline">Edit</span>
                          </a>
                          <button 
                            className="flex items-center justify-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            onClick={() => handleDelete(task._id)}
                          >
                            <FaTrash className="mr-1" /> 
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                      {isSearching 
                        ? `No tasks found matching "${searchTerm}"`
                        : statusFilter !== 'all'
                          ? `No ${statusFilter} tasks found`
                          : "No tasks found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {displayedTasks.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, displayedTasks.length)} of {displayedTasks.length} entries
              </div>

              {/* Items per page selector */}
              <div className="flex items-center">
                <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-700">Show:</label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              
              {/* Pagination buttons */}
              {totalPages > 1 && (
                <div className="flex flex-wrap justify-center gap-1">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 border rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Previous
                  </button>
                  
                  {generatePaginationButtons()}
                  
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 border rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskList;