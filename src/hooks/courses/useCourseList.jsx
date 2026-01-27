import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
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


// Parse URL params to filter object
const parseUrlToFilter = (searchParams) => {
 const filter = { ...DEFAULT_FILTER };
  if (searchParams.get('page')) filter.PageNumber = parseInt(searchParams.get('page')) || 1;
 if (searchParams.get('size')) filter.PageSize = parseInt(searchParams.get('size')) || 10;
 if (searchParams.get('search')) filter.SearchTerm = searchParams.get('search');
 if (searchParams.get('provider')) filter.Provider = searchParams.get('provider').split(',');
 if (searchParams.get('mode')) filter.ModeOfTraining = searchParams.get('mode').split(',');
 if (searchParams.get('status')) filter.Status = searchParams.get('status').split(',');
 if (searchParams.get('paymentType')) filter.PaymentType = searchParams.get('paymentType').split(',');
 if (searchParams.get('billingCycle')) filter.BillingCycle = searchParams.get('billingCycle').split(',');
 if (searchParams.get('startDate')) filter.StartDate = dayjs(searchParams.get('startDate'));
 if (searchParams.get('endDate')) filter.EndDate = dayjs(searchParams.get('endDate'));
 if (searchParams.get('minFee')) filter.TotalFeeMin = parseFloat(searchParams.get('minFee'));
 if (searchParams.get('maxFee')) filter.TotalFeeMax = parseFloat(searchParams.get('maxFee'));
 if (searchParams.has('sortBy')) filter.SortBy = parseInt(searchParams.get('sortBy'), 10);
 if (searchParams.has('sortDir')) filter.SortDirection = parseInt(searchParams.get('sortDir'), 10);
  return filter;
};


// Convert filter object to URL params
const filterToUrl = (filter) => {
 const params = new URLSearchParams();
  if (filter.PageNumber > 1) params.set('page', filter.PageNumber);
 if (filter.PageSize !== 10) params.set('size', filter.PageSize);
 if (filter.SearchTerm) params.set('search', filter.SearchTerm);
 if (filter.Provider?.length) params.set('provider', filter.Provider.join(','));
 if (filter.ModeOfTraining?.length) params.set('mode', filter.ModeOfTraining.join(','));
 if (filter.Status?.length) params.set('status', filter.Status.join(','));
 if (filter.PaymentType?.length) params.set('paymentType', filter.PaymentType.join(','));
 if (filter.BillingCycle?.length) params.set('billingCycle', filter.BillingCycle.join(','));
 if (filter.StartDate) params.set('startDate', dayjs(filter.StartDate).format('YYYY-MM-DD'));
 if (filter.EndDate) params.set('endDate', dayjs(filter.EndDate).format('YYYY-MM-DD'));
 if (filter.TotalFeeMin) params.set('minFee', filter.TotalFeeMin);
 if (filter.TotalFeeMax) params.set('maxFee', filter.TotalFeeMax);
 if (filter.SortBy !== 0) params.set('sortBy', filter.SortBy);
 if (filter.SortDirection !== 1) params.set('sortDir', filter.SortDirection);
  return params;
};


export const useCourseList = () => {
 const [searchParams, setSearchParams] = useSearchParams();
 const [filter, setFilter] = useState(() => parseUrlToFilter(searchParams));
 const [data, setData] = useState([]);
 const [total, setTotal] = useState(0);
 const [loading, setLoading] = useState(false);
 const isUserAction = useRef(false);


 // Sync FROM URL to filter when URL changes (e.g., browser back/forward)
 useEffect(() => {
   if (!isUserAction.current) {
     const newFilter = parseUrlToFilter(searchParams);
     setFilter(newFilter);
   }
   isUserAction.current = false;
 }, [searchParams]);


 const fetchData = useCallback(async (customFilter) => {
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
 }, []);


 // Fetch data when filter changes
 useEffect(() => {
   fetchData(filter);
 }, [filter, fetchData]);


 // Update filter and sync to URL
 const updateFilter = (newFilter) => {
   isUserAction.current = true;
   const updatedFilter = {
     ...filter,
     ...newFilter,
     PageNumber: 1,
   };
   setFilter(updatedFilter);
   setSearchParams(filterToUrl(updatedFilter), { replace: true });
 };


 const changePage = (page, pageSize) => {
   isUserAction.current = true;
   const updatedFilter = {
     ...filter,
     PageNumber: page,
     PageSize: pageSize,
   };
   setFilter(updatedFilter);
   setSearchParams(filterToUrl(updatedFilter), { replace: true });
 };


 const updateSort = (field, order) => {
   // Backend enum: CreatedAt=0, CourseName=1, Provider=2, TotalFee=3, StartDate=4, EndDate=5
   const sortByMap = {
     courseName: 1,
     provider: 2,
     totalFee: 3,
     startDate: 4,
     endDate: 5,
   };


   isUserAction.current = true;
   const updatedFilter = {
     ...filter,
     SortBy: field ? sortByMap[field] : 0,
     SortDirection: order === "descend" ? 1 : 0,
     PageNumber: 1,
   };
   setFilter(updatedFilter);
   setSearchParams(filterToUrl(updatedFilter), { replace: true });
 };


 return {
   data,
   total,
   loading,
   filter,
   updateFilter,
   changePage,
   updateSort,
   fetchData: () => fetchData(filter),
 };
};



