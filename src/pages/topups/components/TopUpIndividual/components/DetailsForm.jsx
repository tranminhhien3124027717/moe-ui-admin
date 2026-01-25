// components/DetailsForm.jsx
import {
  Input,
  Checkbox,
  Button,
  DatePicker,
  TimePicker,
  InputNumber,
  message,
  Divider,
} from "antd";
import { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { topupConfig } from "../../../../../utils/topupConfig";
import styles from "../TopUpIndividual.module.scss";

dayjs.extend(utc);
dayjs.extend(timezone);

const DetailsForm = ({ accounts, value, onChange, onBack, onNext }) => {
  const [scheduleDate, setScheduleDate] = useState(null);
  const [scheduleTime, setScheduleTime] = useState(null);

  // Initialize schedule date/time from scheduledDateTime when coming back from preview
  useEffect(() => {
    if (value.scheduledDateTime && !value.immediate) {
      const dateObj = dayjs(value.scheduledDateTime);
      setScheduleDate(dateObj);
      setScheduleTime(dateObj);
    }
  }, [value.scheduledDateTime, value.immediate]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    if (
      !value.description ||
      value.amount === null ||
      value.amount === undefined
    )
      return false;

    if (value.immediate) {
      return true;
    } else {
      // If not immediate, require schedule date and time
      return scheduleDate && scheduleTime;
    }
  }, [
    value.description,
    value.amount,
    value.immediate,
    scheduleDate,
    scheduleTime,
  ]);

  const handleAmountChange = (num) => {
    onChange({ ...value, amount: num ?? null });
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
  };

  const handleContinue = () => {
    // Combine schedule date and time into UTC datetime if scheduled
    if (!value.immediate && scheduleDate && scheduleTime) {
      const dateObj = dayjs(scheduleDate.format("YYYY-MM-DD"), "YYYY-MM-DD");
      const timeObj = dayjs(scheduleTime.format("HH:mm"), "HH:mm");

      const combinedDateTime = dateObj
        .hour(timeObj.hour())
        .minute(timeObj.minute())
        .second(0)
        .millisecond(0);

      const utcDateTime = combinedDateTime.utc().toISOString();

      onChange({ ...value, scheduledDateTime: utcDateTime });
    }
    onNext();
  };

  const handleExecuteChange = (e) => {
    onChange({ ...value, immediate: e.target.checked });
    // Reset schedule when toggling
    if (e.target.checked) {
      setScheduleDate(null);
      setScheduleTime(null);
    }
  };

  const handleDateChange = (date) => {
    setScheduleDate(date);
  };

  return (
    <>
      {/* Selected Accounts Section */}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          Selected Accounts{" "}
          <span className={styles.required}>({accounts.length})</span>
        </label>
        <div className={styles.accountsListContainer}>
          {accounts.map((acc, idx) => (
            <div key={idx} className={styles.accountsListItem}>
              <div className={styles.accountsListInfo}>
                <span className={styles.accountsListName}>{acc.fullName}</span>
                <span className={styles.accountsListCode}>{acc.nric}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          Description (visible to recipients){" "}
          <span className={styles.required}>*</span>
        </label>
        <Input
          placeholder="e.g., Monthly allowance, Education support, etc."
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

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Internal Remark</label>
        <Input
          placeholder="e.g., Government scheme batch Q1, Special case approval, etc."
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

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          Top-up Amount per Account <span className={styles.required}>*</span>
        </label>
        <InputNumber
          placeholder="Enter amount"
          prefix="S$"
          value={value.amount}
          formatter={(value) => {
            if (value === null || value === undefined) return "";
            return value.toString();
          }}
          parser={(value) => {
            if (!value) return "";
            return value.replace(/[^\d.]/g, "");
          }}
          onChange={handleAmountChange}
          className={styles.formInput}
          step={1}
          min={0}
        />
      </div>

      <div className={styles.checkboxGroup}>
        <Checkbox
          checked={value.immediate}
          onChange={handleExecuteChange}
          className={styles.checkbox}
        >
          Execute immediately
        </Checkbox>
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
              allowClear
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
              showNow={false}
              placeholder="hh:mm AM/PM"
              className={styles.formInput}
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

      <div className={styles.footer}>
        <Button type="default" onClick={onBack}>
          Back
        </Button>
        <Button type="primary" onClick={handleContinue} disabled={!isFormValid}>
          Continue to Preview
        </Button>
      </div>
    </>
  );
};

export default DetailsForm;
