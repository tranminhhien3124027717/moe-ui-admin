// components/PreviewPanel.jsx
import { Button, Divider, Tooltip } from "antd";
import dayjs from "dayjs";
import styles from "../TopUpIndividual.module.scss";

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

const PreviewPanel = ({ accounts, data, onBack, onSubmit, loading }) => {
  const totalAmount = accounts.length > 0 ? parseFloat(data.amount || 0) * accounts.length : 0;

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "$0";
    return `$${parseFloat(value).toLocaleString('en-US')}`;
  };

  const getExecutionDisplay = () => {
    if (data.immediate) {
      return "Immediate";
    }
    if (data.scheduledDateTime) {
      const scheduled = dayjs(data.scheduledDateTime);
      return `Scheduled: ${scheduled.format('YYYY-MM-DD')} at ${scheduled.format('HH:mm')}`;
    }
    return "-";
  };

  return (
    <>
      {/* Recipients Section */}
      <div className={styles.previewBox}>
        <div className={styles.previewHeader}>
          <h4 className={styles.previewSectionTitle}>Recipients</h4>
          <span className={styles.previewAccountCount}>{accounts.length} accounts</span>
        </div>

        <Divider style={{ margin: "12px 0" }} />

        <label className={styles.previewSubtitle}>Selected Accounts:</label>

        <div className={styles.previewAccountsList}>
          {accounts.map((acc, idx) => {
            const newBalance = parseFloat(acc.balance) + parseFloat(data.amount || 0);
            return (
              <div key={idx} className={styles.previewAccountItem}>
                <div className={styles.previewAccountInfo}>
                  <div className={styles.previewName}>{acc.fullName}</div>
                  <div className={styles.previewCode}>{acc.nric}</div>
                </div>
                <div className={styles.previewAccountBalance}>
                  <div className={styles.previewCurrent}>Balance: {formatCurrency(acc.balance)}</div>
                  <div className={styles.previewNew} style={{ color: "#22c55e" }}>
                    New: {formatCurrency(newBalance)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Divider style={{ margin: "12px 0" }} />

        {/* Summary Section */}
        <div className={styles.previewSummary}>
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
            <span className={styles.previewLabel}>Amount per Account</span>
            <span className={styles.previewAmount}>+{formatCurrency(parseFloat(data.amount || 0))}</span>
          </div>

          <div className={styles.previewSummaryRow}>
            <span className={styles.previewLabel}>Total Disbursement</span>
            <span className={styles.previewTotal}>{formatCurrency(totalAmount)}</span>
          </div>

          <div className={styles.previewSummaryRow}>
            <span className={styles.previewLabel}>Execution</span>
            <span className={styles.previewValue}>
              {getExecutionDisplay()}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <Button onClick={onBack} disabled={loading}>Back</Button>
        <Button type="primary" onClick={onSubmit} loading={loading}>
          Confirm & Submit
        </Button>
      </div>
    </>
  );
};

export default PreviewPanel;
