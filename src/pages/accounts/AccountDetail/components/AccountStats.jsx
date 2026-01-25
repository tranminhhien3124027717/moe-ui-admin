import React from "react";
import StatCard from "../../shared/StatCard";
import {
  CreditCardOutlined,
  ReadOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import styles from "./AccountStats.module.scss";

const AccountStats = ({ balance, courseCount, outstandingFees, residentialStatus }) => {
  const isSingaporeCitizen = residentialStatus === 'SingaporeCitizen' || residentialStatus === 'Singapore Citizen';

  return (
    <div className={`${styles.statsRow} ${!isSingaporeCitizen ? styles.twoColumn : ''}`}>
      {isSingaporeCitizen && (
        <StatCard
          title="Balance"
          value={balance}
          icon={<CreditCardOutlined style={{ fontSize: '28px' }} />}
          type="balance"
          currency
        />
      )}
      <StatCard
        title="Enrolled Courses"
        value={courseCount}
        icon={<ReadOutlined style={{ fontSize: '28px' }} />}
        type="courses"
      />
      <StatCard
        title="Outstanding Fees"
        value={outstandingFees}
        icon={<ExclamationCircleOutlined style={{ fontSize: '28px' }} />}
        type="fees"
        currency
      />
    </div>
  );
};

export default AccountStats;
