import React from "react";
import { Table, Tag, Pagination } from "antd";
import dayjs from "dayjs";
import StatusTag from "../../../components/common/StatusTag/StatusTag";
import styles from "./TopUpsTable.module.scss";
import { TeamOutlined, UserOutlined } from "@ant-design/icons";
import { topupStatus } from "../../../utils/responseData";

const TopUpsTable = ({
  data,
  loading,
  filter,
  total,
  changePage,
  updateSort,
  onRowClick,
}) => {
  const handleTableChange = (_, __, sorter, extra) => {
    // Only update sort when a sort action actually occurs (not from pagination)
    if (extra?.action === 'sort' && sorter && sorter.columnKey) {
      updateSort(sorter.columnKey, sorter.order);
    }
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = dayjs(dateString);
    return date.isSame(dayjs(), "day");
  };

  const getTypeLabel = (type) => {
    return type === 0 ? "Batch" : "Individual";
  };

  const getTypeColor = (type) => {
    return type === 0 ? "#162f69" : "#1a7f72";
  };

  const formatAmount = (amount) => {
    if (!amount) return "S$0";
    return `S$${parseFloat(amount).toLocaleString("en-US")}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return { date: "-", time: "" };

    // Parse the UTC date and add 7 hours for UTC+7
    const dateObj = dayjs(dateString).add(7, "hour");
    if (!dateObj.isValid()) return { date: "-", time: "" };

    const date = dateObj.format("DD/MM/YYYY");
    const time = dateObj.format("hh:mm A");

    return { date, time };
  };

  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: "10%",
      sorter: true,
      render: (type) => (
        <Tag color={getTypeColor(type)} className={styles.typeTag}>
          {type === 0 ? <TeamOutlined /> : <UserOutlined />}{" "}
          <b>{getTypeLabel(type) || "-"}</b>
        </Tag>
      ),
    },
    {
      title: "Name",
      dataIndex: "ruleName",
      key: "name",
      width: "20%",
      sorter: true,
      render: (_, record) => {
        const name =
          record.type === 0 ? record.ruleName : record.targetAccountHolderName;
        const nric = record.type === 0 ? null : record.targetAccountHolderNric;
        const isNew = isToday(record.createdDate);

        return (
          <div className={styles.nameColumn}>
            <div className={styles.nameRow}>
              <span className={styles.colName}>{name || "-"}</span>
              {isNew && (
                <Tag color="warning" className={styles.newTag}>
                  New
                </Tag>
              )}
            </div>
            {nric && <div className={styles.nric}>{nric}</div>}
          </div>
        );
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: "12%",
      sorter: true,
      render: (amount) => (
        <span className={styles.colAmount}>{formatAmount(amount) || "-"}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "12%",
      sorter: true,
      render: (status) => <StatusTag status={topupStatus[status] ?? "-"} />,
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      width: "12%",
      render: (text) => <span className={styles.colText}>{text || "-"}</span>,
    },
    {
      title: "Scheduled Date",
      key: "scheduledTime",
      width: "13%",
      sorter: true,
      render: (_, record) => {
        const { date, time } = formatDateTime(record.scheduledTime);
        return (
          <div className={styles.colDateGroup}>
            <span className={styles.date}>{date}</span>
            <span className={styles.time}>{time}</span>
          </div>
        );
      },
    },
    {
      title: "Created Date",
      key: "createdDate",
      width: "13%",
      sorter: true,
      render: (_, record) => {
        const { date, time } = formatDateTime(record.createdDate);
        return (
          <div className={styles.colDateGroup}>
            <span className={styles.date}>{date}</span>
            <span className={styles.time}>{time}</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.paginationWrapper}>
        <span className={styles.rowPerPageLabel}>Row per page:</span>
        <select
          value={filter.PageSize}
          onChange={(e) => changePage(1, parseInt(e.target.value))}
          className={styles.rowPerPageSelect}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={false}
        rowKey={(record, index) => `${filter.PageNumber}-${record.id}-${index}`}
        onRow={(record) => ({
          onClick: () => onRowClick?.(record),
          style: { cursor: "pointer" },
        })}
        onChange={handleTableChange}
        className={styles.customTable}
      />

      <div className={styles.paginationBottom}>
        <Pagination
          current={filter.PageNumber}
          pageSize={filter.PageSize}
          total={total}
          onChange={(page, pageSize) => changePage(page, pageSize)}
          showSizeChanger={false}
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
        />
      </div>
    </div>
  );
};

export default TopUpsTable;
