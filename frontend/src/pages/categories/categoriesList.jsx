import { use } from "react";
import { useState, useEffect } from "react";

const CategoryList = () => {
    // State Management
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Table Structure
    const [sortField, setSortField] = useState('name')
    const [sortDirection, setSortDirection] = useState('asc')
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({})

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    //Column definations
    const columns = [
        { field: 'name', header: 'Name', sortable: true },
        { field: 'age', header: 'Age', sortable: true },
        { field: 'city', header: 'City', sortable: true, filterable: true },
        { field: 'occupation', header: 'Occupation', sortable: true, filterable: true }
      ];


      useEffect(() => {
        const fetchData = async () => {
          setLoading(true);
          try {
            // Construct query parameters
            const params = new URLSearchParams({
              page: currentPage,
              pageSize,
              sortField,
              sortDirection,
              searchTerm,
              ...filters
            });
            
            // Make API request
            const response = await fetch(`/api/employees?${params}`);
            if (!response.ok) throw new Error('Failed to fetch data');
            
            const result = await response.json();
            setData(result.data);
            setTotalRecords(result.totalRecords);
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        };
        
        fetchData();
      }, [currentPage, pageSize, sortField, sortDirection, searchTerm, filters]);
    
}