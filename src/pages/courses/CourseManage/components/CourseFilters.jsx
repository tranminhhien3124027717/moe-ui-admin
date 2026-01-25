import React, { useMemo, useState, useEffect } from "react";
import { Input, Select, DatePicker, Button, Checkbox } from "antd";
import {
  SearchOutlined,
  ShopOutlined,
  LaptopOutlined,
  CreditCardOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  CloseOutlined,
  CalendarOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "./CourseFilters.module.scss";
import { courseService } from "../../../../services/courseService";

const CourseFilters = ({ filters, onFilterChange, total, dataCount, onExport }) => {
  const [providersList, setProvidersList] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [providerSearchText, setProviderSearchText] = useState('');

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

  const fetchProviders = async (searchTerm = '') => {
    setLoadingProviders(true);
    try {
      const res = await courseService.getProviders(searchTerm);
      setProvidersList(res?.data || []);
    } catch (error) {
      console.error('Failed to load providers:', error);
      setProvidersList([]);
    } finally {
      setLoadingProviders(false);
    }
  };
  // Validate date range
  const dateRangeError = useMemo(() => {
    if (filters.startDate && filters.endDate) {
      const start = dayjs(filters.startDate);
      const end = dayjs(filters.endDate);
      if (end.isBefore(start)) {
        return "End date must be after start date";
      }
    }
    return null;
  }, [filters.startDate, filters.endDate]);

  // Validate fee range
  const feeRangeError = useMemo(() => {
    const min = parseFloat(filters.minFee);
    const max = parseFloat(filters.maxFee);
    
    if (filters.minFee && min < 0) {
      return "Fee cannot be negative";
    }
    if (filters.maxFee && max < 0) {
      return "Fee cannot be negative";
    }
    if (!isNaN(min) && !isNaN(max) && min > max) {
      return "Max fee must be greater than or equal to min fee";
    }
    return null;
  }, [filters.minFee, filters.maxFee]);

  const hasActiveFilters = () => {
    return (
      (filters.search && filters.search.trim() !== '') ||
      (filters.provider && filters.provider.length > 0) ||
      (filters.mode && filters.mode.length > 0) ||
      (filters.paymentType && filters.paymentType.length > 0) ||
      (filters.status && filters.status.length > 0) ||
      (filters.billingCycle && filters.billingCycle.length > 0) ||
      filters.startDate || filters.endDate ||
      filters.minFee || filters.maxFee
    );
  };

  const handleClearFilters = () => {
    onFilterChange({
      search: '',
      provider: [],
      mode: [],
      paymentType: [],
      billingCycle: [],
      status: [],
      startDate: null,
      endDate: null,
      minFee: '',
      maxFee: ''
    });
  };

  return (
    <div className={styles.filterCard}>
      <div className={styles.searchWrapper}>
        <Input
          prefix={<SearchOutlined style={{ color: "#94a3b8", fontSize: '18px', marginRight: '8px' }} />}
          placeholder="Search by course name or provider..."
          className={styles.mainSearch}
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        />
      </div>

      <div className={styles.filtersRow}>
        <div className={styles.filterItem}>
          <span className={styles.label}><ShopOutlined /> Provider</span>
          <Select
            mode="multiple"
            showSearch
            placeholder="Search providers"
            maxTagCount={0}
            maxTagPlaceholder={(omitted) => omitted.length === 1 ? omitted[0].label : `${omitted.length} selected`}
            popupClassNames={{ root: "my-custom-dropdown" }}
            className={styles.filterSelect}
            value={filters.provider || []}
            onChange={(val) => onFilterChange({ ...filters, provider: val })}
            options={providersList.map(p => ({ 
              value: p.providerName, 
              label: p.providerName 
            }))}
            optionRender={(option) => (
              <div className={styles.customOption}>
                <Checkbox checked={filters.provider?.includes(option.value)} />
                <span style={{ marginLeft: '8px' }}>{option.label}</span>
              </div>
            )}
            loading={loadingProviders}
            filterOption={false}
            notFoundContent={loadingProviders ? 'Loading...' : 'No providers found'}
            popupRender={(menu) => (
              <div>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fff' }}>
                  <Input
                    placeholder="Search providers..."
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    value={providerSearchText}
                    onChange={(e) => setProviderSearchText(e.target.value)}
                    allowClear
                  />
                </div>
                {menu}
              </div>
            )}
          />
        </div>

        <div className={styles.filterItem}>
          <span className={styles.label}><LaptopOutlined /> Mode of Training</span>
          <Select
            mode="multiple"
            showSearch={false}
            placeholder="All Modes"
            maxTagCount={0}
            maxTagPlaceholder={(omitted) => omitted.length === 1 ? omitted[0].label : `${omitted.length} selected`}
            popupClassNames={{ root: "my-custom-dropdown" }}
            className={styles.filterSelect}
            value={filters.mode || []}
            onChange={(val) => onFilterChange({ ...filters, mode: val })}
            options={[
              { value: "Online", label: "Online" },
              { value: "In-Person", label: "In-Person" },
              { value: "Hybrid", label: "Hybrid" }
            ]}
            optionRender={(option) => (
              <div className={styles.customOption}>
                <Checkbox checked={filters.mode?.includes(option.value)} />
                <span style={{ marginLeft: '8px' }}>{option.label}</span>
              </div>
            )}
          />
        </div>

        <div className={styles.filterItem}>
          <span className={styles.label}><CreditCardOutlined /> Payment Type</span>
          <Select
            mode="multiple"
            showSearch={false}
            placeholder="All Types"
            maxTagCount={0}
            maxTagPlaceholder={(omitted) => omitted.length === 1 ? omitted[0].label : `${omitted.length} selected`}
            popupClassNames={{ root: "my-custom-dropdown" }}
            className={styles.filterSelect}
            value={filters.paymentType || []}
            onChange={(val) => onFilterChange({ ...filters, paymentType: val })}
            options={[
              { value: "Upfront", label: "Upfront" },
              { value: "Installment", label: "Installment" },
              { value: "Recurring", label: "Recurring" }
            ]}
            optionRender={(option) => (
              <div className={styles.customOption}>
                <Checkbox checked={filters.paymentType?.includes(option.value)} />
                <span style={{ marginLeft: '8px' }}>{option.label}</span>
              </div>
            )}
          />
        </div>

        <div className={styles.filterItem}>
          <span className={styles.label}><SyncOutlined /> Billing Cycle</span>
          <Select
            mode="multiple"
            showSearch={false}
            placeholder="All Cycles"
            maxTagCount={0}
            maxTagPlaceholder={(omitted) => omitted.length === 1 ? omitted[0].label : `${omitted.length} selected`}
            popupClassNames={{ root: "my-custom-dropdown" }}
            className={styles.filterSelect}
            value={filters.billingCycle || []}
            onChange={(val) => onFilterChange({ ...filters, billingCycle: val })}
            options={[
              { value: "One-Time", label: "One-Time" },
              { value: "Monthly", label: "Monthly" },
              { value: "Quarterly", label: "Quarterly" },
              { value: "Annual", label: "Annual" }
            ]}
            optionRender={(option) => (
              <div className={styles.customOption}>
                <Checkbox checked={filters.billingCycle?.includes(option.value)} />
                <span style={{ marginLeft: '8px' }}>{option.label}</span>
              </div>
            )}
          />
        </div>

        <div className={styles.filterItem}>
          <span className={styles.label}><CheckCircleOutlined /> Status</span>
          <Select
            mode="multiple"
            showSearch={false}
            placeholder="All Statuses"
            maxTagCount={0}
            maxTagPlaceholder={(omitted) => omitted.length === 1 ? omitted[0].label : `${omitted.length} selected`}
            popupClassNames={{ root: "my-custom-dropdown" }}
            className={styles.filterSelect}
            value={filters.status || []}
            onChange={(val) => onFilterChange({ ...filters, status: val })}
            options={[
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
              { value: "Upcoming", label: "Upcoming" },
              { value: "Completed", label: "Completed" }
            ]}
            optionRender={(option) => (
              <div className={styles.customOption}>
                <Checkbox checked={filters.status?.includes(option.value)} />
                <span style={{ marginLeft: '8px' }}>{option.label}</span>
              </div>
            )}
          />
        </div>

        <div className={styles.filterItem}>
          <span className={styles.label}><CalendarOutlined /> Course Start Date</span>
          <DatePicker
            placeholder="Select date"
            className={`${styles.datePickerInput} ${dateRangeError ? styles.errorInput : ''}`}
            format="DD/MM/YYYY"
            value={filters.startDate}
            onChange={(date) => onFilterChange({ ...filters, startDate: date })}
            status={dateRangeError ? "error" : ""}
          />
        </div>

        <div className={styles.filterItem}>
          <span className={styles.label}><CalendarOutlined /> Course End Date</span>
          <DatePicker
            placeholder="Select date"
            className={`${styles.datePickerInput} ${dateRangeError ? styles.errorInput : ''}`}
            format="DD/MM/YYYY"
            value={filters.endDate}
            onChange={(date) => onFilterChange({ ...filters, endDate: date })}
            status={dateRangeError ? "error" : ""}
          />
          {dateRangeError && (
            <span className={styles.errorText}>{dateRangeError}</span>
          )}
        </div>

        <div className={styles.filterItem}>
          <span className={styles.label}><DollarOutlined /> Fee Range ($)</span>
          <div className={styles.rangeGroup}>
            <Input
              type="number"
              min={0}
              placeholder="Min"
              className={`${styles.rangeInput} ${feeRangeError ? styles.errorInput : ''}`}
              value={filters.minFee}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || parseFloat(value) >= 0) {
                  onFilterChange({ ...filters, minFee: value });
                }
              }}
              status={feeRangeError ? "error" : ""}
            />
            <span className={styles.separator}>-</span>
            <Input
              type="number"
              min={0}
              placeholder="Max"
              className={`${styles.rangeInput} ${feeRangeError ? styles.errorInput : ''}`}
              value={filters.maxFee}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || parseFloat(value) >= 0) {
                  onFilterChange({ ...filters, maxFee: value });
                }
              }}
              status={feeRangeError ? "error" : ""}
            />
          </div>
          {feeRangeError && (
            <span className={styles.errorText}>{feeRangeError}</span>
          )}
        </div>
      </div>

      <div className={styles.filterFooter}>
        <div className={styles.leftSection}>
          <span className={styles.showingText}>Showing {dataCount || 0} of {total} courses</span>
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
        <Button
          icon={<DownloadOutlined />}
          className={styles.exportBtn}
          onClick={onExport}
        >
          Export
        </Button>
      </div>
    </div>
  );
};

export default CourseFilters;
