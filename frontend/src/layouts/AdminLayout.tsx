import React, { useState } from 'react';
import { Layout, Menu, Typography, Button } from 'antd';
import {
  CompassOutlined,
  TeamOutlined,
  AppstoreOutlined,
  BookOutlined,
  PlusCircleOutlined,
  ArrowLeftOutlined,
  UserSwitchOutlined,
  SettingOutlined,
  UserOutlined,
  FolderOutlined,
  BankOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { authService } from '../services/auth';
import { useTheme } from '../contexts/ThemeContext';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, primaryColor } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = authService.isAdmin();

  const menuItems = [
    {
      key: '/admin/procedures',
      icon: <BookOutlined />,
      label: 'จัดการคู่มือทั้งหมด',
    },
    {
      key: '/admin/procedures/new',
      icon: <PlusCircleOutlined />,
      label: 'สร้างคู่มือใหม่',
    },
    {
      type: 'divider' as const,
    },
    {
      key: '/admin/categories',
      icon: <FolderOutlined />,
      label: 'หมวดหมู่ (Categories)',
    },
    {
      key: '/admin/gov-agencies',
      icon: <BankOutlined />,
      label: 'หน่วยงานราชการ (Gov Agencies)',
    },
    {
      key: '/admin/ports',
      icon: <CompassOutlined />,
      label: 'จัดการท่าเรือ (Ports)',
    },
    {
      key: '/admin/agents',
      icon: <TeamOutlined />,
      label: 'จัดการสายเรือ (Agents)',
    },
    {
      key: '/admin/work-types',
      icon: <AppstoreOutlined />,
      label: 'ประเภทงาน (Work Types)',
    },
    {
      key: '/admin/roles',
      icon: <UserSwitchOutlined />,
      label: 'ผู้รับผิดชอบ (Roles)',
    },
    ...(isAdmin
      ? [
          {
            key: '/admin/users',
            icon: <UserOutlined />,
            label: 'จัดการผู้ใช้งาน (Users)',
          },
        ]
      : []),
  ];

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <a onClick={() => navigate('/')} style={{ fontSize: 12.5 }}>
          <ArrowLeftOutlined style={{ marginRight: 6 }} /> กลับสู่หน้าผู้ใช้งาน (User Manual)
        </a>
      </div>

      <Layout
        style={{
          background: isDarkMode ? '#1a1d21' : '#fff',
          borderRadius: 8,
          overflow: 'hidden',
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #e2e8f0',
          boxShadow: isDarkMode ? '0 4px 20px -2px rgba(0, 0, 0, 0.45)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          breakpoint="lg"
          collapsedWidth={56}
          width={190}
          theme={isDarkMode ? 'dark' : 'light'}
          style={{
            borderRight: isDarkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #f0f0f0',
            background: isDarkMode ? '#16181d' : '#fff',
          }}
        >
          {!collapsed ? (
            <div
              style={{
                padding: '12px 14px 8px',
                borderBottom: isDarkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #f8fafc',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              <Title level={5} style={{ margin: 0, color: primaryColor, fontSize: 13.5 }}>
                Admin Console
              </Title>
              <Text type="secondary" style={{ fontSize: 11 }}>
                การจัดการข้อมูลและคู่มือ
              </Text>
            </div>
          ) : (
            <div
              style={{
                padding: '14px 0',
                textAlign: 'center',
                borderBottom: isDarkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #f8fafc',
              }}
            >
              <SettingOutlined style={{ fontSize: 18, color: primaryColor }} />
            </div>
          )}
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ borderRight: 0, background: 'transparent' }}
          />

          {/* Sider Collapse Button placed directly below the menu items */}
          <div
            style={{
              padding: '8px 10px',
              borderTop: isDarkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #f0f0f0',
              marginTop: 6,
            }}
          >
            <Button
              type="text"
              size="small"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.65)' : '#64748b',
                fontSize: 12,
                borderRadius: 4,
              }}
            >
              {!collapsed && <span style={{ marginLeft: 6 }}>ย่อแถบเมนู</span>}
            </Button>
          </div>
        </Sider>

        <Content
          style={{
            padding: '12px 14px',
            minHeight: 600,
            overflowX: 'auto',
            background: isDarkMode ? '#131519' : '#fff',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </div>
  );
};
