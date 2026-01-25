import React, { useMemo } from "react";
import { Input, Select, Button, Checkbox } from "antd";
import {
  SearchOutlined,
  ReadOutlined,
  BankOutlined,
  TeamOutlined,
  CalendarOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import styles from "./AccountFilters.module.scss";

const educationOptions = [
  { value: "Primary", label: "Primary" },
  { value: "Secondary", label: "Secondary" },
  { value: "PostSecondary", label: "Post-Secondary" },
  { value: "Tertiary", label: "Tertiary" },
  { value: "PostGraduate", label: "Post-Graduate" },
];

const schoolingOptions = [
  { value: "", label: "All Students" },
  { value: "InSchool", label: "In School" },
  { value: "NotInSchool", label: "Not In School" },
];

const residentialOptions = [
  { value: "SingaporeCitizen", label: "Singapore Citizen" },
  { value: "PermanentResident", label: "Permanent Resident" },
  { value: "NonResident", label: "Non-Resident" },
];

const buildClassNames = (...classNames) => classNames.filter(Boolean).join(" ");

const AccountFilters = ({ filter, updateFilter, total, dataCount }) => {
  // Validate age range
  const ageRangeError = useMemo(() => {
    const min = parseFloat(filter.MinAge);
    const max = parseFloat(filter.MaxAge);
    
    if (filter.MinAge && min < 0) {
      return "Age cannot be negative";
    }
    if (filter.MaxAge && max < 0) {
      return "Age cannot be negative";
    }
    if (!isNaN(min) && !isNaN(max) && min > max) {
      return "Max age must be greater than or equal to min age";
    }
    return null;
  }, [filter.MinAge, filter.MaxAge]);

  const hasActiveFilters = () => {
    return (
      (filter.Search && filter.Search.trim() !== '') ||
      (filter.EducationLevels && filter.EducationLevels.length > 0) ||
      (filter.SchoolingStatus && filter.SchoolingStatus !== '') ||
      (filter.ResidentialStatuses && filter.ResidentialStatuses.length > 0 && !filter.ResidentialStatuses.includes('ALL')) ||
      filter.MinAge || filter.MaxAge
    );
  };

  const educationSummary = filter.EducationLevels?.length
    ? `${filter.EducationLevels.length} selected`
    : "Education Level";

  const schoolingSummary = filter.SchoolingStatus
    ? schoolingOptions.find((option) => option.value === filter.SchoolingStatus)?.label
    : "Schooling Status";

  const residentialSummary =
    filter.ResidentialStatuses?.length && !filter.ResidentialStatuses.includes("ALL")
      ? `${filter.ResidentialStatuses.length} selected`
      : "Residential Status";

  const educationHasValue = !!filter.EducationLevels?.length;
  const schoolingHasValue = !!filter.SchoolingStatus;
  const residentialHasValue = !!(
    filter.ResidentialStatuses?.length && !filter.ResidentialStatuses.includes("ALL")
  );

  const educationFieldClass = buildClassNames(
    styles.filterItem,
    styles.inlineField,
    educationHasValue && styles.hasValue
  );

  const schoolingFieldClass = buildClassNames(
    styles.filterItem,
    styles.inlineField,
    schoolingHasValue && styles.hasValue
  );

  const residentialFieldClass = buildClassNames(
    styles.filterItem,
    styles.inlineField,
    residentialHasValue && styles.hasValue
  );

  const handleClearFilters = () => {
    updateFilter({
      Search: '',
      EducationLevels: [],
      SchoolingStatus: '',
      ResidentialStatuses: [],
      MinAge: '',
      MaxAge: ''
    });
  };

  return (
    <div className={styles.filterCard}>
      <div className={styles.filtersRow}>
        <div className={`${styles.filterItem} ${styles.searchItem}`}>
          <Input
            prefix={<SearchOutlined style={{ color: "#94a3b8", fontSize: "18px", marginRight: "8px" }} />}
            placeholder="Search by name or NRIC/FIN..."
            className={styles.mainSearch}
            value={filter.Search}
            onChange={(e) => updateFilter({ Search: e.target.value })}
          />
        </div>

        <div className={educationFieldClass}>
          <div className={styles.fieldOverlay}>
            <ReadOutlined />
            <span>{educationSummary}</span>
          </div>
          <Select
            mode="multiple"
            showSearch={false}
            placeholder={null}
            maxTagCount={0}
            popupClassName="my-custom-dropdown"
            className={styles.filterSelect}
            value={filter.EducationLevels || []}
            onChange={(val) => updateFilter({ EducationLevels: val })}
            options={educationOptions}
            optionRender={(option) => (
              <div className={styles.customOption}>
                <Checkbox checked={filter.EducationLevels?.includes(option.value)} />
                <span style={{ marginLeft: "8px" }}>{option.label}</span>
              </div>
            )}
          />
        </div>

        <div className={schoolingFieldClass}>
          <div className={styles.fieldOverlay}>
            <BankOutlined />
            <span>{schoolingSummary}</span>
          </div>
          <Select
            placeholder={null}
            className={styles.filterSelect}
            popupClassName="my-custom-dropdown"
            value={filter.SchoolingStatus || undefined}
            onChange={(val) => updateFilter({ SchoolingStatus: val ?? '' })}
            options={schoolingOptions}
            optionRender={(option) => (
              <div className={styles.customOption} style={{ paddingLeft: "24px" }}>
                <span>{option.label}</span>
              </div>
            )}
          />
        </div>

        <div className={residentialFieldClass}>
          <div className={styles.fieldOverlay}>
            <TeamOutlined />
            <span>{residentialSummary}</span>
          </div>
          <Select
            mode="multiple"
            showSearch={false}
            placeholder={null}
            maxTagCount={0}
            popupClassName="my-custom-dropdown"
            className={styles.filterSelect}
            value={filter.ResidentialStatuses || []}
            onChange={(val) => updateFilter({ ResidentialStatuses: val })}
            options={residentialOptions}
            optionRender={(option) => (
              <div className={styles.customOption}>
                <Checkbox checked={filter.ResidentialStatuses?.includes(option.value)} />
                <span style={{ marginLeft: "8px" }}>{option.label}</span>
              </div>
            )}
          />
        </div>

        <div className={`${styles.filterItem} ${styles.rangeItem}`}>
          <span className={styles.label}><CalendarOutlined /> Age Range</span>
          <div className={styles.rangeGroup}>
            <Input
              type="number"
              min={0}
              placeholder="Min"
              className={`${styles.rangeInput} ${ageRangeError ? styles.errorInput : ''}`}
              value={filter.MinAge}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || parseFloat(value) >= 0) {
                  updateFilter({ MinAge: value });
                }
              }}
              status={ageRangeError ? "error" : ""}
            />
            <span className={styles.separator}>-</span>
            <Input
              type="number"
              min={0}
              placeholder="Max"
              className={`${styles.rangeInput} ${ageRangeError ? styles.errorInput : ''}`}
              value={filter.MaxAge}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || parseFloat(value) >= 0) {
                  updateFilter({ MaxAge: value });
                }
              }}
              status={ageRangeError ? "error" : ""}
            />
          </div>
          {ageRangeError && (
            <span className={styles.errorText}>{ageRangeError}</span>
          )}
        </div>
      </div>

      <div className={styles.filterFooter}>
        <span className={styles.showingText}>Showing {dataCount || 0} of {total} accounts</span>
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

export default AccountFilters;
