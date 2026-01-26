import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { topupService } from "../../services/topupService";
import dayjs from "dayjs";


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


// Parse URL params to filter object
const parseUrlToFilter = (searchParams) => {
 const filter = { ...DEFAULT_FILTER };
  if (searchParams.get('page')) filter.pageNumber = parseInt(searchParams.get('page')) || 1;
 if (searchParams.get('size')) filter.pageSize = parseInt(searchParams.get('size')) || 10;
 if (searchParams.get('search')) filter.Search = searchParams.get('search');
 if (searchParams.get('statuses')) filter.Statuses = searchParams.get('statuses').split(',');
 if (searchParams.get('types')) filter.Types = searchParams.get('types');
 if (searchParams.get('residential')) filter.ResidentialStatuses = searchParams.get('residential').split(',');
 if (searchParams.get('dateFrom')) filter.ScheduledDateFrom = dayjs(searchParams.get('dateFrom'));
 if (searchParams.get('dateTo')) filter.ScheduledDateTo = dayjs(searchParams.get('dateTo'));
 if (searchParams.get('sortBy')) filter.SortBy = searchParams.get('sortBy');
 if (searchParams.get('sortDesc')) filter.SortDescending = searchParams.get('sortDesc') === 'true';
  return filter;
};


// Convert filter object to URL params
const filterToUrl = (filter) => {
 const params = new URLSearchParams();
  if (filter.pageNumber > 1) params.set('page', filter.pageNumber);
 if (filter.pageSize !== 10) params.set('size', filter.pageSize);
 if (filter.Search) params.set('search', filter.Search);
 if (filter.Statuses?.length) params.set('statuses', filter.Statuses.join(','));
 if (filter.Types) params.set('types', filter.Types);
 if (filter.ResidentialStatuses?.length) params.set('residential', filter.ResidentialStatuses.join(','));
 if (filter.ScheduledDateFrom) params.set('dateFrom', dayjs(filter.ScheduledDateFrom).format('YYYY-MM-DD'));
 if (filter.ScheduledDateTo) params.set('dateTo', dayjs(filter.ScheduledDateTo).format('YYYY-MM-DD'));
 if (filter.SortBy && filter.SortBy !== 'CreatedDate') params.set('sortBy', filter.SortBy);
 if (!filter.SortDescending) params.set('sortDesc', 'false');
  return params;
};


export const useTopUpList = () => {
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
   setData([]);
   try {
     // Clean up filter - don't send null, empty strings, or empty arrays
     const cleanFilter = {};
     for (const [key, value] of Object.entries(customFilter)) {
       if (value !== null && value !== "" && (Array.isArray(value) ? value.length > 0 : true)) {
         if (dayjs.isDayjs(value)) {
           cleanFilter[key] = value.format('YYYY-MM-DD');
         } else {
           cleanFilter[key] = value;
         }
       }
     }
    
     const result = await topupService.getListTopUps(cleanFilter);
     console.log(result);
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
 }, []);


 // Fetch data when filter changes
 useEffect(() => {
   fetchData(filter);
 }, [filter, fetchData]);


 // Update filter and sync to URL
 const updateFilter = (newFilter) => {
   isUserAction.current = true;
   setData([]);
   const updatedFilter = {
     ...filter,
     ...newFilter,
     pageNumber: 1,
   };
   setFilter(updatedFilter);
   setSearchParams(filterToUrl(updatedFilter), { replace: true });
 };


 const changePage = (page, pageSize) => {
   isUserAction.current = true;
   setData([]);
   const updatedFilter = {
     ...filter,
     pageNumber: page,
     pageSize,
   };
   setFilter(updatedFilter);
   setSearchParams(filterToUrl(updatedFilter), { replace: true });
 };


 const updateSort = (field, order) => {
   const sortByMap = {
     'type': 'Type',
     'name': 'RuleName',
     'amount': 'Amount',
     'status': 'Status',
     'scheduledTime': 'ScheduledTime',
     'createdDate': 'CreatedDate'
   };


   isUserAction.current = true;
   setData([]);
   const updatedFilter = {
     ...filter,
     SortBy: field ? sortByMap[field] : null,
     SortDescending: order === 'descend',
     pageNumber: 1,
   };
   setFilter(updatedFilter);
   setSearchParams(filterToUrl(updatedFilter), { replace: true });
 };


 const resetAndFetch = () => {
   isUserAction.current = true;
   setData([]);
   const updatedFilter = {
     ...DEFAULT_FILTER,
     SortBy: 'CreatedDate',
     SortDescending: true,
     pageNumber: 1,
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
   resetAndFetch,
 };
};



