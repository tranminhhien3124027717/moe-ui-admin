import styles from "../TopUpBatch.module.scss";

const BatchStepHeader = ({ step }) => {
  return (
    <div className={styles.stepHeader}>
      <div className={styles.progress} data-step={step} />
      <div className={styles.labels}>
        <span className={step >= 1 ? styles.active : ""}>Setup</span>
        <span className={step >= 2 ? styles.active : ""}>Review</span>
      </div>
    </div>
  );
};

export default BatchStepHeader;
