import React from 'react';
import { Menu, Modal } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogoutOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { ADMIN_MENU, getSelectedKey } from '../../utils/menuItems';
import styles from './Sidebar.module.scss';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();


  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/login');
  };

  return (
    <div className={styles.adminSidebarContainer}>
      {/* 1. Profile Section */}
      <div className={styles.profileSection}>
        <div className={styles.profileCard}>
          <div className={styles.avatar}>A</div>
          <div className={styles.info}>
            <span className={styles.name}>Admin User</span>
            <span className={styles.role}>Administrator</span>
          </div>
        </div>
      </div>

      {/* 2. Menu Items */}
      <div className={styles.menuWrapper}>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey(location.pathname)]}
          items={ADMIN_MENU.map(i => ({
            ...i,
            label: <Link to={i.key} onClick={onClose}>{i.label}</Link>
          }))}
          className={styles.adminMenu}
        />
      </div>

      {/* 3. Footer Section    */}
      <div className={styles.footerSection}>
        <div className={styles.logoutBtn} onClick={handleLogout}>
          <LogoutOutlined className={styles.icon} />
          <span className={styles.text}>Log out</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;