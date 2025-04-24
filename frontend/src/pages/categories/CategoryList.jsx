import React, { useState, useEffect } from 'react';
import { useCategoryContext } from '../../context/CategoryContext';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';

const CategoryList = () => {
  const {
    categories,
    loading,
    error,
    searchCategories,
    deleteCategory,
    fetchCategories
  } = useCategoryContext();

  // State for the component
  const [displayedCategories, setDisplayedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle search submit
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const result = await searchCategories(searchTerm);
      if (result.data) {
        setDisplayedCategories(result.data);
      }
    } else {
      // If search is cleared, fetch all categories
      fetchCategories();
    }
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

  // Handle delete category
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await deleteCategory(id);
    }
  };

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Update displayed categories when categories change or when sorting/pagination changes
  useEffect(() => {
    let sortedCategories = [...categories];

    // Apply sorting
    if (sortConfig.key) {
      sortedCategories.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setDisplayedCategories(sortedCategories);
  }, [categories, sortConfig]);

  // Calculate pagination indexes
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayedCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayedCategories.length / itemsPerPage);

  return (
    <div className="p-5 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-5">Categories</h2>
      
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-5">
        <div className="flex max-w-md">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FaSearch />
          </button>
        </div>
      </form>

      {/* Items per page selector */}
      <div className="flex items-center mb-4">
        <label htmlFor="itemsPerPage" className="mr-2 text-gray-700">Show entries: </label>
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

      {loading ? (
        <p className="py-4">Loading categories...</p>
      ) : error ? (
        <p className="py-4 text-red-600">Error: {error}</p>
      ) : (
        <>
          {/* Categories table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th 
                    onClick={() => requestSort('title')} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      Title {getSortDirectionIcon('title')}
                    </div>
                  </th>
                  <th 
                    onClick={() => requestSort('description')} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      Description {getSortDirectionIcon('description')}
                    </div>
                  </th>
                  <th 
                    onClick={() => requestSort('createdAt')} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      Created At {getSortDirectionIcon('createdAt')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((category, index) => (
                    <tr key={category._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{indexOfFirstItem + index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            onClick={() => window.location.href = `/categories/edit/${category._id}`}
                          >
                            <FaEdit className="mr-1" /> Edit
                          </button>
                          <button 
                            className="flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            onClick={() => handleDelete(category._id)}
                          >
                            <FaTrash className="mr-1" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No categories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
            <span className="text-sm text-gray-700">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, displayedCategories.length)} of {displayedCategories.length} entries
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 border rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`px-3 py-1 border rounded-md ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 border rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryList;