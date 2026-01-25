import { useEffect, useState } from "react";
import { topupService } from "../../services/topupService";
import Search from "antd/es/transfer/search";


const DEFAULT_FILTER = {
  pageNumber: 1,
  pageSize: 10,
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

  const fetchData = async (customFilter = filter) => {
    setLoading(true);
    setData([]);
    try {
      // Clean up filter - don't send null, empty strings, or empty arrays
      const cleanFilter = {};
      for (const [key, value] of Object.entries(customFilter)) {
        if (value !== null && value !== "" && (Array.isArray(value) ? value.length > 0 : true)) {
          cleanFilter[key] = value;
        }
      }
      
      const result = await topupService.getListTopUps(cleanFilter);
      console.log(result);
      // Ensure data is always an array
      const items = result.data?.items || result?.items || result?.data || result || [];
      const totalCount = result.data?.totalCount || result?.totalCount || 0;
      setData(Array.isArray(items) ? items : []);
      setTotal(totalCount);
    } catch (error) {
      console.error("Failed to fetch top up list:", error);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(filter);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  // 🔹 update filter
  const updateFilter = (newFilter) => {
    setData([]);
    setFilter((prev) => ({
      ...prev,
      ...newFilter,
      pageNumber: 1,
    }));
  };

  const changePage = (page, pageSize) => {
    setData([]);
    setFilter((prev) => ({
      ...prev,
      pageNumber: page,
      pageSize,
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
    setData([]);

    setFilter((prev) => ({
      ...prev,
      SortBy: field ? sortByMap[field] : null,
      SortDescending: order === 'descend',
      pageNumber: 1,
    }));
  };

  const resetAndFetch = () => {
    setData([]);
    setFilter({
      ...DEFAULT_FILTER,
      SortBy: 'CreatedDate',
      SortDescending: true,
      pageNumber: 1,
    });
  };

  return {
    data,
    total,
    loading,
    filter,
    updateFilter,
    changePage,
    updateSort,
    fetchData,
    resetAndFetch,
  };
};
