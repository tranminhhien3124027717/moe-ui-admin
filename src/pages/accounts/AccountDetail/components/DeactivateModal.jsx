import React from "react";
import { Modal, Button } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import styles from "./DeactivateModal.module.scss";

const DeactivateModal = ({
  open,
  onCancel,
  onConfirm,
  loading,
  accountInfo
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={520}
      className={styles.deactivateModal}
    >
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Deactivate Student Account?</h2>
        <p className={styles.modalDescription}>
          This will deactivate the account for <strong>{accountInfo?.fullName}</strong>. The account will
          remain in the system but the student will not be able to access the e-service
          portal or make payments.
        </p>
        {accountInfo?.outstandingFees > 0 && (
          <p className={styles.modalWarning}>
            <WarningOutlined /> Warning: This student has ${accountInfo.outstandingFees?.toLocaleString()} in outstanding fees.
          </p>
        )}
        <div className={styles.modalFooter}>
          <Button
            size="large"
            onClick={onCancel}
            className={styles.cancelBtn}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            danger
            size="large"
            loading={loading}
            onClick={onConfirm}
            className={styles.deactivateBtn}
          >
            Deactivate
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeactivateModal;
