// components/StepHeader.jsx
import styles from "../TopUpIndividual.module.scss";

const StepHeader = ({ step }) => {
  return (
    <div className={styles.stepHeader}>
      <div className={styles.progress} data-step={step} />
      <div className={styles.labels}>
        <span className={step >= 1 ? styles.active : ""}>Select Account</span>
        <span className={step >= 2 ? styles.active : ""}>Details</span>
        <span className={step >= 3 ? styles.active : ""}>Preview</span>
      </div>
    </div>
  );
};

export default StepHeader;
