import React, { useState } from "react";
import { Modal, Button, Divider, Tag } from "antd";
import EligibleAccountsModal from "./components/EligibleAccountsModal";
import CancelTopUpModal from "./components/CancelTopUpModal";
import styles from "./TopUpDetail.module.scss";
import dayjs from "dayjs";
import { formatNumberWithCommas } from "../../../../utils/formatters";

const TopUpDetail = ({ data, onClose, onCancelSuccess }) => {
  const [showEligibleAccounts, setShowEligibleAccounts] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [eligibleCountForCancel, setEligibleCountForCancel] = useState(0);
  
  if (!data) return null;
  
  console.log(data.status, typeof data.status);

  // Handler to open cancel modal from EligibleAccountsModal
  const handleOpenCancelFromEligible = (topUpData, eligibleCount) => {
    setEligibleCountForCancel(eligibleCount);
    setShowEligibleAccounts(false);
    setShowCancelConfirm(true);
  };

  const getStatusColor = (status) => {
    const statusMap = {
      0: "grey",
      2: "green",
      1: "red",
    };
    return statusMap[status] || "default";
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      0: "Scheduled",
      2: "Completed",
      1: "Canceled",
    };
    return statusMap[status] || "Unknown";
  };

  // Format age range
  const getAgeRange = () => {
    if (!data.criteria) return "-";
    const { minAge, maxAge } = data.criteria;
    if (!minAge && !maxAge) return "-";
    if (minAge === maxAge) {
      return `${maxAge} years`;
    }
    if (!minAge) return `${maxAge} years`;
    if (!maxAge) return `${minAge} years`;
    return `${minAge} – ${maxAge} years`;
  };

  // Format balance range
  const getBalanceRange = () => {
    if (!data.criteria) return "-";
    const { minBalance, maxBalance } = data.criteria;
    if (!minBalance && !maxBalance) return "-";
    if (minBalance === maxBalance) {
      return `$${maxBalance}`;
    }
    if (!minBalance) return `$${maxBalance}`;
    if (!maxBalance) return `$${minBalance}`;
    return `$${minBalance} – $${maxBalance}`;
  };

  // Format education levels
  const getEducationLevel = () => {
    if (!data.criteria?.educationLevel) return "-";
    return data.criteria.educationLevel;
  };

  // Format schooling status
  const getSchoolingStatus = () => {
    if (!data.criteria?.schoolingStatus) return "-";
    return data.criteria.schoolingStatus;
  };

  // Format scheduled datetime
  const formatScheduledDateTime = () => {
    if (!data.scheduledDate) return { date: "-", time: "-" };
    // Parse the UTC date and add 7 hours for UTC+7
    const dateObj = dayjs(data.scheduledDate).add(7, 'hour');
    if (!dateObj.isValid()) return { date: "-", time: "-" };
    return {
      date: dateObj.format("DD/MM/YYYY"),
      time: dateObj.format("hh:mm A"),
    };
  };

  const { date: scheduledDate, time: scheduledTime } =
    formatScheduledDateTime();

  return (
    <>
      <Modal
        open={true}
        onCancel={onClose}
        footer={null}
        width={880}
        centered
        destroyOnClose
        className={styles.detailModal}
        title={
          data.type === 0 ? "Batch Top-up Details" : "Individual Top-up Details"
        }
      >
        <div className={styles.description}>
          <p>
            {data.type === 0
              ? "Complete information about this scheduled top-up. Eligible accounts are computed in real-time based on top-up rules and targeting criteria."
              : "Complete information about this top-up."}
          </p>
        </div>

        <div className={styles.content}>
          {/* Type and Rule Name / Account Info Section */}
          <div className={styles.section}>
            <div className={styles.row}>
              <div className={styles.col}>
                <label className={styles.label}>Type</label>
                <span className={styles.value}>
                  {data.type === 0 ? "Batch" : "Individual"}
                </span>
              </div>
            </div>

            {data.type === 0 && (
              <div className={styles.row}>
                <div className={styles.col}>
                  <label className={styles.label}>Rule Name</label>
                  <span className={styles.value}>{data.ruleName || "-"}</span>
                </div>
              </div>
            )}

            {data.type === 1 && (
              <>
                <div className={styles.row}>
                  <div className={styles.col}>
                    <label className={styles.label}>Account Name</label>
                    <span className={styles.value}>
                      {data.accountName || "-"}
                    </span>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.col}>
                    <label className={styles.label}>Account ID</label>
                    <span className={styles.value}>
                      {data.accountId || "-"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
          <Divider style={{ margin: "16px 0" }} />

          {data.type === 0 && (
            <>
              <div className={styles.section}>
                <div className={styles.eligibleAccountsRow}>
                  <div>
                    <label className={styles.label}>Eligible Accounts</label>
                    <div>
                      <span className={styles.value1}>
                        {data.eligibleAccounts || 0}
                      </span>
                    </div>
                  </div>
                  <button
                    className={styles.viewListBtn}
                    onClick={() => setShowEligibleAccounts(true)}
                  >
                    View List
                  </button>
                </div>
              </div> 

              <Divider style={{ margin: "16px 0" }} />
            </>
          )}
          {/* Top-up Rules Section - Batch Only */}
          {data.type === 0 && data.criteria && (
            <>
              <div className={styles.rulesSection}>
                <div className={styles.rulesTitle}>Top-up Rules</div>

                <div className={styles.criteriaItem}>
                  <label className={styles.criteriaLabel}>Targeting Type</label>
                  <span className={styles.criteriaValue}>
                    {data.criteria.targetingType || "-"}
                  </span>
                </div>

                <div style={{ borderTop: "1px solid #d1f0ed" }} />

                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#0f766e",
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

              <Divider style={{ margin: "16px 0" }} />
            </>
          )}
          {/* Description and Internal Remarks */}
          {(data.description || data.internalRemarks) && (
            <>
              <div className={styles.section}>
                {data.description && (
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <label className={styles.label}>Description</label>
                      <span className={styles.value}>
                        {data.description || "—"}
                      </span>
                    </div>
                  </div>
                )}

                {data.internalRemarks && (
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <label className={styles.label}>Internal Remarks</label>
                      <span className={styles.value}>
                        {data.internalRemarks || "—"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Divider style={{ margin: "16px 0" }} />
            </>
          )}
          {/* Amount and Status - Same Row */}
          <div className={styles.section}>
            <div className={styles.row}>
              <div className={styles.col}>
                <label className={styles.label}>
                  {data.type === 0 ? "Amount per Account" : "Amount"}
                </label>
                <span className={styles.amountValue}>
                  S${formatNumberWithCommas(data.amountPerAccount || 0, 0)}
                </span>
              </div>
              <div className={styles.col}>
                <label className={styles.label}>Status</label>
                <Tag color={getStatusColor(data.status)} className={styles.tag}>
                  {getStatusLabel(data.status)}
                </Tag>
              </div>
            </div>
          </div>
          {/* Scheduled Date and Time - Same Row */}
          {scheduledDate !== "-" && (
            <>
              <Divider style={{ margin: "16px 0" }} />

              <div className={styles.section}>
                <div className={styles.row}>
                  <div className={styles.col}>
                    <label className={styles.label}>Scheduled Date</label>
                    <span className={styles.value}>{scheduledDate}</span>
                  </div>
                  <div className={styles.col}>
                    <label className={styles.label}>Scheduled Time</label>
                    <span className={styles.value}>{scheduledTime}</span>
                  </div>
                </div>
              </div>
            </>
          )}
          {/* Total Disbursement - Batch Only */}
          {data.type === 0 && (
            <>
              <Divider style={{ margin: "16px 0" }} />

              <div className={styles.totalSection}>
                <label className={styles.label}>Total Disbursement</label>
                <span className={styles.totalValue}>
                  S${formatNumberWithCommas(data.totalDisbursement || 0, 0)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <Divider style={{ margin: "16px 0" }} />

        <div className={styles.footer}>
          <Button
            danger
            onClick={() => setShowCancelConfirm(true)}
            className={styles.cancelBtn}
            disabled={Number(data.status) === 2}
          >
            Cancel Top-up Order
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </Modal>

      {/* Eligible Accounts Modal */}
      {showEligibleAccounts && (
        <EligibleAccountsModal
          data={data}
          onClose={() => setShowEligibleAccounts(false)}
          onCancelTopUp={handleOpenCancelFromEligible}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <CancelTopUpModal
          data={data}
          onClose={() => setShowCancelConfirm(false)}
          eligibleCount={eligibleCountForCancel || data.eligibleAccounts || 0}
          onCancelSuccess={onCancelSuccess}
        />
      )}
    </>
  );
};

export default TopUpDetail;
