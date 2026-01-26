// components/BatchPreview.jsx
import { Divider, Tooltip } from "antd";
import { useState } from "react";
import EligibleAccountsModal from "./EligibleAccountsModal";
import styles from "../TopUpBatch.module.scss";
import { useAllAccountsList } from "../../../../../hooks/topups/useFilteredAccounts";
import { formatEnumLabel } from "../../../../../utils/formatters";

// Truncated text component with "read more" tooltip
const TruncatedText = ({ text, maxLength = 50 }) => {
  if (!text || text === "-" || text === "---") return text || "-";
  
  if (text.length <= maxLength) {
    return text;
  }
  
  const truncated = text.substring(0, maxLength) + "...";
  
  return (
    <Tooltip title={text} placement="topLeft">
      <span style={{ cursor: "pointer" }}>
        {truncated} <span style={{ color: "#1890ff", fontSize: "12px" }}>read more</span>
      </span>
    </Tooltip>
  );
};

const BatchPreview = ({ 
  data, 
  matchingAccounts = 0, 
  eligibleAccounts = [], 
  educationLevels = [], 
  schoolingStatuses = [],
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const totalAmount = parseFloat(data.amount || 0) * matchingAccounts;

  // Use hook for all accounts when "Everyone" is selected
  const { data: allAccounts } = useAllAccountsList();

  // Determine which accounts to show in modal - use passed eligibleAccounts for customized
  const accountsToShow = data.targetAccounts === 0 ? allAccounts : eligibleAccounts;

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "S$0";
    return `S$${parseFloat(value).toLocaleString("en-US")}`;
  };

  // Format age range
  const getAgeRange = () => {
    const min = data.minAge;
    const max = data.maxAge;
    const hasMin = min !== undefined && min !== null && min !== "";
    const hasMax = max !== undefined && max !== null && max !== "";

    if (!hasMin && !hasMax) return "-";
    if (hasMin && !hasMax) return `Above ${min} years old`;
    if (!hasMin && hasMax) return `Under ${max} years old`;
    if (String(min) === String(max)) return `${max} years`;
    return `${min} – ${max} years`;
  };

  // Format balance range
  const getBalanceRange = () => {
    if (!data.minBalance && !data.maxBalance) return "-";
    if (data.minBalance === data.maxBalance)
      return formatCurrency(data.maxBalance);
    if (!data.minBalance) return `Under ${formatCurrency(data.maxBalance)}`;
    if (!data.maxBalance) return `Above ${formatCurrency(data.minBalance)}`;
    return `${formatCurrency(data.minBalance)} – ${formatCurrency(data.maxBalance)}`;
  };

  // Format education level - map IDs to names
  const getEducationLevel = () => {
    if (!data.educationStatus || data.educationStatus.length === 0) return "-";
    return data.educationStatus
      .map(id => {
        const level = educationLevels.find(item => item.id === id);
        return level ? formatEnumLabel(level.name) : null;
      })
      .filter(Boolean)
      .join(", ");
  };

  // Format schooling status - map IDs to names
  const getSchoolingStatus = () => {
    if (!data.SchoolingStatuses || data.SchoolingStatuses.length === 0)
      return "-";
    return data.SchoolingStatuses
      .map(id => {
        const status = schoolingStatuses.find(item => item.id === id);
        return status ? formatEnumLabel(status.name) : null;
      })
      .filter(Boolean)
      .join(", ");
  };

  return (
    <>
      <div className={styles.previewBox}>
        <div className={styles.previewHeader}>
          <h4 className={styles.previewSectionTitle}>Confirm Batch Top-up</h4>
        </div>

        <Divider style={{ margin: "12px 0" }} />

        {/* Summary Section */}
        <div className={styles.previewSummary}>
          <div className={styles.previewSummaryRow}>
            <span className={styles.previewLabel}>Rule Name</span>
            <span className={styles.previewValue}>
              <TruncatedText text={data.ruleName} maxLength={40} />
            </span>
          </div>

          <div className={styles.previewSummaryRow}>
            <span className={styles.previewLabel}>Amount per Account</span>
            <span className={styles.previewAmount}>
              {formatCurrency(parseFloat(data.amount || 0))}
            </span>
          </div>

          {data.targetAccounts === 1 && (
            <>
              <Divider style={{ margin: "12px 0" }} />
              <div className={styles.rulesSection}>
                <div className={styles.rulesTitle}>Top-up Rules</div>
                <div className={styles.criteriaItem}>
                  <label className={styles.criteriaLabel}>Targeting Type</label>
                  <span className={styles.criteriaValue}>
                    Customized Criteria
                  </span>
                </div>
                <div
                  style={{ borderTop: "1px solid #d1f0ed", margin: "8px 0" }}
                />
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#0f766e",
                    marginBottom: "8px",
                  }}
                >
                  Criteria Applied:
                </div>
                <div className={styles.rulesCriteria}>
                  <div className={styles.criteriaItem}>
                    <label className={styles.criteriaLabel}>Age Range</label>
                    <span className={styles.criteriaValue}>
                      {getAgeRange()}
                    </span>
                  </div>
                  <div className={styles.criteriaItem}>
                    <label className={styles.criteriaLabel}>
                      Balance Range
                    </label>
                    <span className={styles.criteriaValue}>
                      {getBalanceRange()}
                    </span>
                  </div>
                  <div className={styles.criteriaItem}>
                    <label className={styles.criteriaLabel}>
                      Education Level
                    </label>
                    <span className={styles.criteriaValue}>
                      {getEducationLevel()}
                    </span>
                  </div>
                  <div className={styles.criteriaItem}>
                    <label className={styles.criteriaLabel}>
                      Schooling Status
                    </label>
                    <span className={styles.criteriaValue}>
                      {getSchoolingStatus()}
                    </span>
                  </div>
                </div>
              </div>
              <Divider style={{ margin: "12px 0" }} />
            </>
          )}

          <div className={styles.previewSummaryRow}>
            <span className={styles.previewLabel}>Description</span>
            <span className={styles.previewValue}>
              <TruncatedText text={data.description} maxLength={40} />
            </span>
          </div>

          <div className={styles.previewSummaryRow}>
            <span className={styles.previewLabel}>Internal Remark</span>
            <span className={styles.previewValue}>
              <TruncatedText text={data.remark || "-"} maxLength={40} />
            </span>
          </div>

          <div className={styles.previewSummaryRow}>
            <span className={styles.previewLabel}>Targeting</span>
            <span className={styles.previewValue}>
              {data.targetAccounts === 0 ? "Everyone" : "Customized"}
            </span>
          </div>

          {data.targetAccounts === 1 && (
            <>
              <div className={styles.previewSummaryRow}>
                <span className={styles.previewLabel}>Eligible Accounts</span>
                <span className={styles.previewValue}>
                  {matchingAccounts}
                </span>
              </div>
              <div className={styles.viewListButtonWrapper}>
                <Button
                  onClick={() => setModalOpen(true)}
                  className={styles.viewListButton}
                >
                  View List
                </Button>
              </div>
            </>
          )}

          <Divider style={{ margin: "12px 0" }} />

          <div className={styles.previewSummaryRow}>
            <span className={styles.previewLabel}>Total Disbursement</span>
            <span className={styles.previewTotal}>
              {formatCurrency(totalAmount)}
            </span>
          </div>

          {!data.immediate && (
            <>
              <div className={styles.previewSummaryRow}>
                <span className={styles.previewLabel}>Schedule Date</span>
                <span className={styles.previewValue}>
                  {data.scheduleDate || "-"}
                </span>
              </div>

              <div className={styles.previewSummaryRow}>
                <span className={styles.previewLabel}>Schedule Time</span>
                <span className={styles.previewValue}>
                  {data.scheduleTime || "-"}
                </span>
              </div>

              <div className={styles.previewNote}>
                <span>This batch top-up will be scheduled for execution.</span>
              </div>
            </>
          )}
        </div>
      </div>

      <EligibleAccountsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        accounts={accountsToShow}
      />
    </>
  );
};

export default BatchPreview;
