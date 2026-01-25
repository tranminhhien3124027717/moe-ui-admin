import React from "react";
import styles from "./StatusTag.module.scss";

const StatusTag = ({ status }) => {
  // Chuẩn hóa text về chữ thường để so sánh cho dễ
  const normalizedStatus = status ? status.toLowerCase() : "";

  // Hàm xác định loại màu dựa trên text
  const getType = (s) => {
    switch (s) {
      // --- GREEN (Success) ---
      case "completed":
      case "fully paid":
      case "paid":
        return "success";

      // --- ORANGE (Warning) ---
      case "outstanding":
      case "processing":
        return "warning";

      // --- BLUE (Info/Scheduled) ---
      case "scheduled":
        return "info";

      // --- RED (Error) ---
      case "canceled":
      case "cancelled":
      case "failed":
        return "error";

      // --- TEAL (Active/Brand) ---
      case "active":
      case "in school":
        return "active";

      // --- GREY (Neutral) ---
      case "no outstanding":
      case "not in school":
      case "not active":
        return "neutral";

      default:
        return "neutral";
    }
  };

  const type = getType(normalizedStatus);

  return (
    <span className={`${styles.statusTag} ${styles[type]}`}>{status}</span>
  );
};

export default StatusTag;
