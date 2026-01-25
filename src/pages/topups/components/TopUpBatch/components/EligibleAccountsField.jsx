import { TeamOutlined } from "@ant-design/icons";
import styles from "../TopUpBatch.module.scss";

const EligibleAccountsField = ({ count = 0, showError = false }) => {
  return (
    <div className={styles.formGroup}>
      <div className={styles.eligibleAccountsRow}>
        <TeamOutlined className={styles.eligibleAccountsIcon} />
        <div className={styles.eligibleAccountsContent}>
          <span className={styles.eligibleAccountsLabel}>Eligible Accounts</span>
          <span className={styles.eligibleAccountsNumber}>{count}</span>
        </div>
      </div>
      <div className={styles.helperText}>
        Number of accounts that meet all filter options above
      </div>
      {showError && count === 0 && (
        <div className={styles.errorMessage}>
          No eligible accounts, adjust criteria to continue
        </div>
      )}
    </div>
  );
};

export default EligibleAccountsField;
