import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Button,
  Row,
  Col,
  Space,
  notification,
  message,
} from "antd";
import { PlusOutlined, CheckCircleFilled } from "@ant-design/icons";
import styles from "./AccountCreate.module.scss";
import { useAccounts } from "../../../hooks/accounts/useAccount";
import dayjs from "dayjs";

const AccountCreate = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [isVerify, setIsVerify] = useState(false);

  // Giữ nguyên hook gốc của bạn
  const { loading, getAccountNRIC, reset, createAccount } = useAccounts();

  // --- LOGIC GIỮ NGUYÊN (Kèm logic auto-fill mailing address mới) ---
  const handleVerify = async () => {
    try {
      const nric = form.getFieldValue("nric");
      if (!nric) {
        message.error("Please input nric!");
        return; // Thêm return để chặn logic nếu không có nric
      }

      const data = await getAccountNRIC(nric);
      console.log(data);

      // Format phone to show only the number part (without +65)
      let phoneValue = '';
      if (data.phoneNumber) {
        phoneValue = data.phoneNumber.replace(/^\+65\s?/, '').trim();
      }

      // Map dữ liệu về form (Giữ logic cũ + thêm auto-fill mailing)
      form.setFieldsValue({
        fullName: data.fullName,
        dob: data.dateOfBirth ? dayjs(data.dateOfBirth, "YYYY-MM-DD") : null,
        email: data.email,
        phone: phoneValue, // Show only number without +65
        registeredAddress: data.registeredAddress,
        residentialStatus: data.residentialStatus,

        // [YÊU CẦU MỚI] Mailing auto-fill giống Registered
        mailingAddress: data.registeredAddress,
      });

      setIsVerify(true);
    } catch (err) {
      notification.error({
        title: "Verify nric fail!",
        description: err.message,
        placement: "topRight",
        duration: 8,
      });
    }
  };

  const handleReset = () => {
    form.resetFields();
    reset();
    setIsVerify(false);
  };

  const closeHandle = () => {
    handleReset();
    onClose();
  };

  const onFinish = async (values) => {
    try {
      // Add +65 prefix to phone
      const phoneWithPrefix = values.phone ? `+65${values.phone}` : '';
      
      // Payload giữ nguyên cấu trúc logic backend của bạn
      const payload = {
        nric: values.nric,
        fullName: values.fullName,
        dateOfBirth: values.dob,
        email: values.email,
        contactNumber: phoneWithPrefix, // Add +65 prefix
        // educationLevel: values.educationLevel, // Đã bỏ theo yêu cầu
        registeredAddress: values.registeredAddress,
        mailingAddress: values.mailingAddress,
        residentialStatus: values.residentialStatus,
      };

      const res = await createAccount(payload);
      notification.success({
        title: "Add new Account Success...",
        description: res.message,
        placement: "topRight",
        duration: 8,
      });

      handleReset();
      onClose?.();
    } catch (err) {
      console.log("Error:", err);
      notification.error({
        title: "Add new Account fail!",
        description: err.response?.data?.errorMessage || err?.errorMessage || err?.message || "An error occurred while creating the account",
        placement: "topRight",
        duration: 8,
      });
    }
  };

  // --- PHẦN GIAO DIỆN (UI) ĐƯỢC LÀM MỚI ---
  return (
    <Modal
      open={open}
      onCancel={closeHandle}
      footer={null}
      width={700}
      centered
      className={styles.addStudentModal}
      destroyOnClose
    >
      <div className={styles.header}>
        <h2>Add New Account</h2>
        <p>
          Enter NRIC/FIN to retrieve student information from the national database.
          Fields will be enabled after NRIC/FIN verification.
        </p>
      </div>

      <Form
        layout="vertical"
        form={form}
        className={styles.form}
        onFinish={onFinish}
      >
        {/* Hàng 1: NRIC và Full Name */}
        <Row gutter={20}>
          <Col span={12}>
            <Form.Item
              label="NRIC/FIN"
              name="nric"
              rules={[{ required: true, message: "Please input NRIC/FIN!" }]}
            >
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  placeholder="S1234567A"
                  disabled={isVerify}
                  className={styles.nricInput}
                />
                {!isVerify ? (
                  <Button type="primary" onClick={handleVerify} className={styles.verifyBtn}>
                    Verify
                  </Button>
                ) : (
                  <Button className={styles.resetBtn} onClick={handleReset}>
                    Reset
                  </Button>
                )}
              </Space.Compact>
            </Form.Item>
            {isVerify && <span className={styles.verifiedTag}><CheckCircleFilled /> Verified</span>}
          </Col>

          <Col span={12}>
            <Form.Item 
              label="Full Name" 
              name="fullName"
              rules={[{ required: true, message: "Please input name" }]}
              required
            >
              <Input
                placeholder="Auto-filled from NRIC/FIN"
                disabled={true}
                className={styles.lockedInput}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Hàng 2: DOB và Email */}
        <Row gutter={20}>
          <Col span={12}>
            <Form.Item 
              label="Date of Birth" 
              name="dob"
              rules={[{ required: true, message: "Please input date of birth" }]}
              required
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="DD/MM/YYYY"
                format="DD/MM/YYYY"
                disabled={true}
                className={styles.lockedInput}
                inputReadOnly
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Email is required" },
                { type: 'email', message: "Invalid email" },
                { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: "Please enter a valid email with full domain (e.g., user@example.com)" }
              ]}
              required
            >
              <Input
                placeholder="email@example.com"
                disabled={!isVerify}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Hàng 3: Phone và Residential Status */}
        <Row gutter={20}>
          <Col span={12}>
            <Form.Item 
              label="Phone Number" 
              name="phone"
              rules={[
                { required: true, message: "Please input phone number!" },
                { pattern: /^[689]\d{7}$/, message: "Please enter valid 8-digit number starting with 6, 8, or 9" }
              ]}
              required
            >
              <Input
                addonBefore="+65"
                placeholder="8XXXXXXX"
                disabled={!isVerify}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              label="Residential Status" 
              name="residentialStatus"
              rules={[{ required: true, message: "Please input residential status!" }]}
              required
            >
              <Input
                placeholder="Auto-filled status"
                disabled={true}
                className={styles.lockedInput}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Registered Address */}
        <Form.Item 
          label="Registered Address" 
          name="registeredAddress"
          rules={[{ required: true, message: "Please input registered address!" }]}
          required
        >
          <Input
            placeholder="Auto-filled from NRIC"
            disabled={!isVerify}
          />
        </Form.Item>

        {/* Mailing Address */}
        <Form.Item
          label="Mailing Address"
          name="mailingAddress"
          rules={[
            isVerify && { required: true, message: "Please input mailing address!" },
          ].filter(Boolean)}
          required
        >
          <Input
            placeholder="Auto-filled same as Registered Address"
            disabled={!isVerify}
          />
        </Form.Item>

        {/* Footer Buttons */}
        <div className={styles.footer}>
          <Button onClick={closeHandle} className={styles.cancelBtn}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            icon={<PlusOutlined />}
            className={styles.createBtn}
            loading={loading}
            disabled={!isVerify}
          >
            Create Account
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AccountCreate;
