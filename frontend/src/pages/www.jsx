import React, { useState, useEffect, useCallback } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaEdit, FaTrash, FaTimes, FaPlay, FaPause, FaExclamationTriangle } from 'react-icons/fa';
import { Edit, Eye, Trash2, Clock } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, taskId: null, taskTitle: '' });
  const [totalDailyHours, setTotalDailyHours] = useState({ hours: 0, minutes: 0 });

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
    await deleteTask(id);
    setDeleteModal({ isOpen: false, taskId: null, taskTitle: '' });
  };

  // Open delete confirmation modal
  const openDeleteModal = (task) => {
    setDeleteModal({ 
      isOpen: true, 
      taskId: task._id, 
      taskTitle: task.title 
    });
  };

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    await updateTaskStatus(id, newStatus);
  };
  
  // Handle tab change
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setCurrentPage(1);
  };

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  // Calculate total duration from all tasks
  const calculateTotalDailyDuration = (taskList) => {
    if (!taskList || taskList.length === 0) return { hours: 0, minutes: 0 };

    let totalMinutes = 0;

    taskList.forEach(task => {
      if (task.startTime) {
        const start = new Date(task.startTime);
        const end = task.endTime ? new Date(task.endTime) : new Date();
        let diffInMinutes = (end - start) / (1000 * 60);
        
        // Subtract break time if exists
        if (task.breakTime) {
          diffInMinutes -= parseFloat(task.breakTime);
        }
        
        totalMinutes += diffInMinutes;
      }
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    
    return { hours, minutes };
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Update displayed tasks when tasks change or when sorting/filtering/pagination changes
  useEffect(() => {
    if (!tasks.length) return;
    
    let filteredTasks = [...tasks];
    
    // Apply status filter based on active tab
    if (activeTab !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === activeTab);
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
    
    // Calculate total daily hours
    const totalTime = calculateTotalDailyDuration(tasks);
    setTotalDailyHours(totalTime);
  }, [tasks, sortConfig, activeTab]);

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

  // Count tasks by status
  const getTaskCountByStatus = (status) => {
    if (!tasks.length) return 0;
    if (status === 'all') return tasks.length;
    return tasks.filter(task => task.status === status).length;
  };

  return (
    <div className="p-5 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-5">Tasks</h2>
      
      {/* Daily Hours Summary */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center">
          <Clock className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-blue-800">Daily Summary</h3>
        </div>
        <div className="mt-2 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Total hours worked today:</p>
            <p className="text-2xl font-bold text-blue-700">
              {totalDailyHours.hours}h {totalDailyHours.minutes}m
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Tasks completed:</p>
            <p className="text-xl font-semibold text-green-600">
              {getTaskCountByStatus('Completed')}
              <span className="text-gray-400 text-sm font-normal"> / {getTaskCountByStatus('all')}</span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Search and Add New Task button */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-5 gap-4">
        <a 
          href="/tasks/add" 
          className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
        >
          Add New Task
        </a>
        
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
      
      {/* Status Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex flex-wrap -mb-px">
          <button
            onClick={() => handleTabChange('all')}
            className={`inline-flex items-center py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All 
            <span className="ml-2 bg-gray-100 text-gray-700 py-0.5 px-2 rounded-full text-xs">
              {getTaskCountByStatus('all')}
            </span>
          </button>
          <button
            onClick={() => handleTabChange('Pending')}
            className={`inline-flex items-center py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'Pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending
            <span className="ml-2 bg-yellow-100 text-yellow-800 py-0.5 px-2 rounded-full text-xs">
              {getTaskCountByStatus('Pending')}
            </span>
          </button>
         
          <button
            onClick={() => handleTabChange('Completed')}
            className={`inline-flex items-center py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === 'Completed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Completed
            <span className="ml-2 bg-green-100 text-green-800 py-0.5 px-2 rounded-full text-xs">
              {getTaskCountByStatus('Completed')}
            </span>
          </button>
        </nav>
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
                    onClick={() => requestSort('duration')} 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden sm:table-cell"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Duration</span>
                      <span>{getSortDirectionIcon('duration')}</span>
                    </div>
                  </th>
                  <th 
                    onClick={() => requestSort('project')} 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden sm:table-cell"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Project</span>
                      <span>{getSortDirectionIcon('project')}</span>
                    </div>
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
                  <th 
                    onClick={() => requestSort('endTime')} 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden sm:table-cell"
                  >
                    <div className="flex items-center space-x-1">
                      <span>End Time</span>
                      <span>{getSortDirectionIcon('endTime')}</span>
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
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {formatDuration(task.startTime, task.endTime, task.breakTime)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <p>{task.project.title}</p>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        {task.startTime 
                          ? new Date(task.startTime).toLocaleString()
                          : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        {task.endTime 
                          ? new Date(task.endTime).toLocaleString()
                          : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button 
                            className="text-primary hover:text-green-700 cursor-pointer"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="text-indigo-600 hover:text-indigo-900 cursor-pointer">
                          <a 
                              href={`/tasks/edit/${task._id}`}
                            className="text-secondary rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <Edit className="w-5 h-5" />
                          </a>
                          </button>
                          
                          <button 
                            className="text-red-600 hover:text-red-900 cursor-pointer"
                            onClick={() => openDeleteModal(task)}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">
                      {isSearching 
                        ? `No tasks found matching "${searchTerm}"`
                        : activeTab !== 'all'
                          ? `No ${activeTab} tasks found`
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
      
      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden animate-fadeIn">
            <div className="bg-red-50 p-4 sm:p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
                <FaExclamationTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Delete Task</h3>
              <p className="text-sm text-center text-gray-500">
                Are you sure you want to delete the task "{deleteModal.taskTitle}"? This action cannot be undone.
              </p>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col sm:flex-row-reverse gap-2">
              <button
                type="button"
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                onClick={() => handleDelete(deleteModal.taskId)}
              >
                Delete
              </button>
              <button
                type="button"
                className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setDeleteModal({ isOpen: false, taskId: null, taskTitle: '' })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;