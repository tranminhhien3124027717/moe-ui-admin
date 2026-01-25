import { Modal } from "antd";
import styles from "../TopUpBatch.module.scss";

const EligibleAccountsModal = ({ open, onClose, accounts = [] }) => {
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "S$0";
    return `S$${parseFloat(value).toLocaleString('en-US')}`;
  };

  return (
    <Modal
      title="Eligible Accounts (Real-time)"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      className={styles.eligibleAccountsModal}
    >
      <div className={styles.modalDescription}>
        Complete list of accounts matching the targeting criteria in real-time. The system identifies{" "}
        <strong>{accounts.length} eligible account(s)</strong> based on top-up rules.
      </div>

      <div className={styles.modalAccountsList}>
        {accounts.map((account, idx) => (
          <div key={idx} className={styles.modalAccountItem}>
            <div className={styles.modalAccountNumber}>{idx + 1}.</div>
            <div className={styles.modalAccountDetails}>
              <div className={styles.modalAccountName}>{account.fullName}</div>
              <div className={styles.modalAccountInfo}>
                NRIC: {account.nric}
              </div>
              <div className={styles.modalAccountInfo}>
                Balance: {formatCurrency(account.balance)} | Status: {account.schoolingStatus || account.status}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.modalFooter}>
        <button className={styles.modalCloseButton} onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
};

export default EligibleAccountsModal;
