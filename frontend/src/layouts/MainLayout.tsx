import React from 'react';
import { Layout, Menu, Button, Space, Tag, Dropdown } from 'antd';
import {
  RocketOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  HomeOutlined,
  BookOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { authService } from '../services/auth';
import { QuickSearch } from '../components/QuickSearch';

const { Header, Content, Footer } = Layout;

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();

  const handleLogout = () => {
    authService.logout();
  };

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'หน้าหลัก',
    },
    {
      key: '/procedures',
      icon: <BookOutlined />,
      label: 'คู่มือทั้งหมด',
    },
  ];

  if (user) {
    menuItems.push({
      key: '/admin',
      icon: <SettingOutlined />,
      label: isAdmin ? 'ระบบจัดการ (Admin)' : 'ระบบจัดการ',
    });
  }

  const userMenuItems = [
    {
      key: 'user-info',
      disabled: true,
      label: (
        <div>
          <strong>{user?.displayName}</strong>
          <div style={{ fontSize: 11, color: '#888' }}>
            สถานะ: {user?.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'พนักงานทั่วไป (User)'}
          </div>
        </div>
      ),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'ออกจากระบบ',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header
        style={{
          background: '#fff',
          padding: '0 16px',
          boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 1440,
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
            gap: 12,
          }}
        >
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: 15,
              color: '#1677ff',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              marginRight: 8,
            }}
          >
            <RocketOutlined style={{ fontSize: 20, marginRight: 6 }} />
            <span className="brand-text">ASIATHAI FREIGHT SOP</span>
          </div>

          {/* Flexible Menu Container for Ant Design Auto-Ellipsis Overflow */}
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={({ key }) => navigate(key)}
              style={{ borderBottom: 'none' }}
              overflowedIndicator={<EllipsisOutlined style={{ fontSize: 16 }} />}
            />
          </div>

          {/* Right Controls */}
          <Space size="small" align="center" style={{ flexShrink: 0 }}>
            <QuickSearch style={{ width: 170 }} />

            {user ? (
              <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                <Button size="small" type="default" icon={<UserOutlined />}>
                  <span style={{ marginRight: 4 }}>{user.username}</span>
                  <Tag color={user.role === 'admin' ? 'gold' : 'blue'} style={{ marginRight: 0, fontSize: 10 }}>
                    {user.role}
                  </Tag>
                </Button>
              </Dropdown>
            ) : (
              <Button
                type="primary"
                size="small"
                icon={<UserOutlined />}
                onClick={() => navigate('/login')}
              >
                เข้าสู่ระบบจัดการ
              </Button>
            )}
          </Space>
        </div>
      </Header>

      <Content style={{ padding: '16px', maxWidth: 1440, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', color: '#8c8c8c', fontSize: 12, padding: '16px 20px' }}>
        Asiathai Freight SOP Management System © 2026 • Single Source of Truth for Logistics & Customs Clearance
      </Footer>
    </Layout>
  );
};
