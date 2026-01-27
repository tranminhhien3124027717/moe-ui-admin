import React from "react";
import { Button, Typography, Tag } from "antd";
import { ArrowLeftOutlined, EditOutlined, StopOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styles from "./AccountDetailHeader.module.scss";

const { Title, Text } = Typography;

const AccountDetailHeader = ({ accountInfo, onDeactivate, onActivate, onEdit, isActivating }) => {
  const navigate = useNavigate();
  
  // Determine account type based on residential status (Singapore Citizen = Education Account, others = Student Account)
  const residentialStatus = accountInfo.studentInformation?.residentialStatus;
  const isSingaporeCitizen = residentialStatus === 'SingaporeCitizen' || residentialStatus === 'Singapore Citizen';
  const accountTypeLabel = isSingaporeCitizen ? "Education Account" : "Student Account";
  const accountTypeColor = isSingaporeCitizen ? "#9333ea" : "#0ea5e9";
  const accountTypeBgColor = isSingaporeCitizen ? "#f3e8ff" : "#e0f2fe";

  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <Button
          icon={<ArrowLeftOutlined />}
          type="text"
          className={styles.backBtn}
          onClick={() => navigate(-1)}
        />
        <div>
          <div className={styles.titleRow}>
            <Title level={3} className={styles.pageTitle}>
              {accountInfo.fullName}
            </Title>
            <Tag
              style={{
                color: accountTypeColor,
                backgroundColor: accountTypeBgColor,
                border: "none",
                borderRadius: "16px",
                padding: "4px 12px",
                fontWeight: 500,
                fontSize: "13px",
              }}
            >
              {accountTypeLabel}
            </Tag>
          </div>
          <Text type="secondary" className={styles.subtitle}>
            {accountInfo.nric}
          </Text>
        </div>
      </div>
      <div className={styles.headerActions}>
        <Button icon={<EditOutlined />} onClick={onEdit}>Edit</Button>
        {accountInfo.isActive ? (
          <Button
            type="primary"
            danger
            icon={<StopOutlined />}
            onClick={onDeactivate}
            style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
          >
            Deactivate Account
          </Button>
        ) : (
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={onActivate}
            loading={isActivating}
          >
            Activate Account
          </Button>
        )}
      </div>
    </div>
  );
};

export default AccountDetailHeader;
