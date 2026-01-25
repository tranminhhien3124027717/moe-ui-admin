import { useEffect, useState } from "react";
import { courseService } from "../../services/courseService";
import dayjs from "dayjs";

const DEFAULT_FILTER = {
  PageNumber: 1,
  PageSize: 10,
  SearchTerm: "",
  Provider: [],
  ModeOfTraining: [],
  Status: [],
  PaymentType: [],
  BillingCycle: [],
  StartDate: null,
  EndDate: null,
  TotalFeeMin: null,
  TotalFeeMax: null,
  SortBy: 0,
  SortDirection: 1,
};

export const useCourseList = () => {
  const [filter, setFilter] = useState(DEFAULT_FILTER);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async (customFilter = filter) => {
    setLoading(true);
    try {
      const params = {
        PageNumber: customFilter.PageNumber,
        PageSize: customFilter.PageSize,
        SearchTerm: customFilter.SearchTerm || undefined,
        Provider: customFilter.Provider?.length ? customFilter.Provider : undefined,
        ModeOfTraining: customFilter.ModeOfTraining?.length ? customFilter.ModeOfTraining : undefined,
        Status: customFilter.Status?.length ? customFilter.Status : undefined,
        PaymentType: customFilter.PaymentType?.length ? customFilter.PaymentType : undefined,
        BillingCycle: customFilter.BillingCycle?.length ? customFilter.BillingCycle : undefined,
        StartDate: customFilter.StartDate ? dayjs(customFilter.StartDate).format('YYYY-MM-DD') : undefined,
        EndDate: customFilter.EndDate ? dayjs(customFilter.EndDate).format('YYYY-MM-DD') : undefined,
        TotalFeeMin: customFilter.TotalFeeMin || undefined,
        TotalFeeMax: customFilter.TotalFeeMax || undefined,
        SortBy: customFilter.SortBy,
        SortDirection: customFilter.SortDirection,
      };

      const result = await courseService.getListCourses(params);

      // Ensure data is always an array
      // API returns: { success: true, data: { items: [...], totalCount: 5 } }
      const items = result?.data?.items || [];
      const totalCount = result?.data?.totalCount || 0;

      setData(Array.isArray(items) ? items : []);
      setTotal(totalCount);
    } catch (error) {
      console.error("Failed to fetch course list:", error);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  // Update filter
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
    // Map Ant Design sort field to backend expectations
    const sortByMap = {
      courseName: 0, // CourseName
      provider: 1, // Provider
      totalFee: 2, // TotalFee
      startDate: 3, // StartDate
      endDate: 4, // EndDate
    };

    setFilter((prev) => ({
      ...prev,
      SortBy: field ? sortByMap[field] : 0,
      SortDirection: order === "descend" ? 1 : 0,
      PageNumber: 1,
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
