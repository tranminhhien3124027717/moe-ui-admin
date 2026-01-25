import React, { useState, useMemo } from "react";
import { Table, Button, Popover, Checkbox } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import styles from "./ConfigurableTable.module.scss";

const ConfigurableTable = ({ title, columns, dataSource, rowKey = "id", icon, pagination = false, onChange, loading = false }) => {
  const [visibleColumns, setVisibleColumns] = useState(columns.map(c => c.key));

  const tableColumns = useMemo(() => {
    return columns.filter(c => visibleColumns.includes(c.key));
  }, [columns, visibleColumns]);

  const handleColumnToggle = (key) => {
    setVisibleColumns(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const columnSettingsContent = (
    <div className={styles.columnSettings}>
      {columns.map(col => (
        <div key={col.key} className={styles.columnOption}>
          <Checkbox 
            checked={visibleColumns.includes(col.key)}
            onChange={() => handleColumnToggle(col.key)}
          >
            {col.title}
          </Checkbox>
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <h3 className={styles.tableTitle}>
          {icon} {title} <span className={styles.count}>({dataSource?.length || 0})</span>
        </h3>
        {/* <Popover 
          content={columnSettingsContent} 
          trigger="click" 
          placement="bottomRight"
          overlayClassName={styles.columnPopover}
        >
          <Button icon={<SettingOutlined />} className={styles.columnBtn}>
            Columns ({visibleColumns.length}/{columns.length})
          </Button>
        </Popover> */}
      </div>
      <div className={styles.tableWrapper}>
        <Table
          columns={tableColumns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={onChange}
          loading={loading}
          rowKey={rowKey}
          className={styles.customTable}
          scroll={{ x: 800 }}
        />
      </div>
    </div>
  );
};

export default ConfigurableTable;
