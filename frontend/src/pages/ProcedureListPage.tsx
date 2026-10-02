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
      content: 'คุณแน่ใจหรือไม่ว่าต้องการลบคู่มือนี้? การกระทำนี้ไม่สามารถย้อนกลับได้',
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
      width: 100,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'สายเรือ / เอเย่นต์',
      key: 'agents',
      width: 170,
      render: (_: any, record: Procedure) => {
        const agentList =
          record.agents && record.agents.length > 0
            ? record.agents
            : record.agent
            ? [record.agent]
            : [];

        if (agentList.length === 0) {
          return <Tag color="default">ทุกสายเรือ</Tag>;
        }

        if (agentList.length > 3) {
          const visible = agentList.slice(0, 2);
          const remaining = agentList.slice(2);
          return (
            <Space size={[0, 4]} wrap>
              {visible.map((a) => (
                <Tag key={a.id} color="cyan" style={{ margin: '1px 2px', fontWeight: 600 }}>
                  {a.code}
                </Tag>
              ))}
              <Tooltip title={remaining.map((a) => `${a.code} - ${a.name}`).join(', ')}>
                <Tag color="geekblue" style={{ cursor: 'pointer', margin: '1px 2px', fontWeight: 500 }}>
                  +{remaining.length} สายเรือ
                </Tag>
              </Tooltip>
            </Space>
          );
        }

        return (
          <Space size={[0, 4]} wrap>
            {agentList.map((a) => (
              <Tag key={a.id} color="cyan" style={{ margin: '1px 2px', fontWeight: 600 }}>
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
      width: 130,
      render: (text: string) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: 'ชื่อคู่มือขั้นตอน',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Procedure) => (
        <div>
          <a onClick={() => navigate(`/procedures/${record.id}`)} style={{ fontWeight: 500 }}>
            {text}
          </a>
          {record.description && (
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: 'จำนวนเงื่อนไข',
      key: 'variantsCount',
      width: 120,
      render: (_: any, record: Procedure) => (
        <span>{record.variants?.length || 0} เงื่อนไข</span>
      ),
    },
    {
      title: 'อัปเดตล่าสุด',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
      render: (val: string) => (val ? new Date(val).toLocaleDateString('th-TH') : '-'),
    },
    {
      title: 'การกระทำ',
      key: 'actions',
      width: isAuthenticated ? 160 : 70,
      render: (_: any, record: Procedure) => (
        <Space size="small">
          <Tooltip title="เปิดดูขั้นตอนคู่มือ">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/procedures/${record.id}`)}
            />
          </Tooltip>
          {isAuthenticated && (
            <>
              <Tooltip title="คัดลอกคู่มือ (รวมรูปภาพ)">
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  loading={duplicateMutation.isPending && duplicateMutation.variables === record.id}
                  onClick={() => handleDuplicate(record)}
                />
              </Tooltip>
              <Tooltip title="แก้ไขคู่มือ">
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/admin/procedures/${record.id}/edit`)}
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
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16, borderRadius: 8 }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col xs={24} sm={12}>
            <Title level={4} style={{ margin: 0 }}>
              รายการคู่มือการจ่ายชอร์ทั้งหมด
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              ค้นหาและจัดการขั้นตอนการปฏิบัติงานของทุกท่าและทุกสายเรือ
            </Text>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            {isAuthenticated && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/procedures/new')}
              >
                สร้างคู่มือใหม่
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      {/* Filter Row */}
      <Card size="small" style={{ marginBottom: 16, borderRadius: 6 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={8}>
            <Input
              placeholder="ค้นหาชื่อคู่มือ..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="เลือกท่าเรือ"
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
          <Col xs={12} sm={8}>
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

      <Card size="small" style={{ borderRadius: 8 }}>
        <Table
          columns={columns}
          dataSource={procedures}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          size="small"
        />
      </Card>
    </div>
  );
};
