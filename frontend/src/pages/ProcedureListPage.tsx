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
      width: 90,
      align: 'center' as const,
      fixed: 'left' as const,
      render: (text: string) => (
        <Tag color="blue" style={{ fontWeight: 700, margin: 0, padding: '2px 8px', borderRadius: 4 }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'สายเรือ / เอเย่นต์',
      key: 'agents',
      width: 160,
      render: (_: any, record: Procedure) => {
        const agentList =
          record.agents && record.agents.length > 0
            ? record.agents
            : record.agent
            ? [record.agent]
            : [];

        if (agentList.length === 0) {
          return <Tag color="default" style={{ borderRadius: 4 }}>ทุกสายเรือ</Tag>;
        }

        if (agentList.length > 3) {
          const visible = agentList.slice(0, 2);
          const remaining = agentList.slice(2);
          return (
            <Space size={[0, 4]} wrap>
              {visible.map((a) => (
                <Tag key={a.id} color="cyan" style={{ margin: '1px 2px', fontWeight: 600, borderRadius: 4 }}>
                  {a.code}
                </Tag>
              ))}
              <Tooltip title={remaining.map((a) => `${a.code} - ${a.name}`).join(', ')}>
                <Tag color="geekblue" style={{ cursor: 'pointer', margin: '1px 2px', fontWeight: 500, borderRadius: 4 }}>
                  +{remaining.length} สายเรือ
                </Tag>
              </Tooltip>
            </Space>
          );
        }

        return (
          <Space size={[0, 4]} wrap>
            {agentList.map((a) => (
              <Tag key={a.id} color="cyan" style={{ margin: '1px 2px', fontWeight: 600, borderRadius: 4 }}>
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
      width: 110,
      align: 'center' as const,
      render: (text: string) => <Tag color="purple" style={{ margin: 0, borderRadius: 4 }}>{text || 'จ่ายชอร์'}</Tag>,
    },
    {
      title: 'ชื่อคู่มือและรายละเอียดขั้นตอน',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Procedure) => (
        <div style={{ padding: '2px 0' }}>
          <a
            onClick={() => navigate(`/procedures/${record.id}`)}
            style={{
              fontWeight: 600,
              fontSize: 13.5,
              color: '#0958d9',
              display: 'block',
              lineHeight: 1.45,
            }}
          >
            {text}
          </a>
          {record.description && (
            <div
              style={{
                fontSize: 12,
                color: '#64748b',
                lineHeight: 1.4,
                marginTop: 3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
              title={record.description}
            >
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'จำนวนเงื่อนไข',
      key: 'variantsCount',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: Procedure) => {
        const count = record.variants?.length || 0;
        const stepsCount = record.variants?.reduce((sum, v) => sum + (v.steps?.length || 0), 0) || 0;
        return (
          <Space direction="vertical" size={2} style={{ textAlign: 'center' }}>
            <Tag color="geekblue" style={{ borderRadius: 10, margin: 0, fontWeight: 500 }}>
              {count} เงื่อนไข
            </Tag>
            {stepsCount > 0 && (
              <span style={{ fontSize: 11, color: '#94a3b8' }}>({stepsCount} ขั้นตอน)</span>
            )}
          </Space>
        );
      },
    },
    {
      title: 'อัปเดตล่าสุด',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 110,
      align: 'center' as const,
      render: (val: string) => (
        <span style={{ fontSize: 12, color: '#64748b' }}>
          {val ? new Date(val).toLocaleDateString('th-TH') : '-'}
        </span>
      ),
    },
    {
      title: 'การกระทำ',
      key: 'actions',
      width: isAuthenticated ? 160 : 70,
      fixed: 'right' as const,
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
        style={{
          marginBottom: 16,
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
        bodyStyle={{ padding: '16px 20px' }}
      >
        <Row justify="space-between" align="middle" gutter={[12, 12]} style={{ marginBottom: 14 }}>
          <Col xs={24} sm={16}>
            <Title level={4} style={{ margin: 0, color: '#0f172a' }}>
              รายการคู่มือการจ่ายชอร์ทั้งหมด
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              ค้นหาและจัดการขั้นตอนการปฏิบัติงานของทุกท่าและทุกสายเรือ (ทั้งหมด {procedures?.length || 0} คู่มือ)
            </Text>
          </Col>
          <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
            {isAuthenticated && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/procedures/new')}
                style={{ borderRadius: 6, fontWeight: 500 }}
              >
                สร้างคู่มือใหม่
              </Button>
            )}
          </Col>
        </Row>

        {/* Filter Controls */}
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={10} md={9}>
            <Input
              placeholder="ค้นหาชื่อคู่มือ..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={7} md={7}>
            <Select
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
        style={{
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          overflow: 'hidden',
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={procedures}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1080 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `แสดง ${range[0]}-${range[1]} จาก ${total} คู่มือ`,
            style: { padding: '12px 16px', margin: 0 },
          }}
          size="middle"
        />
      </Card>
    </div>
  );
};
