import React from "react";
import { Table } from "antd";
import { ReadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { formatStatus } from "../../../../utils/formatters";
import styles from "./AccountTable.module.scss";

const AccountTable = ({ data, loading, filter, total, changePage, updateSort }) => {
  const navigate = useNavigate();

  const handleTableChange = (pagination, filters, sorter) => {
    if (sorter.columnKey) {
      updateSort(sorter.columnKey, sorter.order);
    } else {
      updateSort(null, null);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: true,
      width: '18%',
      render: (text) => <span className={styles.colName}>{text}</span>
    },
    {
      title: 'NRIC/FIN',
      dataIndex: 'nric',
      key: 'nric',
      width: '12%',
      render: (text) => <span className={styles.colNric}>{text}</span>
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      sorter: true,
      width: '8%',
      render: (text) => <span className={styles.colText}>{text}</span>
    },
    {
      title: 'Education',
      dataIndex: 'educationLevel',
      key: 'educationLevel',
      sorter: true,
      width: '15%',
      render: (text) => <span className={styles.colEducation}>{formatStatus(text)}</span>
    },
    {
      title: 'Residential Status',
      dataIndex: 'residentialStatus',
      key: 'residentialStatus',
      width: '15%',
      render: (text) => <span className={styles.colStatus}>{formatStatus(text)}</span>
    },
    {
      title: 'Created',
      key: 'created',
      sorter: true,
      width: '12%',
      render: (_, record) => (
        <div className={styles.colDateGroup}>
          <span className={styles.date}>{record.createdDate || '-'}</span>
          <span className={styles.time}>{record.createTime || ''}</span>
        </div>
      )
    },
    {
      title: 'Courses',
      dataIndex: 'courseCount',
      key: 'courseCount',
      width: '10%',
      render: (count) => (
        <span className={styles.colCourses}>
          <ReadOutlined /> {count}
        </span>
      )
    }
  ];

  return (
    <div className={styles.tableWrapper}>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        scroll={{ x: 1000 }}
        pagination={{
          current: filter.pageNumber,
          pageSize: filter.pageSize,
          total,
          onChange: changePage,
          showSizeChanger: true
        }}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => navigate(`/accounts/${record.id}`),
        })}
        onChange={handleTableChange}
        className={styles.customTable}
      />
    </div>
  );
};

export default AccountTable;
