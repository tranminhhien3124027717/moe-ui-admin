import React from "react";
import { Button } from "antd";
import { PlusOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import styles from "./AccountHeader.module.scss";

const AccountHeader = ({ showInactive, onToggleInactive, onAddAccount }) => {
  return (
    <div className={styles.topHeader}>
      <div>
        <h1 className={styles.pageTitle}>Account Management</h1>
        <p className={styles.pageSubtitle}>Manage all accounts</p>
      </div>
      <div className={styles.actionButtons}>
        <Button
          icon={showInactive ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          className={`${styles.inactiveBtn} ${showInactive ? styles.isActiveState : ''}`}
          onClick={onToggleInactive}
        >
          {showInactive ? "Hide Inactive" : "Show Inactive"}
        </Button>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          className={styles.addBtn}
          onClick={onAddAccount}
        >
          Add Account
        </Button>
      </div>
    </div>
  );
};

export default AccountHeader;
