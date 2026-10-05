import React, { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
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
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { authService } from '../services/auth';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

      <Layout style={{ background: '#fff', borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          breakpoint="lg"
          collapsedWidth={56}
          width={190}
          theme="light"
          style={{ borderRight: '1px solid #f0f0f0' }}
        >
          {!collapsed ? (
            <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid #f8fafc', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <Title level={5} style={{ margin: 0, color: '#1677ff', fontSize: 13.5 }}>
                Admin Console
              </Title>
              <Text type="secondary" style={{ fontSize: 11 }}>
                การจัดการข้อมูลและคู่มือ
              </Text>
            </div>
          ) : (
            <div style={{ padding: '14px 0', textAlign: 'center', borderBottom: '1px solid #f8fafc' }}>
              <SettingOutlined style={{ fontSize: 18, color: '#1677ff' }} />
            </div>
          )}
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ borderRight: 0 }}
          />
        </Sider>

        <Content style={{ padding: '12px 14px', minHeight: 600, overflowX: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </div>
  );
};
