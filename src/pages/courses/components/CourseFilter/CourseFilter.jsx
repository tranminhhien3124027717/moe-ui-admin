import React, { useState, useEffect, useMemo } from "react";
import { Input, Select, Button, Checkbox, DatePicker } from "antd";
import {
 SearchOutlined,
 BankOutlined,
 DesktopOutlined,
 CreditCardOutlined,
 SyncOutlined,
 CheckCircleOutlined,
 CalendarOutlined,
 DollarOutlined,
 CloseOutlined,
} from "@ant-design/icons";
import { courseService } from "../../../../services/courseService";
import styles from "./CourseFilter.module.scss";


const buildClassNames = (...classNames) => classNames.filter(Boolean).join(" ");


const CourseFilter = ({ filter, updateFilter, total, dataCount }) => {
 const [providersList, setProvidersList] = useState([]);
 const [providerSearchText, setProviderSearchText] = useState('');
 const [loadingProviders, setLoadingProviders] = useState(false);


 // Fetch providers on mount
 useEffect(() => {
   fetchProviders();
 }, []);


 // Debounce provider search
 useEffect(() => {
   const timer = setTimeout(() => {
     if (providerSearchText !== undefined) {
       fetchProviders(providerSearchText);
     }
   }, 300);


   return () => clearTimeout(timer);
 }, [providerSearchText]);


 const fetchProviders = async (search = '') => {
   setLoadingProviders(true);
   try {
     const res = await courseService.getProviders(search);
     setProvidersList(res?.data || []);
   } catch (error) {
     console.error("Failed to load providers", error);
     setProvidersList([]);
   } finally {
     setLoadingProviders(false);
   }
 };


 const hasActiveFilters = () => {
   return (
     (filter.SearchTerm && filter.SearchTerm.trim() !== "") ||
     (filter.Provider && filter.Provider.length > 0) ||
     (filter.ModeOfTraining && filter.ModeOfTraining.length > 0) ||
     (filter.Status && filter.Status.length > 0) ||
     (filter.PaymentType && filter.PaymentType.length > 0) ||
     (filter.BillingCycle && filter.BillingCycle.length > 0) ||
     filter.StartDate ||
     filter.EndDate ||
     filter.TotalFeeMin ||
     filter.TotalFeeMax
   );
 };


 const handleClearFilters = () => {
   updateFilter({
     SearchTerm: "",
     Provider: [],
     ModeOfTraining: [],
     Status: [],
     PaymentType: [],
     BillingCycle: [],
     StartDate: null,
     EndDate: null,
     TotalFeeMin: "",
     TotalFeeMax: "",
   });
 };


 const modes = useMemo(
   () => [
     { value: "Online", label: "Online" },
     { value: "In-Person", label: "In-Person" },
     { value: "Hybrid", label: "Hybrid" },
   ],
   []
 );
 const paymentTypes = useMemo(
   () => [
     { value: "Recurring", label: "Recurring" },
     { value: "One-time", label: "One-time" },
   ],
   []
 );
 const billingCycles = useMemo(
   () => [
     { value: "Monthly", label: "Monthly" },
     { value: "Quarterly", label: "Quarterly" },
     { value: "Biannually", label: "Biannually" },
     { value: "Yearly", label: "Yearly" },
   ],
   []
 );
 const statuses = useMemo(
   () => [
     { value: "Active", label: "Active" },
     { value: "Inactive", label: "Inactive" },
   ],
   []
 );
 const providerOptions = useMemo(
   () =>
     Array.isArray(providersList)
       ? providersList.map((p) => ({
           value: p.providerId,
           label: p.providerName,
         }))
       : [],
   [providersList]
 );


 const getSummary = (values, fallback, options) => {
   if (!values || values.length === 0) return fallback;
   if (values.length === 1) {
     const match = options?.find((option) => option.value === values[0]);
     return match?.label || values[0];
   }
   return `${values.length} selected`;
 };


 const providerSummary = useMemo(
   () => getSummary(filter.Provider, "Provider", providerOptions),
   [filter.Provider, providerOptions]
 );
 const modeSummary = useMemo(
   () => getSummary(filter.ModeOfTraining, "Mode of Training", modes),
   [filter.ModeOfTraining, modes]
 );
 const statusSummary = useMemo(
   () => getSummary(filter.Status, "Status", statuses),
   [filter.Status, statuses]
 );
 const paymentSummary = useMemo(
   () => getSummary(filter.PaymentType, "Payment Type", paymentTypes),
   [filter.PaymentType, paymentTypes]
 );
 const billingSummary = useMemo(
   () => getSummary(filter.BillingCycle, "Billing Cycle", billingCycles),
   [filter.BillingCycle, billingCycles]
 );


 const providerFieldClass = useMemo(
   () =>
     buildClassNames(
       styles.filterItem,
       styles.inlineField,
       styles.providerField,
       filter.Provider?.length && styles.inlineFieldHasValue
     ),
   [filter.Provider]
 );
 const modeFieldClass = useMemo(
   () =>
     buildClassNames(
       styles.filterItem,
       styles.inlineField,
       filter.ModeOfTraining?.length && styles.inlineFieldHasValue
     ),
   [filter.ModeOfTraining]
 );
 const statusFieldClass = useMemo(
   () =>
     buildClassNames(
       styles.filterItem,
       styles.inlineField,
       filter.Status?.length && styles.inlineFieldHasValue
     ),
   [filter.Status]
 );
 const paymentFieldClass = useMemo(
   () =>
     buildClassNames(
       styles.filterItem,
       styles.inlineField,
       filter.PaymentType?.length && styles.inlineFieldHasValue
     ),
   [filter.PaymentType]
 );
 const billingFieldClass = useMemo(
   () =>
     buildClassNames(
       styles.filterItem,
       styles.inlineField,
       filter.BillingCycle?.length && styles.inlineFieldHasValue
     ),
   [filter.BillingCycle]
 );


 const [endDateError, setEndDateError] = useState("");


 const disabledEndDate = (date) => {
   if (!date) return false;
   if (!filter.StartDate) return false;
   const d = date.toDate();
   d.setHours(0, 0, 0, 0);
   const s = filter.StartDate.toDate();
   s.setHours(0, 0, 0, 0);
   return d <= s;
 };


 const handleStartDateChange = (date) => {
   updateFilter({ StartDate: date });
   setEndDateError("");
   if (date && filter.EndDate) {
     const d = date.toDate();
     d.setHours(0, 0, 0, 0);
     const end = filter.EndDate.toDate();
     end.setHours(0, 0, 0, 0);
     if (d >= end) {
       setEndDateError("End date must be after start date");
     }
   }
 };


 const handleEndDateChange = (date) => {
   updateFilter({ EndDate: date });
   setEndDateError("");
   if (date && filter.StartDate) {
     const end = date.toDate();
     end.setHours(0, 0, 0, 0);
     const start = filter.StartDate.toDate();
     start.setHours(0, 0, 0, 0);
     if (end <= start) {
       setEndDateError("End date must be after start date");
     }
   }
 };


 return (
   <div className={styles.filterCard}>
     <div className={styles.filtersRow}>
       <div className={`${styles.filterItem} ${styles.searchItem}`}>
         <Input
           prefix={<SearchOutlined style={{ color: "#94a3b8", fontSize: "18px", marginRight: "8px" }} />}
           placeholder="Search by course name, provider and course code..."
           className={styles.mainSearch}
           value={filter.SearchTerm}
           onChange={(e) => updateFilter({ SearchTerm: e.target.value })}
         />
       </div>


       <div className={providerFieldClass}>
         <div className={styles.fieldOverlay}>
           <BankOutlined />
           <span>{providerSummary}</span>
         </div>
         <Select
           mode="multiple"
           showSearch={false}
           placeholder={null}
           maxTagCount={0}
           popupClassName={`${styles.providerDropdown} my-custom-dropdown`}
           className={styles.filterSelect}
           value={filter.Provider || []}
           onChange={(val) => updateFilter({ Provider: val })}
           dropdownMatchSelectWidth={false}
           dropdownStyle={{ minWidth: 360 }}
           options={providerOptions}
           loading={loadingProviders}
           filterOption={false}
           notFoundContent={loadingProviders ? 'Loading...' : 'No providers found'}
           dropdownRender={(menu) => (
             <div>
               <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fff' }}>
                 <Input
                   placeholder="Search providers..."
                   prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                   value={providerSearchText}
                   onChange={(e) => setProviderSearchText(e.target.value)}
                   allowClear
                   onClick={(e) => e.stopPropagation()}
                 />
               </div>
               {menu}
             </div>
           )}
           optionRender={(option) => (
             <div className={styles.customOption}>
               <Checkbox checked={filter.Provider?.includes(option.value)} />
               <span style={{ marginLeft: "8px" }}>{option.label}</span>
             </div>
           )}
         />
       </div>


       <div className={modeFieldClass}>
         <div className={styles.fieldOverlay}>
           <DesktopOutlined />
           <span>{modeSummary}</span>
         </div>
         <Select
           mode="multiple"
           showSearch={false}
           placeholder={null}
           maxTagCount={0}
           popupClassName="my-custom-dropdown"
           className={styles.filterSelect}
           value={filter.ModeOfTraining || []}
           onChange={(val) => updateFilter({ ModeOfTraining: val })}
           options={modes}
           optionRender={(option) => (
             <div className={styles.customOption}>
               <Checkbox checked={filter.ModeOfTraining?.includes(option.value)} />
               <span style={{ marginLeft: "8px" }}>{option.label}</span>
             </div>
           )}
         />
       </div>


       <div className={statusFieldClass}>
         <div className={styles.fieldOverlay}>
           <CheckCircleOutlined />
           <span>{statusSummary}</span>
         </div>
         <Select
           mode="multiple"
           showSearch={false}
           placeholder={null}
           maxTagCount={0}
           popupClassName="my-custom-dropdown"
           className={styles.filterSelect}
           value={filter.Status || []}
           onChange={(val) => updateFilter({ Status: val })}
           options={statuses}
           optionRender={(option) => (
             <div className={styles.customOption}>
               <Checkbox checked={filter.Status?.includes(option.value)} />
               <span style={{ marginLeft: "8px" }}>{option.label}</span>
             </div>
           )}
         />
       </div>


       <div className={paymentFieldClass}>
         <div className={styles.fieldOverlay}>
           <CreditCardOutlined />
           <span>{paymentSummary}</span>
         </div>
         <Select
           mode="multiple"
           showSearch={false}
           placeholder={null}
           maxTagCount={0}
           popupClassName="my-custom-dropdown"
           className={styles.filterSelect}
           value={filter.PaymentType || []}
           onChange={(val) => updateFilter({ PaymentType: val })}
           options={paymentTypes}
           optionRender={(option) => (
             <div className={styles.customOption}>
               <Checkbox checked={filter.PaymentType?.includes(option.value)} />
               <span style={{ marginLeft: "8px" }}>{option.label}</span>
             </div>
           )}
         />
       </div>


       <div className={billingFieldClass}>
         <div className={styles.fieldOverlay}>
           <SyncOutlined />
           <span>{billingSummary}</span>
         </div>
         <Select
           mode="multiple"
           showSearch={false}
           placeholder={null}
           maxTagCount={0}
           popupClassName="my-custom-dropdown"
           className={styles.filterSelect}
           value={filter.BillingCycle || []}
           onChange={(val) => updateFilter({ BillingCycle: val })}
           options={billingCycles}
           optionRender={(option) => (
             <div className={styles.customOption}>
               <Checkbox checked={filter.BillingCycle?.includes(option.value)} />
               <span style={{ marginLeft: "8px" }}>{option.label}</span>
             </div>
           )}
         />
       </div>


       <div className={`${styles.filterItem} ${styles.dateItem}`}>
         <span className={styles.label}>
           <CalendarOutlined /> Start Date
         </span>
         <DatePicker
           className={styles.datePicker}
           placeholder="Select date"
           format="DD/MM/YYYY"
           value={filter.StartDate}
           onChange={handleStartDateChange}
         />
       </div>


       <div className={`${styles.filterItem} ${styles.dateItem}`}>
         <span className={styles.label}>
           <CalendarOutlined /> End Date
         </span>
         <DatePicker
           className={styles.datePicker}
           placeholder="Select date"
           format="DD/MM/YYYY"
           value={filter.EndDate}
           disabledDate={disabledEndDate}
           onChange={handleEndDateChange}
         />
         {endDateError && (
           <span className={styles.errorText}>{endDateError}</span>
         )}
       </div>


       <div className={`${styles.filterItem} ${styles.rangeItem}`}>
         <span className={styles.label}>
           <DollarOutlined /> Fee Range ($)
         </span>
         <div className={styles.rangeGroup}>
           <Input
             type="number"
             min={0}
             placeholder="Min"
             className={styles.rangeInput}
             value={filter.TotalFeeMin}
             onChange={(e) => updateFilter({ TotalFeeMin: e.target.value })}
           />
           <span className={styles.separator}>-</span>
           <Input
             type="number"
             min={0}
             placeholder="Max"
             className={styles.rangeInput}
             value={filter.TotalFeeMax}
             onChange={(e) => updateFilter({ TotalFeeMax: e.target.value })}
           />
         </div>
       </div>
     </div>


     <div className={styles.filterFooter}>
       <span className={styles.showingText}>
         Showing {dataCount || 0} of {total} courses
       </span>
       {hasActiveFilters() && (
         <Button
           type="link"
           danger
           icon={<CloseOutlined />}
           className={styles.clearBtn}
           onClick={handleClearFilters}
         >
           Clear Filters
         </Button>
       )}
     </div>
   </div>
 );
};


export default CourseFilter;



