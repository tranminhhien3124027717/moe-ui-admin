import React from "react";
import styles from "./StatCard.module.scss";

const StatCard = ({ title, value, icon, type = "default", currency = false }) => (
  <div className={`${styles.statCard} ${styles[type]}`}>
    <div className={styles.statIconWrapper}>{icon}</div>
    <div className={styles.statContent}>
      <span className={styles.statLabel}>{title}</span>
      <span className={styles.statValue}>
        {currency && "$"}
        {value?.toLocaleString() || "0"}
      </span>
    </div>
  </div>
);

export default StatCard;
