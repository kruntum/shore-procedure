import React, { useState } from 'react';
import { Card, Table, Tag, Input, Select, Button, Space, Typography, Row, Col, Tooltip, Modal, message } from 'antd';
import { SearchOutlined, EyeOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useProcedures, usePorts, useAgents } from '../hooks/queries';
import { useDeleteProcedure, useDuplicateProcedure } from '../hooks/mutations';
import { authService } from '../services/auth';
import { Procedure } from '../types';

const { Title, Text } = Typography;

export const ProcedureListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [portId, setPortId] = useState<number | undefined>();
  const [agentId, setAgentId] = useState<number | undefined>();

  const { data: procedures, isLoading } = useProcedures({
    search: search || undefined,
    portId,
    agentId,
  });

  const { data: ports } = usePorts();
  const { data: agents } = useAgents();
  const deleteMutation = useDeleteProcedure();
  const duplicateMutation = useDuplicateProcedure();
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'ยืนยันการลบคู่มือ?',
      content: 'คุณแนใจหรือไม่ว่าต้องการลบคู่มือนี้? การกระทำนี้ไม่สามารถย้อนกลับได้',
      okText: 'ลบคู่มือ',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: () => {
        deleteMutation.mutate(id);
      },
    });
  };

  const handleDuplicate = (proc: Procedure) => {
    Modal.confirm({
      title: 'คัดลอกคู่มือนี้เป็นฉบับใหม่?',
      content: `ระบบจะคัดลอกข้อมูลทั้งหมดของ "${proc.title}" รวมถึงเงื่อนไข ขั้นตอน และรูปภาพประกอบทั้งหมดไปยังพื้นที่ใหม่ เพื่อให้ท่านปรับปรุงแก้ไขต่อได้ทันที`,
      okText: 'คัดลอกคู่มือ',
      cancelText: 'ยกเลิก',
      onOk: async () => {
        try {
          const res = await duplicateMutation.mutateAsync(proc.id);
          message.success('คัดลอกคู่มือและรูปภาพสำเร็จ!');
          navigate(`/admin/procedures/${res.data.data.id}/edit`);
        } catch (err: any) {
          message.error(err.response?.data?.error || 'เกิดข้อผิดพลาดในการคัดลอกคู่มือ');
        }
      },
    });
  };

  const columns = [
    {
      title: 'ท่าเรือ',
      dataIndex: ['port', 'code'],
      key: 'port',
      width: 80,
      align: 'center' as const,
      render: (text: string) => (
        <Tag color="blue" style={{ fontWeight: 600, margin: 0, padding: '0 6px', fontSize: 11, height: 20, lineHeight: '18px' }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'สายเรือ / เอเย่นต์',
      key: 'agents',
      width: 150,
      render: (_: any, record: Procedure) => {
        const agentList =
          record.agents && record.agents.length > 0
            ? record.agents
            : record.agent
            ? [record.agent]
            : [];

        if (agentList.length === 0) {
          return <Tag color="default" style={{ borderRadius: 4, fontSize: 11, height: 20, lineHeight: '18px' }}>ทุกสายเรือ</Tag>;
        }

        if (agentList.length > 3) {
          const visible = agentList.slice(0, 2);
          const remaining = agentList.slice(2);
          return (
            <Space size={[0, 4]} wrap>
              {visible.map((a) => (
                <Tag key={a.id} color="cyan" style={{ margin: '1px 2px', fontWeight: 600, borderRadius: 4, fontSize: 11, height: 20, lineHeight: '18px' }}>
                  {a.code}
                </Tag>
              ))}
              <Tooltip title={remaining.map((a) => `${a.code} - ${a.name}`).join(', ')}>
                <Tag color="geekblue" style={{ cursor: 'pointer', margin: '1px 2px', fontWeight: 500, borderRadius: 4, fontSize: 11, height: 20, lineHeight: '18px' }}>
                  +{remaining.length} สายเรือ
                </Tag>
              </Tooltip>
            </Space>
          );
        }

        return (
          <Space size={[0, 4]} wrap>
            {agentList.map((a) => (
              <Tag key={a.id} color="cyan" style={{ margin: '1px 2px', fontWeight: 600, borderRadius: 4, fontSize: 11, height: 20, lineHeight: '18px' }}>
                {a.code}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'ประเภทงาน',
      dataIndex: ['workType', 'name'],
      key: 'workType',
      width: 95,
      align: 'center' as const,
      render: (text: string) => (
        <Tag color="purple" style={{ margin: 0, borderRadius: 4, fontSize: 11, height: 20, lineHeight: '18px' }}>
          {text || 'จ่ายชอร์'}
        </Tag>
      ),
    },
    {
      title: 'ชื่อคู่มือขั้นตอน',
      dataIndex: 'title',
      key: 'title',
      width: 280,
      render: (text: string, record: Procedure) => (
        <div>
          <a
            onClick={() => navigate(`/procedures/${record.id}`)}
            style={{ fontWeight: 500, fontSize: 11, color: '#1677ff' }}
          >
            {text}
          </a>
          {record.description && (
            <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 1, lineHeight: 1.3 }}>
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'จำนวนเงื่อนไข',
      key: 'variantsCount',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: Procedure) => (
        <span style={{ fontSize: 11 }}>{record.variants?.length || 0} เงื่อนไข</span>
      ),
    },
    {
      title: 'อัปเดตล่าสุด',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 95,
      align: 'center' as const,
      render: (val: string) => (
        <span style={{ fontSize: 11, color: '#64748b' }}>
          {val ? new Date(val).toLocaleDateString('th-TH') : '-'}
        </span>
      ),
    },
    {
      title: 'การกระทำ',
      key: 'actions',
      width: isAuthenticated ? 160 : 70,
      align: 'center' as const,
      render: (_: any, record: Procedure) => (
        <Space size={4}>
          <Tooltip title="เปิดดูขั้นตอนคู่มือ">
            <Button
              size="small"
              type="primary"
              ghost
              icon={<EyeOutlined />}
              onClick={() => navigate(`/procedures/${record.id}`)}
              style={{ borderRadius: 4 }}
            />
          </Tooltip>
          {isAuthenticated && (
            <>
              <Tooltip title="คัดลอกคู่มือ (รวมรูปภาพ)">
                <Button
                  size="small"
                  icon={<CopyOutlined style={{ color: '#0d9488' }} />}
                  loading={duplicateMutation.isPending && duplicateMutation.variables === record.id}
                  onClick={() => handleDuplicate(record)}
                  style={{ borderRadius: 4, borderColor: '#99f6e4' }}
                />
              </Tooltip>
              <Tooltip title="แก้ไขคู่มือ">
                <Button
                  size="small"
                  icon={<EditOutlined style={{ color: '#d97706' }} />}
                  onClick={() => navigate(`/admin/procedures/${record.id}/edit`)}
                  style={{ borderRadius: 4, borderColor: '#fde68a' }}
                />
              </Tooltip>
            </>
          )}
          {isAdmin && (
            <Tooltip title="ลบคู่มือ">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
                style={{ borderRadius: 4 }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Unified Header & Filter Card */}
      <Card
        size="small"
        style={{
          marginBottom: 12,
          borderRadius: 6,
          border: '1px solid #e2e8f0',
        }}
        bodyStyle={{ padding: '12px 14px' }}
      >
        <Row justify="space-between" align="middle" gutter={[8, 8]} style={{ marginBottom: 10 }}>
          <Col xs={24} sm={16}>
            <Title level={5} style={{ margin: 0, color: '#0f172a', fontSize: 14 }}>
              รายการคู่มือการจ่ายชอร์ทั้งหมด
            </Title>
            <Text type="secondary" style={{ fontSize: 11.5 }}>
              ค้นหาและจัดการขั้นตอนการปฏิบัติงานของทุกท่าและทุกสายเรือ (ทั้งหมด {procedures?.length || 0} คู่มือ)
            </Text>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
            {isAuthenticated && (
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/procedures/new')}
                style={{ borderRadius: 4, fontWeight: 500 }}
              >
                สร้างคู่มือใหม่
              </Button>
            )}
          </Col>
        </Row>

        {/* Filter Controls */}
        <Row gutter={[8, 8]} align="middle">
          <Col xs={24} sm={10} md={9}>
            <Input
              size="small"
              placeholder="ค้นหาชื่อคู่มือ..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={7} md={7}>
            <Select
              size="small"
              style={{ width: '100%' }}
              placeholder="เลือกท่าเรือทั้งหมด"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
              }
              options={ports?.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` }))}
              onChange={setPortId}
              value={portId}
            />
          </Col>
          <Col xs={12} sm={7} md={8}>
            <Select
              size="small"
              style={{ width: '100%' }}
              placeholder="เลือกสายเรือ / เอเย่นต์"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
              }
              options={agents?.map((a) => ({ value: a.id, label: `${a.code} - ${a.name}` }))}
              onChange={setAgentId}
              value={agentId}
            />
          </Col>
        </Row>
      </Card>

      {/* Table Card with Scroll Protection */}
      <Card
        size="small"
        style={{
          borderRadius: 6,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={procedures}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 980 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `แสดง ${range[0]}-${range[1]} จาก ${total} คู่มือ`,
            style: { padding: '8px 12px', margin: 0 },
            size: 'small',
          }}
          size="small"
        />
      </Card>
    </div>
  );
};
