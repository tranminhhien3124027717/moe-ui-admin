import React from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import styles from "./TopUpsHeader.module.scss";

const TopUpsHeader = ({ onCreateTopUp }) => {
  return (
    <div className={styles.topHeader}>
      <div>
        <h1 className={styles.pageTitle}>Top-Up Management</h1>
        <p className={styles.pageSubtitle}>Schedule and manage account top-ups</p>
      </div>
      <div className={styles.actionButtons}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className={styles.addBtn}
          onClick={onCreateTopUp}
          style={{ height: "44px", padding: "0 24px", fontSize: "14px", fontWeight: 600 }}
        >
          Top-Up
        </Button>
      </div>
    </div>
  );
};

export default TopUpsHeader;
