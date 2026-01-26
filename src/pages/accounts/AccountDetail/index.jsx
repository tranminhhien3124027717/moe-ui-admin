import React, { useEffect, useState, useCallback } from "react";
import { Spin, Alert, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import {
  BookOutlined,
  WarningOutlined,
  CreditCardOutlined,
  WalletOutlined
} from "@ant-design/icons";
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
  
  // Account detail state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accountInfo, setAccountInfo] = useState(null);

  // Enrolled courses state
  const [enrolledCoursesData, setEnrolledCoursesData] = useState([]);
  const [enrolledCoursesTotal, setEnrolledCoursesTotal] = useState(0);
  const [enrolledCoursesLoading, setEnrolledCoursesLoading] = useState(false);
  const [enrolledCoursesParams, setEnrolledCoursesParams] = useState({ pageNumber: 1, pageSize: 5 });

  // Outstanding fees state
  const [outstandingFeesData, setOutstandingFeesData] = useState([]);
  const [outstandingFeesTotal, setOutstandingFeesTotal] = useState(0);
  const [outstandingFeesLoading, setOutstandingFeesLoading] = useState(false);
  const [outstandingFeesParams, setOutstandingFeesParams] = useState({ pageNumber: 1, pageSize: 5 });

  // Top-up history state
  const [topUpHistoryData, setTopUpHistoryData] = useState([]);
  const [topUpHistoryTotal, setTopUpHistoryTotal] = useState(0);
  const [topUpHistoryLoading, setTopUpHistoryLoading] = useState(false);
  const [topUpParams, setTopUpParams] = useState({ pageNumber: 1, pageSize: 5 });

  // Payment history state
  const [paymentHistoryData, setPaymentHistoryData] = useState([]);
  const [paymentHistoryTotal, setPaymentHistoryTotal] = useState(0);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);
  const [paymentParams, setPaymentParams] = useState({ pageNumber: 1, pageSize: 5 });

  // Modal states
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  // Fetch account detail
  const fetchAccountDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await accountService.getAccountById(id);
      setAccountInfo(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch enrolled courses
  const fetchEnrolledCourses = useCallback(async () => {
    if (!id) return;
    setEnrolledCoursesLoading(true);
    try {
      const res = await accountService.getEnrolledCourses(id, enrolledCoursesParams);
      setEnrolledCoursesData(res.data?.items || []);
      setEnrolledCoursesTotal(res.data?.totalCount || 0);
    } catch (err) {
      console.error('Failed to fetch enrolled courses:', err);
    } finally {
      setEnrolledCoursesLoading(false);
    }
  }, [id, enrolledCoursesParams]);

  // Fetch outstanding fees
  const fetchOutstandingFees = useCallback(async () => {
    if (!id) return;
    setOutstandingFeesLoading(true);
    try {
      const res = await accountService.getOutstandingFees(id, outstandingFeesParams);
      setOutstandingFeesData(res.data?.items || []);
      setOutstandingFeesTotal(res.data?.totalCount || 0);
    } catch (err) {
      console.error('Failed to fetch outstanding fees:', err);
    } finally {
      setOutstandingFeesLoading(false);
    }
  }, [id, outstandingFeesParams]);

  // Fetch top-up history
  const fetchTopUpHistory = useCallback(async () => {
    if (!id) return;
    setTopUpHistoryLoading(true);
    try {
      const res = await accountService.getTopUpHistory(id, topUpParams);
      setTopUpHistoryData(res.data?.items || []);
      setTopUpHistoryTotal(res.data?.totalCount || 0);
    } catch (err) {
      console.error('Failed to fetch top-up history:', err);
    } finally {
      setTopUpHistoryLoading(false);
    }
  }, [id, topUpParams]);

  // Fetch payment history
  const fetchPaymentHistory = useCallback(async () => {
    if (!id) return;
    setPaymentHistoryLoading(true);
    try {
      const res = await accountService.getPaymentHistory(id, paymentParams);
      setPaymentHistoryData(res.data?.items || []);
      setPaymentHistoryTotal(res.data?.totalCount || 0);
    } catch (err) {
      console.error('Failed to fetch payment history:', err);
    } finally {
      setPaymentHistoryLoading(false);
    }
  }, [id, paymentParams]);

  // Initial load - fetch all data in parallel
  useEffect(() => {
    if (id) {
      fetchAccountDetail();
      fetchEnrolledCourses();
      fetchOutstandingFees();
      fetchTopUpHistory();
      fetchPaymentHistory();
    }
  }, [id]);

  // Fetch enrolled courses when params change
  useEffect(() => {
    if (id && enrolledCoursesParams.pageNumber > 0) {
      fetchEnrolledCourses();
    }
  }, [enrolledCoursesParams]);

  // Fetch outstanding fees when params change
  useEffect(() => {
    if (id && outstandingFeesParams.pageNumber > 0) {
      fetchOutstandingFees();
    }
  }, [outstandingFeesParams]);

  // Fetch top-up history when params change
  useEffect(() => {
    if (id && topUpParams.pageNumber > 0) {
      fetchTopUpHistory();
    }
  }, [topUpParams]);

  // Fetch payment history when params change
  useEffect(() => {
    if (id && paymentParams.pageNumber > 0) {
      fetchPaymentHistory();
    }
  }, [paymentParams]);

  const handleDeactivateClick = () => {
    setIsDeactivateModalOpen(true);
  };

  const handleActivateClick = async () => {
    setIsActivating(true);
    try {
      await accountService.activateAccount(id);
      message.success('Account activated successfully');
      await fetchAccountDetail();
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
      await fetchAccountDetail();
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
      await fetchAccountDetail();
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
          loading={enrolledCoursesLoading}
          pagination={{
            current: enrolledCoursesParams.pageNumber,
            pageSize: enrolledCoursesParams.pageSize,
            total: enrolledCoursesTotal,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            position: ['bottomLeft'],
            onChange: (page, size) => setEnrolledCoursesParams({ pageNumber: page, pageSize: size })
          }}
        />
        <ConfigurableTable
          title="Outstanding Fees"
          icon={<WarningOutlined />}
          columns={feesColumns}
          dataSource={outstandingFeesData}
          rowKey={(r) => r.courseName + r.dueDate}
          loading={outstandingFeesLoading}
          pagination={{
            current: outstandingFeesParams.pageNumber,
            pageSize: outstandingFeesParams.pageSize,
            total: outstandingFeesTotal,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            position: ['bottomLeft'],
            onChange: (page, size) => setOutstandingFeesParams({ pageNumber: page, pageSize: size })
          }}
        />
        <ConfigurableTable
          title="Top Up History"
          icon={<CreditCardOutlined />}
          columns={topUpColumns}
          dataSource={topUpHistoryData}
          rowKey={(r) => r.topUpDate + r.topUpTime}
          loading={topUpHistoryLoading}
          pagination={{
            current: topUpParams.pageNumber,
            pageSize: topUpParams.pageSize,
            total: topUpHistoryTotal,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            position: ['bottomLeft'],
            onChange: (page, size) => setTopUpParams({ pageNumber: page, pageSize: size })
          }}
        />
        <ConfigurableTable
          title="Payment History"
          icon={<WalletOutlined />}
          columns={paymentHistoryColumns}
          dataSource={paymentHistoryData}
          rowKey={(r) => r.paymentDate + r.courseName}
          loading={paymentHistoryLoading}
          pagination={{
            current: paymentParams.pageNumber,
            pageSize: paymentParams.pageSize,
            total: paymentHistoryTotal,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            position: ['bottomLeft'],
            onChange: (page, size) => setPaymentParams({ pageNumber: page, pageSize: size })
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
