import React from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import styles from "./CourseHeader.module.scss";

const CourseHeader = ({ onAddCourse }) => {
  return (
    <div className={styles.topHeader}>
      <div>
        <h1 className={styles.pageTitle}>Course Management</h1>
        <p className={styles.pageSubtitle}>Manage all courses</p>
      </div>
      <div className={styles.actionButtons}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className={styles.addBtn}
          onClick={onAddCourse}
        >
          Add Course
        </Button>
      </div>
    </div>
  );
};

export default CourseHeader;
