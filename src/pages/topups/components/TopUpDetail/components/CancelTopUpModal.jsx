import React from "react";
import { Modal, Button, message } from "antd";
import { useCancelTopUp } from "../../../../../hooks/topups/useCancelTopUp";
import { formatNumberWithCommas } from "../../../../../utils/formatters";
import styles from "./CancelTopUpModal.module.scss";

const CancelTopUpModal = ({ data, onClose, eligibleCount, amountPerAccount, onCancelSuccess }) => {
  const { cancelTopUp, loading } = useCancelTopUp();

  const handleCancelOrder = async () => {
    const body = {
      type: data.type || 0,
      educationAccountId: data.type === 1 ? (data.accountId || "") : ""
    };
    const result = await cancelTopUp(data.id, body);
    if (result.success) {
      message.success("Top-up order cancelled successfully");
      onClose();
      if (onCancelSuccess) {
        onCancelSuccess();
      }
    } else {
      message.error(result.error || "Failed to cancel top-up order");
    }
  };

  return (
    <Modal
      open={true}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      destroyOnClose
      className={styles.cancelModal}
      title="Cancel Top-up Order"
    >
      <div className={styles.content}>
        <p className={styles.message}>
          Are you sure you want to cancel this scheduled top-up order? This will
          prevent the top-up from being executed and the status will be changed
          to "Cancelled".
        </p>

        <div className={styles.details}>
          <div className={styles.detailItem}>
            <span className={styles.label}>{data.ruleName || data.accountName}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.info}>
              Amount S${formatNumberWithCommas(amountPerAccount || 0, 0)} •{" "}
              {eligibleCount || data.eligibleCount || 0} account(s)
            </span>
          </div>
        </div>

        <div className={styles.footer}>
          <Button onClick={onClose} className={styles.keepBtn} disabled={loading}>
            Keep Order
          </Button>
          <Button
            danger
            onClick={handleCancelOrder}
            className={styles.cancelBtn}
            loading={loading}
          >
            Cancel Order
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CancelTopUpModal;
