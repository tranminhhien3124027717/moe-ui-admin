import {
  Input,
  Checkbox,
  DatePicker,
  TimePicker,
  Radio,
  InputNumber,
  Divider,
  message,
  Dropdown,
  Button,
  Modal,
  Tag,
  Spin,
} from "antd";
import { useState, useEffect } from "react";
import { DownOutlined, DeleteOutlined, FileTextOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { topupConfig } from "../../../../../utils/topupConfig";

dayjs.extend(utc);
dayjs.extend(timezone);
import styles from "../TopUpBatch.module.scss";
import { useCustomizeFilters } from "./../../../../../hooks/topups/useCustomizeFilters";
import { formatEnumLabel } from "../../../../../utils/formatters";
import { useTopupConfigs } from "../../../../../hooks/topups/useTopupConfigs";
import { useDebounce } from "../../../../../hooks/useDebounce";

// Education level ID to name mapping
const EDUCATION_LEVEL_MAP = {
  "EL-001": "Primary",
  "EL-002": "Secondary",
  "EL-003": "Post-Secondary",
  "EL-004": "Tertiary",
  "EL-005": "Post-Graduate",
  "EL-006": "Not Set",
};

// Schooling status ID to name mapping
const SCHOOLING_STATUS_MAP = {
  "SS-001": "In School",
  "SS-002": "Not In School",
};

// Helper function to format currency for template display
const formatTemplateCurrency = (value) => {
  if (value === null || value === undefined || value === 0) return null;
  return `S$${parseFloat(value).toLocaleString("en-US")}`;
};

// Helper function to format age range for template display
const formatTemplateAgeRange = (minAge, maxAge) => {
  const hasMin = minAge !== undefined && minAge !== null && minAge !== 0;
  const hasMax = maxAge !== undefined && maxAge !== null && maxAge !== 0;

  if (!hasMin && !hasMax) return null;
  if (hasMin && !hasMax) return `Above ${minAge} years old`;
  if (!hasMin && hasMax) return `Under ${maxAge} years old`;
  if (minAge === maxAge) return `${maxAge} years old`;
  return `${minAge} – ${maxAge} years old`;
};

// Helper function to format balance range for template display
const formatTemplateBalanceRange = (minBalance, maxBalance) => {
  const hasMin = minBalance !== undefined && minBalance !== null && minBalance !== 0;
  const hasMax = maxBalance !== undefined && maxBalance !== null && maxBalance !== 0;

  if (!hasMin && !hasMax) return null;
  if (hasMin && !hasMax) return `Above ${formatTemplateCurrency(minBalance)}`;
  if (!hasMin && hasMax) return `Under ${formatTemplateCurrency(maxBalance)}`;
  if (minBalance === maxBalance) return formatTemplateCurrency(maxBalance);
  return `${formatTemplateCurrency(minBalance)} – ${formatTemplateCurrency(maxBalance)}`;
};

// Helper function to format education levels for template display - returns array of names
const formatTemplateEducationLevelsArray = (educationLevelsStr) => {
  if (!educationLevelsStr) return [];
  const ids = educationLevelsStr.split(",").map((id) => id.trim()).filter(Boolean);
  if (ids.length === 0) return [];
  return ids.map((id) => EDUCATION_LEVEL_MAP[id] || id);
};

// Helper function to format schooling status for template display
const formatTemplateSchoolingStatus = (schoolingStatusStr) => {
  if (!schoolingStatusStr) return null;
  return SCHOOLING_STATUS_MAP[schoolingStatusStr.trim()] || schoolingStatusStr;
};

// Helper to check if schooling status is "In School"
const isInSchool = (schoolingStatusStr) => {
  if (!schoolingStatusStr) return false;
  return schoolingStatusStr.trim() === "SS-001";
};

const BatchForm = ({ value, onChange }) => {
  const [scheduleDate, setScheduleDate] = useState(null);
  const [scheduleTime, setScheduleTime] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Template states
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [templateSearchTerm, setTemplateSearchTerm] = useState("");
  
  // Debounce search term
  const debouncedSearchTerm = useDebounce(templateSearchTerm, 300);

  // Fetch customize filters (education levels and schooling statuses)
  const { educationLevels, schoolingStatuses } = useCustomizeFilters();
  
  // Fetch topup configs (templates)
  const { configs: templates, loading: templatesLoading, fetchConfigs, deleteConfig } = useTopupConfigs();
  
  // Fetch templates on mount and when search term changes
  useEffect(() => {
    fetchConfigs(debouncedSearchTerm);
  }, [fetchConfigs, debouncedSearchTerm]);

  // Store educationLevels and schoolingStatuses in parent state when loaded
  useEffect(() => {
    if (educationLevels?.length > 0 && schoolingStatuses?.length > 0) {
      onChange({
        ...value,
        educationLevels: educationLevels,
        schoolingStatuses: schoolingStatuses,
      });
    }
  }, [educationLevels, schoolingStatuses]); // eslint-disable-line react-hooks/exhaustive-deps

  // Validate numeric fields
  const validateNumericRanges = (updatedValue) => {
    const errors = {};

    if (value.targetAccounts === 1) {
      // Validate min age
      if (
        updatedValue.minAge !== undefined &&
        updatedValue.minAge !== null &&
        updatedValue.minAge !== ""
      ) {
        if (!Number.isInteger(updatedValue.minAge)) {
          errors.minAge = "Min age must be a number";
        } else if (updatedValue.minAge <= 0) {
          errors.minAge = "Min age must be greater than 0";
        }
      }

      // Validate max age
      if (
        updatedValue.maxAge !== undefined &&
        updatedValue.maxAge !== null &&
        updatedValue.maxAge !== ""
      ) {
        if (!Number.isInteger(updatedValue.maxAge)) {
          errors.maxAge = "Max age must be a number";
        } else if (updatedValue.maxAge <= 0) {
          errors.maxAge = "Max age must be greater than 0";
        }
      }

      // Validate max age >= min age
      if (
        updatedValue.minAge &&
        updatedValue.maxAge &&
        updatedValue.maxAge < updatedValue.minAge
      ) {
        errors.maxAge = "Max age must be >= min age";
      }

      // Validate min balance
      if (
        updatedValue.minBalance !== undefined &&
        updatedValue.minBalance !== null &&
        updatedValue.minBalance !== ""
      ) {
        if (!Number.isInteger(updatedValue.minBalance)) {
          errors.minBalance = "Min balance must be a number";
        } else if (updatedValue.minBalance <= 0) {
          errors.minBalance = "Min balance must be greater than 0";
        }
      }

      // Validate max balance
      if (
        updatedValue.maxBalance !== undefined &&
        updatedValue.maxBalance !== null &&
        updatedValue.maxBalance !== ""
      ) {
        if (!Number.isInteger(updatedValue.maxBalance)) {
          errors.maxBalance = "Max balance must be a number";
        } else if (updatedValue.maxBalance <= 0) {
          errors.maxBalance = "Max balance must be greater than 0";
        }
      }

      // Validate max balance >= min balance
      if (
        updatedValue.minBalance &&
        updatedValue.maxBalance &&
        updatedValue.maxBalance < updatedValue.minBalance
      ) {
        errors.maxBalance = "Max balance must be >= min balance";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAmountChange = (num) => {
    const updatedValue = { ...value, amount: num ? num.toString() : "" };
    
    // Validate amount
    const errors = { ...validationErrors };
    if (num !== null && num !== undefined && num !== "") {
      if (num <= 0) {
        errors.amount = "Amount must be greater than 0";
      } else {
        delete errors.amount;
      }
    } else {
      delete errors.amount;
    }
    
    setValidationErrors(errors);
    onChange(updatedValue);
  };

  const handleAgeChange = (field, num) => {
    const updatedValue = { ...value, [field]: num };
    validateNumericRanges(updatedValue);
    onChange(updatedValue);
  };

  const handleBalanceChange = (field, num) => {
    const updatedValue = { ...value, [field]: num };
    validateNumericRanges(updatedValue);
    onChange(updatedValue);
  };

  const isToday = (date) => {
    return date && date.isSame(dayjs(), "day");
  };

  const getMinimumScheduleTime = () => {
    if (!scheduleDate || !isToday(scheduleDate)) {
      return null;
    }
    // If schedule date is today, min time is now + config minutes
    return dayjs().add(topupConfig.minScheduleAdvanceMinutes, "minute");
  };

  const handleExecuteChange = (e) => {
    onChange({ ...value, immediate: e.target.checked });
    if (e.target.checked) {
      setScheduleDate(null);
      setScheduleTime(null);
    }
  };

  const handleEducationStatusChange = (val) => {
    onChange({ ...value, educationStatus: val });
  };

  const handleTargetAccountChange = (e) => {
    onChange({ ...value, targetAccounts: e.target.value });
  };

  const handleDateChange = (date) => {
    setScheduleDate(date);
    if (date) {
      onChange({ ...value, scheduleDate: date.format("DD/MM/YYYY") });
    }
  };

  const handleTimeChange = (time) => {
    if (time && isToday(scheduleDate)) {
      const minTime = getMinimumScheduleTime();
      if (time.isBefore(minTime)) {
        message.error(
          `Schedule time must be at least ${topupConfig.minScheduleAdvanceMinutes} minutes from now (${minTime.format("hh:mm A")})`,
        );
        return;
      }
    }
    setScheduleTime(time);
    if (time) {
      onChange({ ...value, scheduleTime: time.format("HH:mm") });
    }
  };

  // Handle template selection - show confirmation modal
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setApplyModalVisible(true);
    setTemplateDropdownOpen(false);
  };

  // Apply template to form
  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;

    // Parse education levels from comma-separated string to array of IDs
    const educationStatusIds = selectedTemplate.educationLevels
      ? selectedTemplate.educationLevels.split(",").map((id) => id.trim()).filter(Boolean)
      : [];

    // Parse schooling status (single value) to array
    const schoolingStatusIds = selectedTemplate.schoolingStatuses
      ? [selectedTemplate.schoolingStatuses.trim()]
      : [];

    // Apply template values to form
    onChange({
      ...value,
      targetAccounts: 1, // Switch to Customized
      ruleName: selectedTemplate.ruleName || value.ruleName,
      amount: selectedTemplate.topupAmount ? selectedTemplate.topupAmount.toString() : value.amount,
      remark: selectedTemplate.internalRemarks || value.remark,
      minAge: selectedTemplate.minAge || "",
      maxAge: selectedTemplate.maxAge || "",
      minBalance: selectedTemplate.minBalance || "",
      maxBalance: selectedTemplate.maxBalance || "",
      educationStatus: educationStatusIds,
      SchoolingStatuses: schoolingStatusIds,
    });

    setApplyModalVisible(false);
    setSelectedTemplate(null);
    message.success("Template applied successfully!");
  };

  // Handle delete template click
  const handleDeleteClick = (e, template) => {
    e.stopPropagation();
    setTemplateToDelete(template);
    setDeleteModalVisible(true);
  };

  // Confirm delete template
  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;
    try {
      await deleteConfig(templateToDelete.id);
      setDeleteModalVisible(false);
      setTemplateToDelete(null);
    } catch (error) {
      // Error already handled in hook
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setTemplateSearchTerm(e.target.value);
  };

  // Build template dropdown content
  const templateDropdownContent = (
    <div className={styles.templateDropdownContent}>
      {/* Search Input */}
      <div className={styles.templateSearchWrapper}>
        <Input
          placeholder="Search templates..."
          prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
          value={templateSearchTerm}
          onChange={handleSearchChange}
          onClick={(e) => e.stopPropagation()}
          allowClear
          className={styles.templateSearchInput}
        />
      </div>
      
      {/* Template List */}
      <div className={styles.templateList}>
        {templatesLoading ? (
          <div className={styles.templateLoadingWrapper}>
            <Spin size="small" />
            <span>Loading templates...</span>
          </div>
        ) : templates.length > 0 ? (
          templates.map((template) => (
            <div
              key={template.id}
              className={styles.templateMenuItem}
              onClick={() => handleTemplateSelect(template)}
            >
              {/* Header with Name and Delete Button */}
              <div className={styles.templateItemHeader}>
                <span className={styles.templateItemName}>{template.ruleName}</span>
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => handleDeleteClick(e, template)}
                  className={styles.templateDeleteBtn}
                />
              </div>
              
              {/* Two Column Layout */}
              <div className={styles.templateItemBody}>
                {/* Left Column */}
                <div className={styles.templateItemLeft}>
                  {template.internalRemarks && (
                    <div className={styles.templateItemSubtext}>
                      <span className={styles.templateSubLabel}>Internal Remark:</span>{" "}
                      {template.internalRemarks.length > 40
                        ? `${template.internalRemarks.substring(0, 40)}...`
                        : template.internalRemarks}
                    </div>
                  )}
                  {formatTemplateCurrency(template.topupAmount) && (
                    <div className={styles.templateItemSubtext}>
                      <span className={styles.templateSubLabel}>Amount per Account:</span>{" "}
                      {formatTemplateCurrency(template.topupAmount)}
                    </div>
                  )}
                  {formatTemplateSchoolingStatus(template.schoolingStatuses) && (
                    <div className={styles.templateSchoolingStatus}>
                      <Tag color={isInSchool(template.schoolingStatuses) ? "green" : "default"}>
                        {formatTemplateSchoolingStatus(template.schoolingStatuses)}
                      </Tag>
                    </div>
                  )}
                </div>
                
                {/* Right Column - Badges */}
                <div className={styles.templateItemRight}>
                  {formatTemplateAgeRange(template.minAge, template.maxAge) && (
                    <Tag color="blue">{formatTemplateAgeRange(template.minAge, template.maxAge)}</Tag>
                  )}
                  {formatTemplateBalanceRange(template.minBalance, template.maxBalance) && (
                    <Tag color="purple">{formatTemplateBalanceRange(template.minBalance, template.maxBalance)}</Tag>
                  )}
                </div>
              </div>
              
              {/* Bottom Row - Education Levels */}
              {formatTemplateEducationLevelsArray(template.educationLevels).length > 0 && (
                <div className={styles.templateItemEducation}>
                  {formatTemplateEducationLevelsArray(template.educationLevels).map((level, index) => (
                    <Tag key={index} color="orange">{level}</Tag>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.templateEmptyMessage}>
            {templateSearchTerm ? "No templates found" : "No templates available"}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Template Button */}
      <div className={styles.templateButtonWrapper}>
        <Dropdown
          dropdownRender={() => templateDropdownContent}
          trigger={["click"]}
          open={templateDropdownOpen}
          onOpenChange={setTemplateDropdownOpen}
          overlayClassName={styles.templateDropdown}
        >
          <Button icon={<FileTextOutlined />} className={styles.templateButton}>
            Top-up Template {templatesLoading ? <Spin size="small" /> : <DownOutlined />}
          </Button>
        </Dropdown>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      {/* Rule Name */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          Rule Name <span className={styles.required}>*</span>
        </label>
        <Input
          placeholder="e.g. Monthly Student Support, Q1 Batch, etc."
          value={value.ruleName}
          onChange={(e) => onChange({ ...value, ruleName: e.target.value })}
          className={styles.formInput}
          maxLength={50}
          showCount
        />
      </div>

      {/* Top-up Amount per Account */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          Top-up Amount per Account <span className={styles.required}>*</span>
        </label>
        <InputNumber
          placeholder="Enter amount"
          prefix="S$"
          value={value.amount}
          onChange={handleAmountChange}
          formatter={(value) => {
            if (value === null || value === undefined) return "";
            return value.toString();
          }}
          parser={(value) => {
            if (!value) return "";
            return value.replace(/[^\d.]/g, "");
          }}
          className={styles.formInput}
          step={0.01}
          min={0}
        />
        {validationErrors.amount && (
          <div className={styles.errorMessage}>
            {validationErrors.amount}
          </div>
        )}
      </div>

      {/* Description */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          Description (visible to recipients){" "}
          <span className={styles.required}>*</span>
        </label>
        <Input
          placeholder="e.g., Monthly goverment scheme, Education fund support, etc."
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          className={styles.formInput}
          maxLength={100}
          showCount
        />
        <div className={styles.helperText}>
          This will be shown to students in their transaction history
        </div>
      </div>

      {/* Internal Remark */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Internal Remark</label>
        <Input
          placeholder="e.g., Approved by Minister,Special budget allocation, etc."
          value={value.remark}
          onChange={(e) => onChange({ ...value, remark: e.target.value })}
          className={styles.formInput}
          maxLength={100}
          showCount
        />
        <div className={styles.helperText}>
          For internal tracking only - recipients will NOT see this
        </div>
      </div>

      <Divider />

      {/* Target Accounts */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          Target Accounts <span className={styles.required}>*</span>
        </label>
        <Radio.Group
          onChange={handleTargetAccountChange}
          value={value.targetAccounts}
          className={styles.radioGroup}
        >
          <Radio value={0}>All Education Accounts</Radio>
          <Radio value={1}>Customized</Radio>
        </Radio.Group>
      </div>

      {/* Conditional Fields - Only show when Customized is selected */}
      {value.targetAccounts === 1 && (
        <>
          {/* Age Range */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Age Range</label>
            <div className={styles.rangeInputWrapper}>
              <InputNumber
                placeholder="Min"
                value={value.minAge}
                onChange={(num) => handleAgeChange("minAge", num)}
                className={styles.rangeInput}
                min={0}
              />
              <span className={styles.rangeSeparator}>to</span>
              <InputNumber
                placeholder="Max"
                value={value.maxAge}
                onChange={(num) => handleAgeChange("maxAge", num)}
                className={styles.rangeInput}
                min={0}
              />
            </div>
            {validationErrors.minAge && (
              <div className={styles.errorMessage}>
                {validationErrors.minAge}
              </div>
            )}
            {validationErrors.maxAge && (
              <div className={styles.errorMessage}>
                {validationErrors.maxAge}
              </div>
            )}
          </div>

          {/* Account Balance Range */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Account Balance Range</label>
            <div className={styles.rangeInputWrapper}>
              <InputNumber
                placeholder="Min"
                prefix="S$"
                value={value.minBalance}
                onChange={(num) => handleBalanceChange("minBalance", num)}
                className={styles.rangeInput}
                min={0}
              />
              <span className={styles.rangeSeparator}>to</span>
              <InputNumber
                placeholder="Max"
                prefix="S$"
                value={value.maxBalance}
                onChange={(num) => handleBalanceChange("maxBalance", num)}
                className={styles.rangeInput}
                min={0}
              />
            </div>
            {validationErrors.minBalance && (
              <div className={styles.errorMessage}>
                {validationErrors.minBalance}
              </div>
            )}
            {validationErrors.maxBalance && (
              <div className={styles.errorMessage}>
                {validationErrors.maxBalance}
              </div>
            )}
          </div>

          {/* Education Status */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Education Status</label>
            <Checkbox.Group
              options={educationLevels.map((level) => ({
                label: formatEnumLabel(level.name),
                value: level.id,
              }))}
              value={value.educationStatus}
              onChange={handleEducationStatusChange}
              className={styles.checkboxGroup}
            />
          </div>

          {/* Schooling Status */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Schooling Status</label>
            <Checkbox.Group
              //   value={value.SchoolingStatuses}
              //   onChange={(val) => onChange({ ...value, SchoolingStatuses: val })}
              //   className={styles.checkboxGroup}
              // >
              //   {schoolingStatuses.map((status) => (
              //     <Checkbox key={status.id} value={status.id}>
              //       {status.name}
              //     </Checkbox>
              //   ))}
              value={value.SchoolingStatuses}
              onChange={(val) => {
                // chỉ cho phép 1 giá trị
                const next = val.length === 2 ? [val[val.length - 1]] : val;

                onChange({ ...value, SchoolingStatuses: next });
              }}
              className={styles.checkboxGroup}
            >
              {schoolingStatuses.map((status) => (
                <Checkbox key={status.id} value={status.id}>
                  {formatEnumLabel(status.name)}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </div>

          <Divider />
        </>
      )}

      {/* Execution Settings */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Execution Settings</label>
        <div className={styles.checkboxGroup}>
          <Checkbox checked={value.immediate} onChange={handleExecuteChange}>
            Execute immediately
          </Checkbox>
        </div>
      </div>

      {!value.immediate && (
        <div className={styles.scheduleRow}>
          <div className={styles.scheduleField}>
            <label className={styles.formLabel}>
              Schedule Date <span className={styles.required}>*</span>
            </label>
            <DatePicker
              value={scheduleDate}
              onChange={handleDateChange}
              format="DD/MM/YYYY"
              disabledDate={(current) =>
                current && current.isBefore(dayjs(), "day")
              }
              placeholder="DD/MM/YYYY"
              className={styles.formInput}
              clearIcon
            />
          </div>
          <div className={styles.scheduleField}>
            <label className={styles.formLabel}>
              Schedule Time <span className={styles.required}>*</span>
            </label>
            <TimePicker
              value={scheduleTime}
              onChange={handleTimeChange}
              format="hh:mm A"
              placeholder="hh:mm AM/PM"
              className={styles.formInput}
              showNow={false}
              use12Hours
              disabledTime={() => {
                if (!scheduleDate || !isToday(scheduleDate)) return {};

                const minTime = getMinimumScheduleTime();
                return {
                  disabledHours: () =>
                    Array.from({ length: minTime.hour() }, (_, i) => i),
                  disabledMinutes: (selectedHour) =>
                    selectedHour === minTime.hour()
                      ? Array.from({ length: minTime.minute() }, (_, i) => i)
                      : [],
                };
              }}
            />
          </div>
        </div>
      )}

      {/* Apply Template Confirmation Modal */}
      <Modal
        title="Apply Template"
        open={applyModalVisible}
        onOk={handleApplyTemplate}
        onCancel={() => {
          setApplyModalVisible(false);
          setSelectedTemplate(null);
        }}
        okText="Apply"
        cancelText="Cancel"
        centered
      >
        <p>
          Are you sure you want to apply the template <strong>"{selectedTemplate?.ruleName}"</strong> to the current batch top-up?
        </p>
        <p style={{ color: "#64748b", fontSize: "13px" }}>
          This will switch to Customized targeting and fill in the template values. You can still modify the values after applying.
        </p>
      </Modal>

      {/* Delete Template Confirmation Modal */}
      <Modal
        title="Delete Template"
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setTemplateToDelete(null);
        }}
        okText="Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        centered
      >
        <p>
          Are you sure you want to delete the template <strong>"{templateToDelete?.ruleName}"</strong>?
        </p>
        <p style={{ color: "#ef4444", fontSize: "13px" }}>
          This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default BatchForm;
