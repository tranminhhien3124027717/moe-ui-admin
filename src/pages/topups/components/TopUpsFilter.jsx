import React, { useState } from "react";
import { Input, Select, Button, DatePicker, message, Checkbox } from "antd";
import {
  SearchOutlined,
  CloseOutlined,
  TeamOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import StatusTag from "../../../components/common/StatusTag/StatusTag";
import dayjs from "dayjs";
import styles from "./TopUpsFilter.module.scss";

const TopUpsFilter = ({ filter, updateFilter, total, dataCount }) => {
  const [activePeriod, setActivePeriod] = useState("all");
  // eslint-disable-next-line no-unused-vars
  const [isManualDateInput, setIsManualDateInput] = useState(false);

  const handleStartDateChange = (date) => {
    setIsManualDateInput(true);
    if (!date) {
      updateFilter({ ScheduledDateFrom: "" });
      return;
    }

    const today = dayjs().startOf("day");

    // Validate start date >= today
    if (date.isBefore(today)) {
      message.error("Start date cannot be before today");
      return;
    }

    // Validate start date < end date
    if (filter.ScheduledDateTo && date.isAfter(dayjs(filter.ScheduledDateTo))) {
      message.error("Start date must be before end date");
      return;
    }

    setActivePeriod(null);
    updateFilter({ ScheduledDateFrom: date.format("YYYY-MM-DD") });
  };

  const handleEndDateChange = (date) => {
    setIsManualDateInput(true);
    if (!date) {
      updateFilter({ ScheduledDateTo: "" });
      return;
    }

    const today = dayjs().startOf("day");

    // Validate end date >= today
    if (date.isBefore(today)) {
      message.error("End date cannot be before today");
      return;
    }

    // Validate start date < end date
    if (filter.ScheduledDateFrom && dayjs(filter.ScheduledDateFrom).isAfter(date)) {
      message.error("End date must be after start date");
      return;
    }

    setActivePeriod(null);
    updateFilter({ ScheduledDateTo: date.format("YYYY-MM-DD") });
  };

  const handlePeriodChange = (period) => {
    const today = dayjs();
    let startDate, endDate;

    switch (period) {
      case "all":
        startDate = null;
        endDate = null;
        break;
      case "thisMonth":
        startDate = today.startOf("month");
        endDate = today.endOf("month");
        break;
      case "lastMonth":
        startDate = today.subtract(1, "month").startOf("month");
        endDate = today.subtract(1, "month").endOf("month");
        break;
      case "thisQuarter": {
        const currentQuarter = Math.floor(today.month() / 3);
        startDate = today.clone().month(currentQuarter * 3).startOf("month");
        endDate = today.clone().month((currentQuarter + 1) * 3 - 1).endOf("month");
        break;
      }
      case "thisYear":
        startDate = today.startOf("year");
        endDate = today.endOf("year");
        break;
      case "nextYear":
        startDate = today.add(1, "year").startOf("year");
        endDate = today.add(1, "year").endOf("year");
        break;
      default:
        startDate = null;
        endDate = null;
    }

    setActivePeriod(period);
    updateFilter({
      ScheduledDateFrom: startDate ? startDate.format("YYYY-MM-DD") : "",
      ScheduledDateTo: endDate ? endDate.format("YYYY-MM-DD") : "",
    });
  };

  const hasActiveFilters = () => {
    return (
      (filter.Search && filter.Search.trim() !== "") ||
      (filter.Types && filter.Types !== "" && filter.Types !== null) ||
      (filter.Statuses &&
        Array.isArray(filter.Statuses) &&
        filter.Statuses.length > 0) ||
      (filter.ScheduledDateFrom && filter.ScheduledDateFrom !== "") ||
      (filter.ScheduledDateTo && filter.ScheduledDateTo !== "")
    );
  };

  const handleClearFilters = () => {
    setActivePeriod("all");
    setIsManualDateInput(false);
    updateFilter({
      Search: "",
      Types: null,
      Statuses: [],
      ScheduledDateFrom: "",
      ScheduledDateTo: "",
    });
  };

  const statusValue = Array.isArray(filter.Statuses) ? filter.Statuses : [];

  return (
    <div className={styles.filterCard}>
      <div className={styles.filtersRow}>
        <div className={styles.searchWrapper}>
          <Input
            prefix={
              <SearchOutlined
                style={{
                  color: "#94a3b8",
                  fontSize: "16px",
                  marginRight: "8px",
                }}
              />
            }
            placeholder="Search by name..."
            className={styles.mainSearch}
            value={filter.Search || ""}
            onChange={(e) => {
              const value = e.target.value;
              updateFilter({ Search: value || null });
            }}
          />
        </div>

        <div className={styles.filterItem}>
          <Select
            placeholder="All Types"
            className={styles.filterSelect}
            value={filter.Types === "" || filter.Types === null ? "" : filter.Types}
            onChange={(val) => {
              updateFilter({ Types: val === "" ? null : val });
            }}
            prefix={
              <TeamOutlined
                style={{
                  color: "#94a3b8",
                  fontSize: "16px",
                  marginRight: "8px",
                }}
              />
            }
            options={[
              { value: "", label: "All Types" },
              { value: 1, label: "Individual" },
              { value: 0, label: "Batch" },
            ]}
            optionLabelRender={(option) => (
              <span style={{ fontSize: "13px", fontWeight: "500" }}>
                {option.label}
              </span>
            )}
          />
        </div>

        <div className={styles.filterItem}>
          <Select
            mode="multiple"
            showSearch={false}
            prefix={
              <CalendarOutlined
                style={{
                  color: "#94a3b8",
                  fontSize: "16px",
                  marginRight: "8px",
                }}
              />
            }
            placeholder="All Status"
            maxTagCount={0}
            maxTagPlaceholder={(omitted) =>
              omitted.length === 3
                ? "All Status"
                : omitted.length === 1
                ? omitted[0].label
                : `${omitted.length} selected`
            }
            className={styles.filterSelect}
            value={statusValue || []}
            onChange={(val) => updateFilter({ Statuses: val })}
            options={[
              { value: 0, label: "Scheduled" },
              { value: 2, label: "Completed" },
              { value: 1, label: "Cancelled" },
            ]}
            optionRender={(option) => (
              <div className={styles.customOption}>
                <Checkbox checked={statusValue.includes(option.value)} />
                <span style={{ marginLeft: "8px", fontSize: "13px" }}>
                  {option.label}
                </span>
              </div>
            )}
            optionLabelRender={(option) => (
              <span style={{ fontSize: "13px", fontWeight: "500" }}>
                {option.label}
              </span>
            )}
          />
        </div>
      </div>

      <div className={styles.filtersRow2}>
        <div className={styles.periodSection}>
          <span className={styles.periodLabel}>Schedule Date:</span>
          <div className={styles.periodButtons}>
            <Button
              className={`${styles.periodBtn} ${activePeriod === "all" ? styles.activePeriodBtn : ""}`}
              onClick={() => handlePeriodChange("all")}
            >
              All
            </Button>
            <Button
              className={`${styles.periodBtn} ${activePeriod === "thisMonth" ? styles.activePeriodBtn : ""}`}
              onClick={() => handlePeriodChange("thisMonth")}
            >
              This Month
            </Button>
            <Button
              className={`${styles.periodBtn} ${activePeriod === "lastMonth" ? styles.activePeriodBtn : ""}`}
              onClick={() => handlePeriodChange("lastMonth")}
            >
              Last Month
            </Button>
            <Button
              className={`${styles.periodBtn} ${activePeriod === "thisQuarter" ? styles.activePeriodBtn : ""}`}
              onClick={() => handlePeriodChange("thisQuarter")}
            >
              This Quarter
            </Button>
            <Button
              className={`${styles.periodBtn} ${activePeriod === "thisYear" ? styles.activePeriodBtn : ""}`}
              onClick={() => handlePeriodChange("thisYear")}
            >
              This Year
            </Button>
            <Button
              className={`${styles.periodBtn} ${activePeriod === "nextYear" ? styles.activePeriodBtn : ""}`}
              onClick={() => handlePeriodChange("nextYear")}
            >
              Next Year
            </Button>
          </div>
        </div>

        <div className={styles.dateRangeSection}>
          <DatePicker
            format="DD/MM/YYYY"
            placeholder="DD/MM/YYYY"
            value={filter.ScheduledDateFrom ? dayjs(filter.ScheduledDateFrom) : null}
            onChange={handleStartDateChange}
            className={styles.dateInput}
          />
          <span className={styles.dateSeparator}>to</span>
          <DatePicker
            format="DD/MM/YYYY"
            placeholder="DD/MM/YYYY"
            value={filter.ScheduledDateTo ? dayjs(filter.ScheduledDateTo) : null}
            onChange={handleEndDateChange}
            className={styles.dateInput}
          />
        </div>
      </div>

      <div className={styles.filterFooter}>
        <span className={styles.showingText}>
          Showing {dataCount || 0} of {dataCount || 0} top-ups
        </span>

        {hasActiveFilters() && (
          <Button
            type="link"
            danger
            icon={<CloseOutlined />}
            className={styles.clearBtn}
            onClick={handleClearFilters}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default TopUpsFilter;
