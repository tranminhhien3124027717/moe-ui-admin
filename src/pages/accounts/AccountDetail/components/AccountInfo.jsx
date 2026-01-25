import React from "react";
import InfoItem from "../../shared/InfoItem";
import StatusTag from "../../../../components/common/StatusTag/StatusTag";
import { formatStatus } from "../../../../utils/formatters";
import {
  UserOutlined,
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import styles from "./AccountInfo.module.scss";

const AccountInfo = ({ student, isActive }) => {
  return (
    <div className={styles.infoCard}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>
          <UserOutlined />{" "}
          {student.schoolingStatus === "InSchool"
            ? "Student Information"
            : "Education Account Information"}
        </h3>
      </div>
      <div className={styles.infoGrid}>
        <InfoItem
          label="DATE OF BIRTH"
          value={`${student.dateOfBirth} (${student.age} years old)`}
          icon={<CalendarOutlined />}
        />
        <InfoItem label="EMAIL" value={student.email} icon={<MailOutlined />} />
        <InfoItem
          label="PHONE"
          value={student.contactNumber}
          icon={<PhoneOutlined />}
        />
        <InfoItem
          label="EDUCATION LEVEL"
          value={formatStatus(student.educationLevel)}
        />
        <InfoItem
          label="RESIDENTIAL STATUS"
          value={formatStatus(student.residentialStatus)}
        />
        <InfoItem
          label="SCHOOLING STATUS"
          value={<StatusTag status={formatStatus(student.schoolingStatus)} />}
        />
        <InfoItem label="ACCOUNT CREATED" value={student.createdAt} />
       
        <InfoItem
          label="REGISTERED ADDRESS"
          value={student.registeredAddress}
        />
         <InfoItem
          label="ACCOUNT STATUS"
          value={<StatusTag status={isActive ? "Active" : "Not Active"} />}
        />

        <InfoItem label="MAILING ADDRESS" value={student.mailingAddress} />
        <div />
        
      </div>
    </div>
  );
};

export default AccountInfo;
