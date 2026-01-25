import React from 'react';
import { Layout } from 'antd';
import EduLogo from '../../assets/icon/EduLogo';
import { SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import styles from './MainHeader.module.scss';

const { Header } = Layout;



const MainHeader = ({ toggleMobile }) => {


  return (
    <Header className={styles.sharedHeader}>
      <div className={styles.headerLeft}>
        {toggleMobile}
        <div className={styles.logoContainer}>
          <EduLogo />
        </div>
        <div className={styles.brandInfo}>
          <h1>EduCredit</h1>
          <span>Education Account System</span>
        </div>
      </div>     
    </Header>
  );
};
export default MainHeader;