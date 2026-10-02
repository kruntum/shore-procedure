import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined, RocketOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

const { Title, Paragraph } = Typography;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleLogin = async (values: any) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await authService.login(values.username, values.password);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'เข้าสู่ระบบไม่สำเร็จ โปรดตรวจสอบชื่อผู้ใช้และรหัสผ่าน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f2f5 0%, #e6f7ff 100%)',
        padding: 16,
      }}
    >
      <Card
        style={{
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          borderRadius: 8,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <RocketOutlined style={{ fontSize: 40, color: '#1677ff', marginBottom: 8 }} />
          <Title level={3} style={{ margin: 0, color: '#1f1f1f' }}>
            เข้าสู่ระบบ
          </Title>
          <Paragraph type="secondary" style={{ marginTop: 4, fontSize: 13 }}>
            Shore Procedure Management System
          </Paragraph>
        </div>

        {errorMsg && (
          <Alert
            message={errorMsg}
            type="error"
            showIcon
            closable
            style={{ marginBottom: 16, fontSize: 13 }}
            onClose={() => setErrorMsg(null)}
          />
        )}

        <Form form={form} layout="vertical" onFinish={handleLogin} size="middle">
          <Form.Item
            name="username"
            label="ชื่อผู้ใช้ (Username)"
            rules={[{ required: true, message: 'กรุณากรอก Username' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="เช่น admin หรือ kan" />
          </Form.Item>

          <Form.Item
            name="password"
            label="รหัสผ่าน (Password)"
            rules={[{ required: true, message: 'กรุณากรอก Password' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="รหัสผ่าน" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 38 }}>
              เข้าสู่ระบบ
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
