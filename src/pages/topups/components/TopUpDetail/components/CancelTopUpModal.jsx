import React from "react";
import { Modal, Button, message } from "antd";
import { useCancelTopUp } from "../../../../../hooks/topups/useCancelTopUp";
import styles from "./CancelTopUpModal.module.scss";

const CancelTopUpModal = ({ data, onClose, eligibleCount, onCancelSuccess }) => {
  const { cancelTopUp, loading } = useCancelTopUp();

  const handleCancelOrder = async () => {
    const result = await cancelTopUp(data.id);
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
            <span className={styles.label}>{data.ruleName}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.info}>
              Amount S${parseFloat(data.amount || 0).toFixed(2)} •{" "}
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
