import React, { useEffect, useState } from "react";
import { Spin, Alert, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import {
  BookOutlined,
  WarningOutlined,
  CreditCardOutlined,
  WalletOutlined
} from "@ant-design/icons";
import { useAccounts } from "../../../hooks/accounts/useAccount";
import { accountService } from "../../../services/accountService";
import AccountDetailHeader from "./components/AccountDetailHeader";
import AccountStats from "./components/AccountStats";
import AccountInfo from "./components/AccountInfo";
import DeactivateModal from "./components/DeactivateModal";
import EditAccountModal from "./components/EditAccountModal";
import ConfigurableTable from "../shared/ConfigurableTable";
import StatusTag from "../../../components/common/StatusTag/StatusTag";
import styles from "./AccountDetail.module.scss";

const AccountDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, accountInfo, getAccountByID } = useAccounts();
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [enrolledParams, setEnrolledParams] = useState({ page: 1, size: 5 });
  const [outstandingParams, setOutstandingParams] = useState({ page: 1, size: 5 });
  const [topUpParams, setTopUpParams] = useState({ page: 1, size: 5 });
  const [paymentParams, setPaymentParams] = useState({ page: 1, size: 5 });

  useEffect(() => {
    if (id) {
      getAccountByID(id, {
        topUpPageNumber: topUpParams.page,
        topUpSize: topUpParams.size,
        paymentPage: paymentParams.page,
        paymentSize: paymentParams.size
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, topUpParams, paymentParams]);

  const handleDeactivateClick = () => {
    setIsDeactivateModalOpen(true);
  };

  const handleActivateClick = async () => {
    setIsActivating(true);
    try {
      await accountService.activateAccount(id);
      message.success('Account activated successfully');
      await getAccountByID(id, {
        topUpPage: topUpParams.page,
        topUpSize: topUpParams.size,
        paymentPage: paymentParams.page,
        paymentSize: paymentParams.size
      });
    } catch (error) {
      console.error('Failed to activate account:', error);
      message.error(error.message || 'Failed to activate account');
    } finally {
      setIsActivating(false);
    }
  };

  const handleDeactivateConfirm = async () => {
    setIsDeactivating(true);
    try {
      await accountService.deactivateAccount(id);
      message.success('Account deactivated successfully');
      await getAccountByID(id, {
        topUpPage: topUpParams.page,
        topUpSize: topUpParams.size,
        paymentPage: paymentParams.page,
        paymentSize: paymentParams.size
      });
      setIsDeactivateModalOpen(false);
    } catch (error) {
      console.error('Failed to deactivate account:', error);
      message.error(error.message || 'Failed to deactivate account');
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleDeactivateCancel = () => {
    setIsDeactivateModalOpen(false);
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
  };

  const handleEditSave = async (values) => {
    setIsSaving(true);
    try {
      await accountService.updateAccount(id, values);
      message.success('Account updated successfully');
      await getAccountByID(id, {
        topUpPage: topUpParams.page,
        topUpSize: topUpParams.size,
        paymentPage: paymentParams.page,
        paymentSize: paymentParams.size
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update account:', error);
      message.error(error.message || 'Failed to update account');
    } finally {
      setIsSaving(false);
    }
  };

  const formatPaymentMethod = (method) => {
    if (!method) return '-';
    // Special case for Combined payment method
    if (method === 'Combined') return 'Balance + Bank Transfer';
    // Add space before capital letters for better readability
    return method
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
      .trim();
  };

  if (loading) return <div className={styles.loadingPage}><Spin size="large" /></div>;
  if (error) return <Alert message="Failed to load account details" type="error" showIcon />;
  if (!accountInfo) return null;

  const student = accountInfo.studentInformation || {};
  const enrolledCoursesData = accountInfo.enrolledCourses || [];
  const outstandingFeesData = accountInfo.outstandingFeesDetails || [];
  const topUpHistoryData = accountInfo.topUpHistory?.items || [];
  const paymentHistoryData = accountInfo.paymentHistory?.items || [];

  // Column definitions
  const enrolledColumns = [
    { 
      title: "Course Name", 
      dataIndex: "courseName", 
      key: "courseName", 
      render: (text, record) => (
        <b 
          style={{ cursor: 'pointer', color: '#1890ff' }}
          onClick={() => {
            const courseId = record.courseId || record.CourseId;
            if (courseId) {
              navigate(`/accounts/${id}/courses/${courseId}`);
            } else {
              console.error('Course ID not found in record:', record);
            }
          }}
        >
          {text}
        </b>
      )
    },
    { title: "Provider", dataIndex: "providerName", key: "providerName" },
    { title: "Billing Cycle", dataIndex: "billingCycle", key: "billingCycle" },
    { title: "Total Fee", dataIndex: "totalFree", key: "totalFree", render: v => `S$${v?.toLocaleString()}` },
    { title: "Enrolled Date", dataIndex: "enrollmentDate", key: "enrollmentDate" },
    { title: "Collected", dataIndex: "collectedFee", key: "collectedFee", render: v => `S$${v?.toLocaleString()}` },
    { title: "Next Payment", dataIndex: "nextPaymentDue", key: "nextPaymentDue" },
    { title: "Payment Status", dataIndex: "paymentStatus", key: "paymentStatus", render: s => <StatusTag status={s} /> },
  ];

  const feesColumns = [
    { title: "Course", dataIndex: "courseName", key: "courseName", render: t => <b>{t}</b> },
    { title: "Provider", dataIndex: "providerName", key: "providerName" },
    { title: "Amount", dataIndex: "outstandingAmount", key: "outstandingAmount", render: v => <b style={{ color: '#d97706' }}>S${v?.toLocaleString()}</b> },
    { title: "Billing Date", dataIndex: "billingDate", key: "billingDate" },
    { title: "Due Date", dataIndex: "dueDate", key: "dueDate" },
  ];

  const topUpColumns = [
    { title: "Date & Time", key: "dateTime", render: (_, r) => `${r.topUpDate} ${r.topUpTime}` },
    { title: "Amount", dataIndex: "amount", key: "amount", render: v => <span style={{ color: '#16a34a', fontWeight: 600 }}>+S${v?.toLocaleString()}</span> },
    { title: "Reference", dataIndex: "reference", key: "reference", render: t => t || '-' },
    { title: "Description", dataIndex: "description", key: "description", render: t => t || '-' },
  ];

  const paymentHistoryColumns = [
    { title: "Course", dataIndex: "courseName", key: "courseName", render: t => <b>{t}</b> },
    { title: "Provider", dataIndex: "providerName", key: "providerName" },
    { title: "Amount Paid", dataIndex: "amountPaid", key: "amountPaid", render: v => <b>S${v?.toLocaleString()}</b> },
    { title: "Payment Date", dataIndex: "paymentDate", key: "paymentDate" },
    { title: "Method", dataIndex: "paymentMethod", key: "paymentMethod", render: m => formatPaymentMethod(m) },
  ];

  return (
    <div className={styles.detailPage}>
      <AccountDetailHeader
        accountInfo={accountInfo}
        onDeactivate={handleDeactivateClick}
        onActivate={handleActivateClick}
        onEdit={handleEditClick}
        isActivating={isActivating}
      />

      <AccountStats
        balance={accountInfo.balance}
        courseCount={accountInfo.courseCount}
        outstandingFees={accountInfo.outstandingFees}
        residentialStatus={student.residentialStatus}
      />

      <AccountInfo student={student} isActive={accountInfo.isActive} />

      <div className={styles.tablesStack}>
        <ConfigurableTable
          title="Enrolled Courses"
          icon={<BookOutlined />}
          columns={enrolledColumns}
          dataSource={enrolledCoursesData}
          rowKey={(r) => r.courseName + r.enrollmentDate}
          pagination={{
            current: enrolledParams.page,
            pageSize: enrolledParams.size,
            total: enrolledCoursesData.length,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            position: ['bottomLeft'],
            onChange: (page, size) => setEnrolledParams({ page, size })
          }}
        />
        <ConfigurableTable
          title="Outstanding Fees"
          icon={<WarningOutlined />}
          columns={feesColumns}
          dataSource={outstandingFeesData}
          rowKey={(r) => r.courseName + r.dueDate}
          pagination={{
            current: outstandingParams.page,
            pageSize: outstandingParams.size,
            total: outstandingFeesData.length,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            position: ['bottomLeft'],
            onChange: (page, size) => setOutstandingParams({ page, size })
          }}
        />
        <ConfigurableTable
          title="Top Up History"
          icon={<CreditCardOutlined />}
          columns={topUpColumns}
          dataSource={topUpHistoryData}
          rowKey={(r) => r.topUpDate + r.topUpTime}
          pagination={{
            current: topUpParams.page,
            pageSize: topUpParams.size,
            total: accountInfo.topUpHistory?.totalCount || 0,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            position: ['bottomLeft'],
            onChange: (page, size) => setTopUpParams({ page, size })
          }}
        />
        <ConfigurableTable
          title="Payment History"
          icon={<WalletOutlined />}
          columns={paymentHistoryColumns}
          dataSource={paymentHistoryData}
          rowKey={(r) => r.paymentDate + r.courseName}
          pagination={{
            current: paymentParams.page,
            pageSize: paymentParams.size,
            total: accountInfo.paymentHistory?.totalCount || 0,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            position: ['bottomLeft'],
            onChange: (page, size) => setPaymentParams({ page, size })
          }}
        />
      </div>

      <DeactivateModal
        open={isDeactivateModalOpen}
        onCancel={handleDeactivateCancel}
        onConfirm={handleDeactivateConfirm}
        loading={isDeactivating}
        accountInfo={accountInfo}
      />

      <EditAccountModal
        open={isEditModalOpen}
        onCancel={handleEditCancel}
        onSave={handleEditSave}
        loading={isSaving}
        accountInfo={accountInfo}
      />
    </div>
  );
};

export default AccountDetail;
