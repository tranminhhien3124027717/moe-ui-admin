import { useEffect, useState, useRef, useCallback } from "react";
import { topupService } from "../../services/topupService";

const DEFAULT_FILTER = {
  PageNumber: 1,
  PageSize: 10,
  Statuses: [],
  Search: null,
  Types: null,
  ResidentialStatuses: [],
  ScheduledDateFrom: null,
  ScheduledDateTo: null,
  SortBy: 'CreatedDate',
  SortDescending: true,
};

export const useTopUpList = () => {
  const [filter, setFilter] = useState(DEFAULT_FILTER);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Track the latest request to prevent race conditions
  const fetchRequestRef = useRef(0);

  const fetchData = useCallback(async (customFilter) => {
    const filterToUse = customFilter || filter;
    // Increment request ID to track this specific request
    const requestId = ++fetchRequestRef.current;
    
    setLoading(true);
    try {
      // Clean up filter - don't send null, empty strings, or empty arrays
      const cleanFilter = {};
      for (const [key, value] of Object.entries(filterToUse)) {
        if (value !== null && value !== "" && (Array.isArray(value) ? value.length > 0 : true)) {
          cleanFilter[key] = value;
        }
      }
      
      const result = await topupService.getListTopUps(cleanFilter);
      
      // Only update state if this is still the latest request (prevent race condition)
      if (requestId !== fetchRequestRef.current) {
        return;
      }
      
      // Ensure data is always an array
      const items = result.data?.items || result?.items || result?.data || result || [];
      const totalCount = result.data?.totalCount || result?.totalCount || 0;
      
      setData(Array.isArray(items) ? items : []);
      setTotal(totalCount);
    } catch (error) {
      // Only handle error if this is still the latest request
      if (requestId !== fetchRequestRef.current) {
        return;
      }
      console.error("Failed to fetch top up list:", error);
      setData([]);
      setTotal(0);
    } finally {
      // Only update loading if this is still the latest request
      if (requestId === fetchRequestRef.current) {
        setLoading(false);
      }
    }
  }, [filter]);

  useEffect(() => {
    fetchData(filter);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  // 🔹 update filter
  const updateFilter = (newFilter) => {
    setFilter((prev) => ({
      ...prev,
      ...newFilter,
      PageNumber: 1,
    }));
  };

  const changePage = (page, pageSize) => {
    setFilter((prev) => ({
      ...prev,
      PageNumber: page,
      PageSize: pageSize,
    }));
  };

  const updateSort = (field, order) => {
    // Map Ant Design sort order to backend expectations
    const sortByMap = {
      'type': 'Type',
      'name': 'RuleName',
      'amount': 'Amount',
      'status': 'Status',
      'scheduledTime': 'ScheduledTime',
      'createdDate': 'CreatedDate'
    };

    setFilter((prev) => ({
      ...prev,
      SortBy: field ? sortByMap[field] : null,
      SortDescending: order === 'descend',
      PageNumber: 1,
    }));
  };

  const resetAndFetch = () => {
    setFilter({
      ...DEFAULT_FILTER,
      SortBy: 'CreatedDate',
      SortDescending: true,
      PageNumber: 1,
    });
  };

  return {
    data,
    total,
    loading,
    filter,
    // Expose with lowercase for component compatibility
    pageNumber: filter.PageNumber,
    pageSize: filter.PageSize,
    updateFilter,
    changePage,
    updateSort,
    fetchData,
    resetAndFetch,
  };
};
