import React from "react";
import { Table } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "./CourseTable.module.scss";

console.log('CourseTable module loaded');

const CourseTable = ({ 
  loading, 
  dataSource, 
  pagination, 
  onTableChange 
}) => {
  console.log('CourseTable component rendering', { loading, dataSourceLength: dataSource?.length });
  const navigate = useNavigate();
  
  // Debug: Check if dataSource has data
  React.useEffect(() => {
    console.log('CourseTable dataSource:', dataSource);
  }, [dataSource]);
  
  const columns = [
    {
      title: 'Course Code',
      dataIndex: 'courseCode',
      key: 'courseCode',
      className: styles.columnCourseId,
      width: 120,
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Course Name',
      dataIndex: 'courseName',
      key: 'courseName',
      className: styles.columnCourseName,
      sorter: true,
      width: 220,
      fixed: 'left',
      render: (text) => <span className={styles.courseNameText}>{text}</span>
    },
    {
      title: 'Provider',
      dataIndex: 'provider',
      key: 'provider',
      className: styles.columnProvider,
      sorter: true,
      width: 180,
      render: (text) => <span className={styles.providerText}>{text}</span>
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      className: styles.columnDate,
      sorter: true,
      width: 110,
      render: (text) => <span>{text}</span>
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      className: styles.columnDate,
      sorter: true,
      width: 110,
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Payment Type',
      dataIndex: 'paymentType',
      key: 'paymentType',
      className: styles.columnPaymentType,
      width: 130,
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Cycle',
      dataIndex: 'billingCycle',
      key: 'billingCycle',
      className: styles.columnBillingCycle,
      width: 100,
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Fee',
      dataIndex: 'totalFee',
      key: 'totalFee',
      className: styles.columnTotalFee,
      sorter: true,
      align: 'right',
      width: 100,
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Mode',
      dataIndex: 'mode',
      key: 'mode',
      className: styles.columnMode,
      width: 120,
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Enrolled',
      dataIndex: 'enrolled',
      key: 'enrolled',
      className: styles.columnEnrolled,
      align: 'right',
      width: 100,
      render: (text) => <span>{text || 0}</span>
    },
  ];

  return (
    <div className={styles.tableSection}>
      <Table
        loading={loading}
        dataSource={dataSource}
        columns={columns}
        rowKey="courseCode"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total, range) => (
            <span className={styles.paginationTotal}>
              {range[0]}-{range[1]} of {total}
            </span>
          ),
          position: ['bottomLeft'],
        }}
        onChange={onTableChange}
        className={styles.courseTable}
        scroll={{ x: 1300 }}
        onRow={(record) => ({
          onClick: () => navigate(`/courses/${record.courseId}`),
        })}
      />
    </div>
  );
};

export default CourseTable;