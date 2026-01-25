import React from "react";
import styles from "./InfoItem.module.scss";

const InfoItem = ({ label, value, icon }) => (
  <div className={styles.infoItem}>
    <span className={styles.infoLabel}>{label}</span>
    <div className={styles.infoValueWrapper}>
      {icon && <span className={styles.infoIcon}>{icon}</span>}
      <span className={styles.infoValue}>{value || "-"}</span>
    </div>
  </div>
);

export default InfoItem;
