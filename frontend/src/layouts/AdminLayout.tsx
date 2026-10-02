import React from 'react';
import { Layout, Menu, Typography, Card, Breadcrumb } from 'antd';
import {
  CompassOutlined,
  TeamOutlined,
  AppstoreOutlined,
  BookOutlined,
  PlusCircleOutlined,
  ArrowLeftOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <a onClick={() => navigate('/')} style={{ fontSize: 13 }}>
          <ArrowLeftOutlined style={{ marginRight: 6 }} /> กลับสู่หน้าผู้ใช้งาน (User Manual)
        </a>
      </div>

      <Layout style={{ background: '#fff', borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <Sider width={190} theme="light" breakpoint="lg" collapsedWidth="50" style={{ borderRight: '1px solid #f0f0f0' }}>
          <div style={{ padding: '12px 14px 6px' }}>
            <Title level={5} style={{ margin: 0, color: '#1677ff', fontSize: 14 }}>
              Admin Console
            </Title>
            <Text type="secondary" style={{ fontSize: 11 }}>
              การจัดการข้อมูลและคู่มือ
            </Text>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ borderRight: 0 }}
          />
        </Sider>

        <Content style={{ padding: '12px 16px', minHeight: 600, overflowX: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </div>
  );
};
