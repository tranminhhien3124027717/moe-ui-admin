import React, { useEffect } from "react";
import { Modal, Form, Input, DatePicker, Select, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "./EditAccountModal.module.scss";

const EditAccountModal = ({ open, onCancel, onSave, accountInfo, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && accountInfo) {
      const student = accountInfo.studentInformation || {};
      // Format phone to show only the number part (without +65)
      let phoneValue = '';
      if (student.contactNumber) {
        phoneValue = student.contactNumber.replace(/^\+65\s?/, '').trim();
      }
      form.setFieldsValue({
        fullName: accountInfo.fullName,
        nric: accountInfo.nric,
        dateOfBirth: student.dateOfBirth ? dayjs(student.dateOfBirth, "DD/MM/YYYY") : null,
        email: student.email,
        phone: phoneValue,
        registeredAddress: student.registeredAddress,
        mailingAddress: student.mailingAddress,
        educationLevel: student.educationLevel,
      });
    }
  }, [open, accountInfo, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Add +65 prefix to phone if it has a value
      const phoneWithPrefix = values.phone ? `+65${values.phone}` : '';
      // Format date for API and ensure educationLevel is included
      const formattedValues = {
        email: values.email,
        phone: phoneWithPrefix,
        registeredAddress: values.registeredAddress,
        mailingAddress: values.mailingAddress,
        educationLevel: values.educationLevel,
      };
      onSave(formattedValues);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      closeIcon={<CloseOutlined />}
      centered
      width={760}
      className={styles.editModal}
    >
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Edit Student Information</h2>

        <Form
          form={form}
          layout="vertical"
          className={styles.editForm}
          requiredMark={true}
        >
          <div className={styles.formRow}>
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[{ required: true, message: "Please enter full name" }]}
            >
              <Input placeholder="Enter full name" size="large" disabled />
            </Form.Item>

            <Form.Item
              label="NRIC/FIN"
              name="nric"
              rules={[{ required: true, message: "Please enter NRIC/FIN" }]}
            >
              <Input placeholder="Enter NRIC/FIN" size="large" disabled />
            </Form.Item>
          </div>

          <div className={styles.formRow}>
            <Form.Item
              label="Date of Birth"
              name="dateOfBirth"
              rules={[{ required: true, message: "Please select date of birth" }]}
            >
              <DatePicker
                placeholder="Select date"
                size="large"
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                disabled
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter valid email" }
              ]}
            >
              <Input placeholder="Enter email address" size="large" />
            </Form.Item>
          </div>

          <div className={styles.formRow}>
            <Form.Item
              label="Phone"
              name="phone"
              rules={[
                { pattern: /^[689]\d{7}$/, message: "Please enter valid 8-digit number starting with 6, 8, or 9" }
              ]}
            >
              <Input addonBefore="+65" placeholder="8XXXXXXX" size="large" />
            </Form.Item>

            <Form.Item
              label="Education Level"
              name="educationLevel"
            >
              <Select
                placeholder="Select education level"
                size="large"
                options={[
                  { value: "Primary", label: "Primary" },
                  { value: "Secondary", label: "Secondary" },
                  { value: "Post-Secondary", label: "Post-Secondary" },
                  { value: "Tertiary", label: "Tertiary" },
                  { value: "Postgraduate", label: "Postgraduate" },
                ]}
                disabled
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Registered Address"
            name="registeredAddress"
          >
            <Input.TextArea
              placeholder="Enter registered address"
              rows={2}
              style={{ resize: "none" }}
            />
          </Form.Item>

          <Form.Item
            label="Mailing Address"
            name="mailingAddress"
          >
            <Input.TextArea
              placeholder="Enter mailing address"
              rows={2}
              style={{ resize: "none" }}
            />
          </Form.Item>
        </Form>

        <div className={styles.modalFooter}>
          <Button
            size="large"
            onClick={onCancel}
            className={styles.cancelBtn}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleSubmit}
            className={styles.saveBtn}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditAccountModal;
