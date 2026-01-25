import React, { useState } from 'react';
import { Button, Form, Input, message, Checkbox, Typography } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import EduLogo from '../../assets/icon/EduLogo.jsx';
import styles from './LoginPage.module.scss';
import authService from '../../services/authService';

const { Title, Text } = Typography;

const LoginPage = () => {
  /* ==========================================================================
     HOOKS & STATE
     ========================================================================== */
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  /* ==========================================================================
     HANDLE LOGIN SUBMISSION
     - Adapted for Cookie-based Authentication (HttpOnly).
     - Frontend does not handle tokens directly.
     - Uses a "Flag" strategy to manage UI state.
     ========================================================================== */
  const handleLogin = async (values) => {
    setLoading(true);
    try {

      const response = await authService.login({
        username: values.username,
        password: values.password
      });


      if (response && response.success) {       
        localStorage.setItem('isAdminLoggedIn', 'true');
        message.success('Login successful! Redirecting...');
        navigate('/'); 

      } else {
        message.warning(response.message || 'Login failed. Please check your credentials.');
      }

    } catch (error) {
      console.error("Admin Login Error:", error);
      
      // 4. Error Handling Strategy
      let errorMsg = 'An unexpected error occurred.';
      
      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 401: 
            errorMsg = 'Invalid admin credentials.'; 
            break;
          case 403: 
            errorMsg = 'Access Forbidden. Your account is not authorized.'; 
            break;
          case 500: 
            errorMsg = 'Server Error. Please contact technical support.'; 
            break;
          default: 
            errorMsg = data?.message || `Error ${status}`;
        }
      } else if (error.request) {
        errorMsg = 'Network Error. Please check your connection.';
      }
      
      message.error(errorMsg);

    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================================
     RENDER UI
     ========================================================================== */
  return (
    <div className={styles.loginContainer}>
      
      {/* -------------------------------------------------------------------------
          LEFT PANEL: Admin Branding & Visuals
      -------------------------------------------------------------------------- */}
      <div className={styles.leftPanel}>
        <div className={styles.brandOverlay}>
          <div className={styles.brandContent}>
            <div className={styles.logoBadge}>
              <SafetyCertificateOutlined style={{ fontSize: 20 }} />
              <span>Admin Portal</span>
            </div>

            <Title level={1} className={styles.heroTitle}>
              Centralized <br />
              <span className={styles.highlight}>Education Management</span>
            </Title>

            <Text className={styles.heroSubtitle}>
              Secure access for administrators to manage student accounts, process fees, and oversee system operations.
            </Text>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------------
          RIGHT PANEL: Authentication Form
      -------------------------------------------------------------------------- */}
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          
          {/* Header Section */}
          <div className={styles.formHeader}>
            <div className={styles.mobileLogo} onClick={() => navigate('/')}>
              <EduLogo width={48} height={48} />
            </div>
            <Title level={2} className={styles.welcomeTitle}>Admin Sign In</Title>
            <Text className={styles.welcomeSub}>Enter your credentials to access the dashboard.</Text>
          </div>

          {/* Login Form */}
          <Form
            name="admin_login"
            className={styles.loginForm}
            initialValues={{ remember: true }}
            onFinish={handleLogin}
            layout="vertical"
            size="large"
          >
            {/* Username Field */}
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Admin ID / Username is required!' }]}
            >
              <Input
                prefix={<UserOutlined className={styles.fieldIcon} />}
                placeholder="Admin ID"
                className={styles.customInput}
              />
            </Form.Item>

            {/* Password Field */}
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Password is required!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className={styles.fieldIcon} />}
                placeholder="Password"
                className={styles.customInput}
              />
            </Form.Item>

            {/* Remember Me Checkbox */}
            <div className={styles.formActions}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className={styles.customCheckbox}>Keep me logged in</Checkbox>
              </Form.Item>
            </div>

            {/* Submit Button */}
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className={styles.submitButton} 
                loading={loading} 
                block
              >
                Access Dashboard <LoginOutlined />
              </Button>
            </Form.Item>

          </Form>
          
          {/* Security Warning Footer */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
             <Text type="secondary" style={{ fontSize: 12 }}>
                Authorized Personnel Only. <br/> 
                Unauthorized access is a punishable offense.
             </Text>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;