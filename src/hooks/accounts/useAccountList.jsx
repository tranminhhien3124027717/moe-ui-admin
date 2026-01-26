import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
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


// Parse URL params to filter object
const parseUrlToFilter = (searchParams) => {
 const filter = { ...DEFAULT_FILTER };
  if (searchParams.get('page')) filter.pageNumber = parseInt(searchParams.get('page')) || 1;
 if (searchParams.get('size')) filter.pageSize = parseInt(searchParams.get('size')) || 20;
 if (searchParams.get('search')) filter.Search = searchParams.get('search');
 if (searchParams.get('eduLevels')) filter.EducationLevels = searchParams.get('eduLevels').split(',');
 if (searchParams.get('schooling')) filter.SchoolingStatus = searchParams.get('schooling');
 if (searchParams.get('residential')) filter.ResidentialStatuses = searchParams.get('residential').split(',');
 if (searchParams.get('minBal')) filter.MinBalance = parseFloat(searchParams.get('minBal'));
 if (searchParams.get('maxBal')) filter.MaxBalance = parseFloat(searchParams.get('maxBal'));
 if (searchParams.get('minAge')) filter.MinAge = parseInt(searchParams.get('minAge'));
 if (searchParams.get('maxAge')) filter.MaxAge = parseInt(searchParams.get('maxAge'));
 if (searchParams.get('sortBy')) filter.SortBy = searchParams.get('sortBy');
 if (searchParams.get('sortDesc')) filter.SortDescending = searchParams.get('sortDesc') === 'true';
 if (searchParams.get('active')) filter.IsActive = searchParams.get('active') === 'true';
  return filter;
};


// Convert filter object to URL params
const filterToUrl = (filter) => {
 const params = new URLSearchParams();
  if (filter.pageNumber > 1) params.set('page', filter.pageNumber);
 if (filter.pageSize !== 20) params.set('size', filter.pageSize);
 if (filter.Search) params.set('search', filter.Search);
 if (filter.EducationLevels?.length) params.set('eduLevels', filter.EducationLevels.join(','));
 if (filter.SchoolingStatus) params.set('schooling', filter.SchoolingStatus);
 if (filter.ResidentialStatuses?.length) params.set('residential', filter.ResidentialStatuses.join(','));
 if (filter.MinBalance) params.set('minBal', filter.MinBalance);
 if (filter.MaxBalance) params.set('maxBal', filter.MaxBalance);
 if (filter.MinAge) params.set('minAge', filter.MinAge);
 if (filter.MaxAge) params.set('maxAge', filter.MaxAge);
 if (filter.SortBy) params.set('sortBy', filter.SortBy);
 if (filter.SortDescending) params.set('sortDesc', 'true');
 if (!filter.IsActive) params.set('active', 'false');
  return params;
};


export const useAccountList = () => {
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
     const result = await accountService.getListAccount(customFilter);
     console.log(result.data);
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
     pageNumber: 1,
   };
   setFilter(updatedFilter);
   setSearchParams(filterToUrl(updatedFilter), { replace: true });
 };


 const changePage = (page, pageSize) => {
   isUserAction.current = true;
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
     'fullName': 'FullName',
     'age': 'Age',
     'balance': 'Balance',
     'educationLevel': 'EducationLevel',
     'created': 'CreatedDate'
   };


   isUserAction.current = true;
   const updatedFilter = {
     ...filter,
     SortBy: field ? sortByMap[field] : null,
     SortDescending: order === 'descend',
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
 };
};



