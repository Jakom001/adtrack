import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { useProjectContext } from '../../context/ProjectContext';
import { useCategoryContext } from '../../context/CategoryContext';
import { useAuthContext } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, Clock, CheckCircle, XCircle, PlusCircle, Search, Filter, Trash2, Edit, Calendar as CalendarIcon } from 'lucide-react';

const Dashboard = () => {
  const { tasks, loading, error, fetchTasks, addTask, deleteTask, updateTask } = useTaskContext();
  const { projects } = useProjectContext();
  const { categories } = useCategoryContext();
  const { currentUser } = useAuthContext();
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeFilter, setTimeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'Pending',
    projectId: '',
    startTime: new Date().toISOString(),
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // COLORS for charts
  const COLORS = ['#387269', '#B59A65', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#a4de6c', '#d0ed57'];
  
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
  
  // Calculate duration in hours
  const calculateDurationHours = (startTime, endTime, breakTime) => {
    if (!startTime) return 0;
    
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    let diffInMinutes = (end - start) / (1000 * 60);
    
    // Subtract break time if exists
    if (breakTime) {
      diffInMinutes -= parseFloat(breakTime);
    }
    
    return parseFloat((diffInMinutes / 60).toFixed(1));
  };

  // Helper function to filter tasks by date range
  const filterTasksByDate = (tasks) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    
    const thisYearStart = new Date(today.getFullYear(), 0, 1);
    
    const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(today.getFullYear(), 0, 0);
    
    switch (timeFilter) {
      case 'today':
        return tasks.filter(task => {
          const taskDate = new Date(task.startTime);
          return taskDate >= today;
        });
      case 'this_week':
        return tasks.filter(task => {
          const taskDate = new Date(task.startTime);
          return taskDate >= thisWeekStart;
        });
      case 'last_week':
        return tasks.filter(task => {
          const taskDate = new Date(task.startTime);
          return taskDate >= lastWeekStart && taskDate < thisWeekStart;
        });
      case 'this_month':
        return tasks.filter(task => {
          const taskDate = new Date(task.startTime);
          return taskDate >= thisMonthStart;
        });
      case 'last_month':
        return tasks.filter(task => {
          const taskDate = new Date(task.startTime);
          return taskDate >= lastMonthStart && taskDate < thisMonthStart;
        });
      case 'this_year':
        return tasks.filter(task => {
          const taskDate = new Date(task.startTime);
          return taskDate >= thisYearStart;
        });
      case 'last_year':
        return tasks.filter(task => {
          const taskDate = new Date(task.startTime);
          return taskDate >= lastYearStart && taskDate <= lastYearEnd;
        });
      case 'date_range':
        if (dateRange.startDate && dateRange.endDate) {
          const start = new Date(dateRange.startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(dateRange.endDate);
          end.setHours(23, 59, 59, 999);
          
          return tasks.filter(task => {
            const taskDate = new Date(task.startTime);
            return taskDate >= start && taskDate <= end;
          });
        }
        return tasks;
      default:
        return tasks;
    }
  };

  useEffect(() => {
    // First filter by date
    let dateFiltered = filterTasksByDate(tasks);
    
    // Then apply other filters
    let filtered = [...dateFiltered];
    
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }
    
    if (selectedProject !== 'All') {
      filtered = filtered.filter(task => {
        // Handle both populated and unpopulated project references
        return task.project?._id === selectedProject || task.project === selectedProject;
      });
    }
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(task => {
        // Find the project associated with this task
        const project = projects.find(p => 
          p._id === task.project?._id || (task.project && p._id === task.project._id)
        );
        
        // Check if project's category matches selected category
        return project && (
          project.category?._id === selectedCategory || 
          project.category === selectedCategory
        );
      });
    }
    
    setFilteredTasks(filtered);
  }, [tasks, searchTerm, selectedStatus, selectedProject, selectedCategory, timeFilter, dateRange, projects]);

  // Calculate summary statistics for filtered tasks
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(task => task.status === 'Completed').length;
  const pendingTasks = filteredTasks.filter(task => task.status === 'Pending').length;

  // Calculate hours spent
  const totalHoursSpent = filteredTasks.reduce((total, task) => {
    return total + calculateDurationHours(task.startTime, task.endTime, task.breakTime);
  }, 0).toFixed(1);

  // Calculate average time per task (in hours)
  const avgTimePerTask = totalTasks > 0 
    ? (filteredTasks.reduce((total, task) => 
        total + calculateDurationHours(task.startTime, task.endTime, task.breakTime), 0) / totalTasks).toFixed(1)
    : 0;

  // Prepare data for charts
  const statusData = [
    { name: 'Completed', value: completedTasks },
    { name: 'Pending', value: pendingTasks },
  ];

  // Category distribution data - for pie chart
  const categoryData = categories.map(category => {
    // Calculate hours for this category
    const hours = filteredTasks
      .filter(task => {
        const project = projects.find(p => 
          p._id === task.project?._id || (task.project && p._id === task.project._id)
        );
        return project && (
          project.category?._id === category._id || 
          project.category === category._id
        );
      })
      .reduce((total, task) => 
        total + calculateDurationHours(task.startTime, task.endTime, task.breakTime), 0);
    
    return {
      name: category.title,
      value: parseFloat(hours.toFixed(1))
    };
  }).filter(item => item.value > 0).sort((a, b) => b.value - a.value);

  // Project distribution data
  const projectData = projects.map(project => {
    const count = filteredTasks.filter(task => task.project?._id === project._id).length;
    const hours = filteredTasks
      .filter(task => task.project?._id === project._id)
      .reduce((total, task) => 
        total + calculateDurationHours(task.startTime, task.endTime, task.breakTime), 0);
    
    return {
      name: project.title,
      count: count,
      hours: parseFloat(hours.toFixed(1))
    };
  }).filter(item => item.count > 0).sort((a, b) => b.count - a.count).slice(0, 5); // Top 5 projects

  // Time spent by day data (for line chart)
  const timeByDayMap = {};
  filteredTasks.forEach(task => {
    if (task.startTime) {
      const date = new Date(task.startTime).toLocaleDateString();
      if (!timeByDayMap[date]) {
        timeByDayMap[date] = 0;
      }
      timeByDayMap[date] += calculateDurationHours(task.startTime, task.endTime, task.breakTime);
    }
  });
  
  const timeByDayData = Object.keys(timeByDayMap).map(date => ({
    date,
    hours: parseFloat(timeByDayMap[date].toFixed(1))
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Handle adding a new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    await addTask(newTask);
    setNewTask({
      title: '',
      description: '',
      status: 'Pending',
      projectId: '',
      startTime: new Date().toISOString(),
    });
    fetchTasks();
  };

  // Handle task status toggle
  const handleStatusToggle = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    await updateTask(taskId, { status: newStatus });
    fetchTasks();
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
      fetchTasks();
    }
  };

  // Pagination functions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTasks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4">
        <span className="block sm:inline">Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Task Dashboard</h1>
          
          <a 
            href="/tasks/add" 
            className="flex items-center w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
          >
            <PlusCircle className="w-5 h-5 mr-2" /> New Task
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4">
        {/* Time Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Time Period</h2>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1 rounded-md ${timeFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              All Time
            </button>
            <button 
              onClick={() => setTimeFilter('today')}
              className={`px-3 py-1 rounded-md ${timeFilter === 'today' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Today
            </button>
            <button 
              onClick={() => setTimeFilter('this_week')}
              className={`px-3 py-1 rounded-md ${timeFilter === 'this_week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              This Week
            </button>
            <button 
              onClick={() => setTimeFilter('last_week')}
              className={`px-3 py-1 rounded-md ${timeFilter === 'last_week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Last Week
            </button>
            <button 
              onClick={() => setTimeFilter('this_month')}
              className={`px-3 py-1 rounded-md ${timeFilter === 'this_month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              This Month
            </button>
            <button 
              onClick={() => setTimeFilter('last_month')}
              className={`px-3 py-1 rounded-md ${timeFilter === 'last_month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Last Month
            </button>
            <button 
              onClick={() => setTimeFilter('this_year')}
              className={`px-3 py-1 rounded-md ${timeFilter === 'this_year' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              This Year
            </button>
            <button 
              onClick={() => setTimeFilter('last_year')}
              className={`px-3 py-1 rounded-md ${timeFilter === 'last_year' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Last Year
            </button>
            <button 
              onClick={() => setTimeFilter('date_range')}
              className={`px-3 py-1 rounded-md ${timeFilter === 'date_range' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Custom Range
            </button>
          </div>
          
          {timeFilter === 'date_range' && (
            <div className="mt-3 flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input 
                  type="date" 
                  className="border border-gray-300 rounded-md p-2"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input 
                  type="date" 
                  className="border border-gray-300 rounded-md p-2"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                />
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 font-medium">Total Tasks</p>
                <h3 className="text-2xl font-bold">{totalTasks}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 font-medium">Completed</p>
                <h3 className="text-2xl font-bold">{completedTasks}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
                <Clock className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 font-medium">Hours Spent</p>
                <h3 className="text-2xl font-bold">{totalHoursSpent}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-500">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 font-medium">Avg Hours/Task</p>
                <h3 className="text-2xl font-bold">{avgTimePerTask}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Task Status</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Tasks by Project</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={projectData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Tasks" />
                  <Bar yAxisId="right" dataKey="hours" fill="#82ca9d" name="Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Hours by Category</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}h`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} hours`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Hours Spent Over Time</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timeByDayData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45} 
                    textAnchor="end"
                    height={60}
                    tick={{fontSize: 10}}
                  />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} hours`} />
                  <Legend />
                  <Line type="monotone" dataKey="hours" stroke="#8884d8" name="Hours" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Your Tasks</h2>
            
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                </select>
                
                <select
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>{category.title}</option>
                  ))}
                </select>
                
                <select
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                >
                  <option value="All">All Projects</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Task List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map(task => {
                    // Find the project associated with this task
                    const project = projects.find(p => p._id === task.project?._id || 
                                                (task.project && p._id === task.project._id));
                    // Find the category associated with this project
                    const category = categories.find(c => project && 
                      (c._id === project.category?._id || c._id === project.category));
                    
                    return (
                      <tr key={task._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{task.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            {category?.title || 'No Category'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {project?.title || 'No Project'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => handleStatusToggle(task._id, task.status)}
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${task.status === 'Completed' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                              }`}
                          >
                            {task.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDuration(task.startTime, task.endTime, task.breakTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {task.startTime ? new Date(task.startTime).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <a href={`/tasks/edit/${task._id}`} className="text-indigo-600 hover:text-indigo-900">
                              <Edit className="w-5 h-5" />
                            </a>
                            <button 
                              onClick={() => handleDeleteTask(task._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;