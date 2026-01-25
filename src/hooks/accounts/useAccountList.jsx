import { useEffect, useState } from "react";
import { accountService } from "../../services/accountService";


const DEFAULT_FILTER = {
  pageNumber: 1,
  pageSize: 20,
  Search: "",
  EducationLevels: [],
  SchoolingStatus: "",
  ResidentialStatuses: [],
  MinBalance: null,
  MaxBalance: null,
  MinAge: null,
  MaxAge: null,
  SortBy: null,
  SortDescending: false,
  IsActive: true,
};

export const useAccountList = () => {
  const [filter, setFilter] = useState(DEFAULT_FILTER);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async (customFilter = filter) => {
    setLoading(true);
    try {
      const result = await accountService.getListAccount(customFilter);
      console.log(result.data);
      // Ensure data is always an array
      const items = result.data?.items || result?.items || [];
      const totalCount = result.data?.totalCount || result?.totalCount || 0;
      setData(Array.isArray(items) ? items : []);
      setTotal(totalCount);
    } catch (error) {
      console.error("Failed to fetch account list:", error);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  // 🔹 update filter
  const updateFilter = (newFilter) => {
    setFilter((prev) => ({
      ...prev,
      ...newFilter,
      pageNumber: 1,
    }));
  };

  const changePage = (page, pageSize) => {
    setFilter((prev) => ({
      ...prev,
      pageNumber: page,
      pageSize,
    }));
  };

  const updateSort = (field, order) => {
    // Map Ant Design sort order to backend expectations
    const sortByMap = {
      'fullName': 'FullName',
      'age': 'Age',
      'balance': 'Balance',
      'educationLevel': 'EducationLevel',
      'created': 'CreatedDate'
    };

    setFilter((prev) => ({
      ...prev,
      SortBy: field ? sortByMap[field] : null,
      SortDescending: order === 'descend',
      pageNumber: 1,
    }));
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
  };
};
