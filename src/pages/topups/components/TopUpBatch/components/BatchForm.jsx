import {
  Input,
  Checkbox,
  DatePicker,
  TimePicker,
  Radio,
  InputNumber,
  Divider,
  message,
} from "antd";
import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { topupConfig } from "../../../../../utils/topupConfig";

dayjs.extend(utc);
dayjs.extend(timezone);
import styles from "../TopUpBatch.module.scss";
import { useCustomizeFilters } from "./../../../../../hooks/topups/useCustomizeFilters";
import { formatEnumLabel } from "../../../../../utils/formatters";

const BatchForm = ({ value, onChange }) => {
  const [scheduleDate, setScheduleDate] = useState(null);
  const [scheduleTime, setScheduleTime] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const filtersInitializedRef = useRef(false);

  // Fetch customize filters (education levels and schooling statuses)
  const { educationLevels, schoolingStatuses } = useCustomizeFilters();

  // Store educationLevels and schoolingStatuses in parent state when loaded (only once)
  useEffect(() => {
    if (
      !filtersInitializedRef.current &&
      educationLevels?.length > 0 && 
      schoolingStatuses?.length > 0
    ) {
      filtersInitializedRef.current = true;
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

  return (
    <>

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

    </>
  );
};

export default BatchForm;
