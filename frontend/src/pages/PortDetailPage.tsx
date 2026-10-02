import React from 'react';
import { Card, Typography, Space, Tag, List, Button, Breadcrumb, Empty, Spin, Row, Col } from 'antd';
import {
  CompassOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BookOutlined,
  RightOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { usePort } from '../hooks/queries';
import { authService } from '../services/auth';

const { Title, Text, Paragraph } = Typography;

export const PortDetailPage: React.FC = () => {
  const { portId } = useParams<{ portId: string }>();
  const navigate = useNavigate();
  const id = parseInt(portId || '0');

  const { data: port, isLoading } = usePort(id);
  const isAuthenticated = authService.isAuthenticated();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Spin size="large" tip="กำลังโหลดข้อมูลท่าเรือ..." />
      </div>
    );
  }

  if (!port) {
    return <Empty description="ไม่พบข้อมูลท่าเรือที่ระบุ" />;
  }

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <a onClick={() => navigate('/')}>หน้าหลัก</a> },
          { title: 'ท่าเรือ' },
          { title: port.code },
        ]}
      />

      {/* Port Info Header */}
      <Card style={{ marginBottom: 20, borderRadius: 8 }}>
        <Row justify="space-between" align="middle">
          <Col xs={24} md={18}>
            <Space align="center" size="middle">
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} />
              <div>
                <Space align="center">
                  <Title level={4} style={{ margin: 0 }}>
                    {port.code} - {port.name}
                  </Title>
                  <Tag color={port.paymentMethod === 'หน้าเคาน์เตอร์เท่านั้น' ? 'error' : 'processing'}>
                    {port.paymentMethod}
                  </Tag>
                </Space>
                <div style={{ marginTop: 6 }}>
                  <Space size="large" style={{ fontSize: 13, color: '#595959' }}>
                    <Space>
                      <ClockCircleOutlined style={{ color: '#fa8c16' }} />
                      <span>เวลาทำการ: {port.operatingHours || '24 ชม.'}</span>
                    </Space>
                    {port.notes && (
                      <Space>
                        <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                        <span style={{ color: '#d46b08' }}>{port.notes}</span>
                      </Space>
                    )}
                  </Space>
                </div>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={6} style={{ textAlign: 'right', marginTop: 12 }}>
            {isAuthenticated && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate(`/admin/procedures/new?portId=${port.id}`)}
              >
                เพิ่มคู่มือสำหรับท่านี้
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      {/* Procedures List under this Port */}
      <Title level={5} style={{ marginBottom: 12 }}>
        <BookOutlined style={{ color: '#1677ff', marginRight: 8 }} />
        คู่มือขั้นตอนการปฏิบัติงานของท่าเรือ {port.code}
      </Title>

      {port.procedures && port.procedures.length > 0 ? (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
          dataSource={port.procedures}
          renderItem={(proc) => (
            <List.Item>
              <Card
                hoverable
                size="small"
                onClick={() => navigate(`/procedures/${proc.id}`)}
                style={{ borderRadius: 6, height: '100%' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
                  <Space wrap size={[4, 4]}>
                    {proc.agents && proc.agents.length > 0 ? (
                      proc.agents.map((ag) => (
                        <Tag key={ag.id} color="cyan" style={{ fontWeight: 'bold', marginInlineEnd: 0 }}>
                          {ag.code}
                        </Tag>
                      ))
                    ) : (
                      <Tag color="cyan" style={{ fontWeight: 'bold', marginInlineEnd: 0 }}>
                        {proc.agent?.code || 'AGENT'}
                      </Tag>
                    )}
                  </Space>
                  <Tag color="purple">{proc.workType?.name || 'ประเภทงาน'}</Tag>
                </div>

                <Title level={5} style={{ margin: '10px 0 4px', fontSize: 14 }}>
                  {proc.title}
                </Title>

                {proc.description && (
                  <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ fontSize: 12, marginBottom: 8 }}>
                    {proc.description}
                  </Paragraph>
                )}

                <div style={{ textAlign: 'right', marginTop: 8 }}>
                  <Button type="link" size="small" style={{ padding: 0 }}>
                    เปิดดูขั้นตอน <RightOutlined style={{ fontSize: 10 }} />
                  </Button>
                </div>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Card style={{ textAlign: 'center', padding: '32px 0' }}>
          <Empty description={`ยังไม่มีคู่มือสำหรับท่าเรือ ${port.code}`}>
            {isAuthenticated && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate(`/admin/procedures/new?portId=${port.id}`)}
              >
                สร้างคู่มือแรกสำหรับท่านี้
              </Button>
            )}
          </Empty>
        </Card>
      )}
    </div>
  );
};
