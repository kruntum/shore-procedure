import React, { useState } from 'react';
import { Card, Row, Col, Typography, Tag, Space, Input, Spin, Alert, Button, Select } from 'antd';
import {
  CompassOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  RightOutlined,
  TeamOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usePorts, useAgents } from '../hooks/queries';
import { authService } from '../services/auth';

const { Title, Text, Paragraph } = Typography;

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [filterText, setFilterText] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);

  const { data: ports, isLoading: isPortsLoading, error: portsError } = usePorts();
  const { data: agents } = useAgents();
  const user = authService.getCurrentUser();

  const filteredPorts = ports?.filter((p) => {
    const matchesText =
      p.code.toLowerCase().includes(filterText.toLowerCase()) ||
      p.name.toLowerCase().includes(filterText.toLowerCase());
    return matchesText;
  });

  return (
    <div>
      {/* Hero Banner */}
      <Card
        style={{
          marginBottom: 20,
          background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
          borderRadius: 8,
          border: 'none',
        }}
      >
        <Row justify="space-between" align="middle">
          <Col xs={24} md={16}>
            <Title level={3} style={{ color: '#fff', margin: 0 }}>
              ระบบค้นหาและคู่มือขั้นตอนการจ่ายชอร์
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.85)', margin: '8px 0 0', fontSize: 13 }}>
              เลือกท่าเรือและสายเรือเพื่อตรวจสอบขั้นตอน เวลาตัดรอบ และเงื่อนไขการทำงานได้ทันที (Single Source of Truth)
            </Paragraph>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right', marginTop: 12 }}>
            {user ? (
              <Button
                type="primary"
                ghost
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/procedures/new')}
                style={{ borderColor: '#fff', color: '#fff' }}
              >
                เพิ่มคู่มือใหม่
              </Button>
            ) : (
              <Button
                type="primary"
                ghost
                onClick={() => navigate('/procedures')}
                style={{ borderColor: '#fff', color: '#fff' }}
              >
                ดูคู่มือทั้งหมด
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      {/* Filter Toolbar */}
      <Card size="small" style={{ marginBottom: 20, borderRadius: 6 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={10} md={12}>
            <Input.Search
              placeholder="ค้นหาตามรหัสหรือชื่อท่าเรือ (เช่น A2, C1C2, B2)..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={10} md={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="กรองตามสายเรือ / เอเย่นต์"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
              }
              options={agents?.map((a) => ({ value: a.id, label: `${a.code} - ${a.name}` }))}
              onChange={(val) => {
                setSelectedAgent(val);
                if (val) {
                  navigate(`/procedures?agentId=${val}`);
                }
              }}
            />
          </Col>
          <Col xs={24} sm={4} md={4} style={{ textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ทั้งหมด {filteredPorts?.length || 0} ท่าเรือ
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Ports Grid */}
      {isPortsLoading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="กำลังโหลดข้อมูลท่าเรือ..." />
        </div>
      )}

      {portsError && (
        <Alert
          type="error"
          message="ไม่สามารถเชื่อมต่อฐานข้อมูลได้"
          description="โปรดตรวจสอบว่า PostgreSQL ทำงานปกติ"
          showIcon
        />
      )}

      <Row gutter={[16, 16]}>
        {filteredPorts?.map((port) => (
          <Col key={port.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              size="small"
              onClick={() => navigate(`/ports/${port.id}`)}
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: 6,
                borderTop: port.paymentMethod === 'หน้าเคาน์เตอร์เท่านั้น' ? '3px solid #ff4d4f' : '3px solid #1677ff',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <CompassOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                    <Title level={5} style={{ margin: 0 }}>
                      {port.code}
                    </Title>
                  </Space>
                  <Tag color={port.paymentMethod === 'หน้าเคาน์เตอร์เท่านั้น' ? 'error' : 'processing'}>
                    {port.paymentMethod}
                  </Tag>
                </div>

                <Text type="secondary" style={{ display: 'block', margin: '4px 0 10px', fontSize: 12 }}>
                  {port.name}
                </Text>

                <Space direction="vertical" size={2} style={{ width: '100%', fontSize: 12 }}>
                  <Space align="start">
                    <ClockCircleOutlined style={{ color: '#fa8c16', marginTop: 3 }} />
                    <Text type="secondary">{port.operatingHours || '24 ชม.'}</Text>
                  </Space>

                  {port.notes && (
                    <Space align="start">
                      <ExclamationCircleOutlined style={{ color: '#faad14', marginTop: 3 }} />
                      <Text type="secondary" style={{ color: '#d46b08', fontSize: 11 }}>
                        {port.notes}
                      </Text>
                    </Space>
                  )}
                </Space>
              </div>

              <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid #f0f0f0', textAlign: 'right' }}>
                <Text style={{ color: '#1677ff', fontSize: 12 }}>
                  ดูขั้นตอน <RightOutlined style={{ fontSize: 10 }} />
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};
