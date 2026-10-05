import React, { useState } from 'react';
import { Card, Row, Col, Typography, Tag, Space, Input, Spin, Alert, Button, Select, Divider } from 'antd';
import {
  CompassOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  RightOutlined,
  PlusOutlined,
  AppstoreOutlined,
  BankOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usePorts, useAgents, useCategories, useProcedures } from '../hooks/queries';
import { authService } from '../services/auth';

const { Title, Text, Paragraph } = Typography;

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [filterText, setFilterText] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);

  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: ports, isLoading: isPortsLoading, error: portsError } = usePorts();
  const { data: agents } = useAgents();
  const { data: procedures } = useProcedures();
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
          background: 'linear-gradient(135deg, #0958d9 0%, #1677ff 50%, #36cfc9 100%)',
          borderRadius: 8,
          border: 'none',
          boxShadow: '0 4px 12px rgba(9, 88, 217, 0.15)',
        }}
      >
        <Row justify="space-between" align="middle">
          <Col xs={24} md={17}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Tag color="#fff" style={{ color: '#0958d9', fontWeight: 700, borderRadius: 4, margin: 0 }}>
                ASIATHAI LOGISTICS
              </Tag>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>
                Single Source of Truth
              </Text>
            </div>
            <Title level={3} style={{ color: '#fff', margin: 0 }}>
              Asiathai Freight SOP — ระบบคู่มือปฏิบัติงานนำเข้า-ส่งออก
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.9)', margin: '8px 0 0', fontSize: 13 }}>
              คลังคู่มือขั้นตอนการทำงานครบวงจร: พิธีการศุลกากร, ขอใบรับรองราชการ (Form E, ไฟโต, มกอช.), งานหน้าท่าเรือ, สายเรือ และงานภายใน
            </Paragraph>
          </Col>
          <Col xs={24} md={7} style={{ textAlign: 'right', marginTop: 12 }}>
            <Space size="small" wrap>
              {user && (
                <Button
                  type="primary"
                  ghost
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/admin/procedures/new')}
                  style={{ borderColor: '#fff', color: '#fff' }}
                >
                  เพิ่มคู่มือใหม่
                </Button>
              )}
              <Button
                type="default"
                onClick={() => navigate('/procedures')}
                style={{ background: '#fff', color: '#0958d9', fontWeight: 600, border: 'none' }}
              >
                ดูคู่มือทั้งหมด ({procedures?.length || 0})
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Category Navigation Dashboard */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <Title level={5} style={{ margin: 0, fontSize: 15, color: '#1e293b' }}>
              <AppstoreOutlined style={{ marginRight: 6, color: '#1677ff' }} />
              หมวดหมู่การปฏิบัติงาน (Operation Categories)
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              เลือกหมวดหมู่ที่ต้องการเพื่อดูขั้นตอนการปฏิบัติงานทันที
            </Text>
          </div>
          <Button type="link" size="small" onClick={() => navigate('/procedures')}>
            ดูขั้นตอนทั้งหมด <RightOutlined style={{ fontSize: 11 }} />
          </Button>
        </div>

        {isCategoriesLoading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Spin size="small" />
          </div>
        ) : (
          <Row gutter={[12, 12]}>
            {categories?.map((cat) => {
              const count = procedures?.filter((p) => p.categoryId === cat.id).length || 0;
              return (
                <Col key={cat.id} xs={24} sm={12} md={8} lg={4} style={{ flexGrow: 1 }}>
                  <Card
                    hoverable
                    size="small"
                    onClick={() => navigate(`/procedures?categoryId=${cat.id}`)}
                    style={{
                      height: '100%',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      borderTop: `3px solid var(--ant-${cat.color || 'blue'})`,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    }}
                    bodyStyle={{ padding: '12px 14px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 26, lineHeight: 1 }}>{cat.icon}</span>
                      <Tag color={cat.color || 'blue'} style={{ margin: 0, fontWeight: 600, fontSize: 11 }}>
                        {count} คู่มือ
                      </Tag>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <Text strong style={{ fontSize: 13, display: 'block', color: '#0f172a' }}>
                        {cat.name}
                      </Text>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>

      <Divider style={{ margin: '20px 0' }} />

      {/* Terminal & Port Quick Access */}
      <div style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={5} style={{ margin: 0, fontSize: 15, color: '#1e293b' }}>
              <CompassOutlined style={{ marginRight: 6, color: '#1677ff' }} />
              งานหน้าท่าเรือและสายเรือ (Terminal Quick Access)
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ค้นหาข้อมูลท่าเรือ เวลาทำการ และตรวจสอบขั้นตอนจ่ายชอร์/แลก D/O
            </Text>
          </Col>
          <Col>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ทั้งหมด {filteredPorts?.length || 0} ท่าเรือ
            </Text>
          </Col>
        </Row>
      </div>

      {/* Filter Toolbar for Ports */}
      <Card size="small" style={{ marginBottom: 16, borderRadius: 6, border: '1px solid #e2e8f0' }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={14}>
            <Input.Search
              placeholder="ค้นหาตามรหัสหรือชื่อท่าเรือ (เช่น A2, C1C2, B2)..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={10}>
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
