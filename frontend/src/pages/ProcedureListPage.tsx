import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Input, Select, Button, Space, Typography, Row, Col, Tooltip, Modal, message } from 'antd';
import { SearchOutlined, EyeOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, BankOutlined, CompassOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProcedures, usePorts, useAgents, useCategories, useGovernmentAgencies } from '../hooks/queries';
import { useDeleteProcedure, useDuplicateProcedure } from '../hooks/mutations';
import { authService } from '../services/auth';
import { useTheme } from '../contexts/ThemeContext';
import { Procedure } from '../types';

const { Title, Text } = Typography;

export const ProcedureListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDarkMode, primaryColor } = useTheme();

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [governmentAgencyId, setGovernmentAgencyId] = useState<number | undefined>();
  const [portId, setPortId] = useState<number | undefined>();
  const [agentId, setAgentId] = useState<number | undefined>();

  useEffect(() => {
    const catParam = searchParams.get('categoryId');
    const portParam = searchParams.get('portId');
    const agentParam = searchParams.get('agentId');
    const govParam = searchParams.get('governmentAgencyId');

    if (catParam) setCategoryId(parseInt(catParam));
    if (portParam) setPortId(parseInt(portParam));
    if (agentParam) setAgentId(parseInt(agentParam));
    if (govParam) setGovernmentAgencyId(parseInt(govParam));
  }, [searchParams]);

  const { data: procedures, isLoading } = useProcedures({
    search: search || undefined,
    categoryId,
    governmentAgencyId,
    portId,
    agentId,
  });

  const { data: categories } = useCategories();
  const { data: govAgencies } = useGovernmentAgencies();
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
      title: 'หมวดหมู่',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 140,
      render: (_: any, record: Procedure) => {
        if (!record.category) return <Tag color="default">ทั่วไป</Tag>;
        return (
          <Tag color={record.category.color || 'blue'}>
            <span style={{ marginRight: 4 }}>{record.category.icon}</span>
            {record.category.name}
          </Tag>
        );
      },
    },
    {
      title: 'สถานที่ / หน่วยงาน',
      key: 'locationOrAgency',
      width: 150,
      render: (_: any, record: Procedure) => {
        const govList =
          record.governmentAgencies && record.governmentAgencies.length > 0
            ? record.governmentAgencies
            : record.governmentAgency
            ? [record.governmentAgency]
            : [];

        if (record.port) {
          return (
            <Space size={2}>
              <CompassOutlined style={{ color: '#1677ff' }} />
              <Tag color="blue">{record.port.code}</Tag>
            </Space>
          );
        }

        if (govList.length > 0) {
          return (
            <Space size={[0, 4]} wrap>
              {govList.map((g) => (
                <Tag key={g.id} color="volcano" icon={<BankOutlined />}>
                  {g.shortName || g.name}
                </Tag>
              ))}
            </Space>
          );
        }

        return <Text type="secondary" style={{ fontSize: 11 }}>-</Text>;
      },
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
          return <Text type="secondary" style={{ fontSize: 11 }}>-</Text>;
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
                  +{remaining.length}
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
      align: 'center' as const,
      render: (text: string) => <Tag color="purple">{text}</Tag>,
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
            style={{ fontWeight: 500, fontSize: 12, color: primaryColor, lineHeight: 1.3, display: 'inline-block' }}
          >
            {text}
          </a>
          {record.description && (
            <div style={{ fontSize: 10.5, color: isDarkMode ? '#a1a1aa' : '#8c8c8c', marginTop: 1, lineHeight: 1.25 }}>
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'เงื่อนไข',
      key: 'variantsCount',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: Procedure) => (
        <span style={{ fontSize: 11, color: isDarkMode ? '#94a3b8' : '#475569' }}>
          {record.variants?.length || 0} แบบ
        </span>
      ),
    },
    {
      title: 'จัดการ',
      key: 'actions',
      width: isAuthenticated ? 160 : 70,
      align: 'center' as const,
      fixed: 'right' as const,
      render: (_: any, record: Procedure) => (
        <Space size={2}>
          <Tooltip title="ดูคู่มือ">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined style={{ color: '#1677ff', fontSize: 13 }} />}
              onClick={() => navigate(`/procedures/${record.id}`)}
              style={{ width: 26, height: 26, padding: 0 }}
            />
          </Tooltip>

          {isAuthenticated && (
            <>
              <Tooltip title="คัดลอกสร้างคู่มือใหม่">
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined style={{ color: '#52c41a', fontSize: 13 }} />}
                  onClick={() => handleDuplicate(record)}
                  style={{ width: 26, height: 26, padding: 0 }}
                />
              </Tooltip>
              <Tooltip title="แก้ไข">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined style={{ color: '#fa8c16', fontSize: 13 }} />}
                  onClick={() => navigate(`/admin/procedures/${record.id}/edit`)}
                  style={{ width: 26, height: 26, padding: 0 }}
                />
              </Tooltip>
              {isAdmin && (
                <Tooltip title="ลบ">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined style={{ fontSize: 13 }} />}
                    onClick={() => handleDelete(record.id)}
                    style={{ width: 26, height: 26, padding: 0 }}
                  />
                </Tooltip>
              )}
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Search & Filter Header Card */}
      <Card
        size="small"
        style={{
          marginBottom: 12,
          borderRadius: 8,
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #e2e8f0',
          boxShadow: isDarkMode ? '0 4px 16px -2px rgba(0, 0, 0, 0.45)' : '0 1px 3px rgba(0, 0, 0, 0.03)',
          background: isDarkMode ? '#1a1d21' : '#fff',
        }}
      >
        <Row justify="space-between" align="middle" style={{ marginBottom: 10 }}>
          <Col>
            <Title level={5} style={{ margin: 0, fontSize: 14 }}>
              คลังคู่มือปฏิบัติงานมาตรฐาน (SOP Procedures)
            </Title>
            <Text type="secondary" style={{ fontSize: 11.5 }}>
              ค้นหาและกรองขั้นตอนการทำงานตามหมวดหมู่ ท่าเรือ สายเรือ หรือหน่วยงานราชการ
            </Text>
          </Col>
          <Col>
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
          <Col xs={24} sm={12} md={6}>
            <Input
              size="small"
              placeholder="ค้นหาชื่อคู่มือ..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              size="small"
              style={{ width: '100%' }}
              placeholder="ทุกหมวดหมู่"
              allowClear
              options={categories?.map((c) => ({ value: c.id, label: `${c.icon} ${c.name}` }))}
              onChange={setCategoryId}
              value={categoryId}
            />
          </Col>
          <Col xs={12} sm={6} md={5}>
            <Select
              size="small"
              style={{ width: '100%' }}
              placeholder="หน่วยงานราชการทั้งหมด"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
              }
              options={govAgencies?.map((g) => ({ value: g.id, label: `${g.shortName ? `[${g.shortName}] ` : ''}${g.name}` }))}
              onChange={setGovernmentAgencyId}
              value={governmentAgencyId}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              size="small"
              style={{ width: '100%' }}
              placeholder="ท่าเรือทั้งหมด"
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
          <Col xs={12} sm={6} md={5}>
            <Select
              size="small"
              style={{ width: '100%' }}
              placeholder="สายเรือทั้งหมด"
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
          borderRadius: 8,
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #e2e8f0',
          boxShadow: isDarkMode ? '0 4px 16px -2px rgba(0, 0, 0, 0.45)' : '0 1px 3px rgba(0, 0, 0, 0.03)',
          background: isDarkMode ? '#1a1d21' : '#fff',
          overflow: 'hidden',
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={procedures}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1000 }}
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
