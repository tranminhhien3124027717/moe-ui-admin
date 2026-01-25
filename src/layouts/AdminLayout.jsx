import React, { useState } from 'react';
import { Layout, Drawer, Button } from 'antd';
import { Outlet } from 'react-router-dom';
import { MenuOutlined ,CloseOutlined} from '@ant-design/icons';
import SharedHeader from './Header/MainHeader';
import AdminSidebar from './Sidebar/Sidebar';
import styles from './index.module.scss';


const { Sider, Content } = Layout;

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Layout className={styles.appLayoutMain}>
      <SharedHeader
        toggleMobile={
          <div className={styles.mobileToggleBtn} onClick={() => setMobileOpen(true)}>
            <MenuOutlined />
          </div>
        }
      />

      <Layout className={styles.layoutContentWrapper}>
        {/* Sidebar cứng cho Desktop */}
        <Sider width={300} theme="light" trigger={null} className={styles.layoutSider}>
          <AdminSidebar />
        </Sider>

        {/* Drawer trượt cho Mobile */}
        <Drawer
          open={mobileOpen}
          placement="left"
          onClose={() => setMobileOpen(false)}
          size={280} 
          className={styles.responsiveDrawer}
          styles={{ body: { padding: 0 } }}
          closeIcon={<CloseOutlined style={{ fontSize: 20, color: '#64748b' }} />}
          title={<span style={{ fontWeight: 700, fontSize: 16 }}>Menu</span>}
        >
          <AdminSidebar onClose={() => setMobileOpen(false)} />
        </Drawer>

        <Content className={styles.layoutContent}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
export default AdminLayout;