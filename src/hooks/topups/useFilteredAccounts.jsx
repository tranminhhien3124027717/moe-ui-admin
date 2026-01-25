import { useEffect, useState,  } from "react";
import { topupService } from "../../services/topupService";

const DEFAULT_FILTER = {
  MinAge: null,
  MaxAge: null,
  MinBalance: null,
  MaxBalance: null,
  EducationLevelsIds: [],
  SchoolingStatusesIds: [],
};

export const useFilterBatchList = () => {
  const [filter, setFilter] = useState(DEFAULT_FILTER);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async (customFilter = filter) => {
    setLoading(true);
    try {
      // Clean up filter - don't send null, empty strings, or empty arrays
      const cleanFilter = {};
      for (const [key, value] of Object.entries(customFilter)) {
        if (
          value !== null &&
          value !== "" &&
          (Array.isArray(value) ? value.length > 0 : true)
        ) {
          cleanFilter[key] = value;
        }
      }

      const result = await topupService.getListAccountTopUps(cleanFilter);
      console.log(result);
      // Ensure data is always an array
      const items =
        result.data?.items || result?.items || result?.data || result || [];
      const totalCount =
        result.data?.totalCount ||
        result?.totalCount ||
        (Array.isArray(items) ? items.length : 0);
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
    if (!filter) return;

    const hasAnyFilter = Object.values(filter).some((v) =>
      Array.isArray(v)
        ? v.length > 0
        : v !== undefined && v !== null && v !== "",
    );

    if (!hasAnyFilter) return;

    fetchData(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);


  // 🔹 update filter - memoized to prevent re-renders in dependent effects
  const updateFilter = (newFilter) => {
    setFilter(newFilter);

    const hasAnyFilter = Object.values(newFilter || {}).some((v) =>
      Array.isArray(v)
        ? v.length > 0
        : v !== undefined && v !== null && v !== "",
    );

    if (!hasAnyFilter) {
      setData([]); // 🔥 CỰC QUAN TRỌNG
    }
  };

  return {
    data,
    total,
    loading,
    filter,
    updateFilter,
    fetchData,
  };
};

// Hook for fetching all accounts (Everyone option)
export const useAllAccountsList = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAllAccounts = async () => {
    setLoading(true);
    try {
      // Call API with empty filter to get all accounts
      const result = await topupService.getListAccountTopUps({});
      const items =
        result.data?.items || result?.items || result?.data || result || [];
      const totalCount =
        result.data?.totalCount ||
        result?.totalCount ||
        (Array.isArray(items) ? items.length : 0);
      setData(Array.isArray(items) ? items : []);
      setTotal(totalCount);
    } catch (error) {
      console.error("Failed to fetch all accounts:", error);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAccounts();
  }, []);

  return {
    data,
    total,
    loading,
    fetchAllAccounts,
  };
};
