import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Input,
  Select,
  Spin,
  Alert,
  Empty,
  Button,
  Space,
  Tag,
  Table,
  Tooltip,
  Modal,
  Form,
  Radio,
  Progress,
  message,
} from 'antd';
import {
  ApartmentOutlined,
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  BarsOutlined,
  ClockCircleOutlined,
  BookOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWorkflows, useCategories } from '../hooks/queries';
import { useCreateWorkflow, useUpdateWorkflow, useDeleteWorkflow } from '../hooks/mutations';
import { WorkflowCard } from '../components/WorkflowCard';
import { useTheme } from '../contexts/ThemeContext';
import { authService } from '../services/auth';
import { JobWorkflow } from '../types';

const { Title, Text, Paragraph } = Typography;

export const WorkflowListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDarkMode, primaryColor } = useTheme();
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();

  const [searchText, setSearchText] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : null
  );
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State for Create / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<JobWorkflow | null>(null);
  const [form] = Form.useForm();

  const { data: categories } = useCategories();
  const { data: workflows, isLoading, error } = useWorkflows();
  const createMutation = useCreateWorkflow();
  const updateMutation = useUpdateWorkflow();
  const deleteMutation = useDeleteWorkflow();

  const filteredWorkflows = workflows?.filter((wf) => {
    const matchesCategory = selectedCategory ? wf.categoryId === selectedCategory : true;
    const matchesText =
      searchText.trim() === '' ||
      wf.title.toLowerCase().includes(searchText.toLowerCase()) ||
      wf.code.toLowerCase().includes(searchText.toLowerCase()) ||
      (wf.description && wf.description.toLowerCase().includes(searchText.toLowerCase())) ||
      (wf.targetAudience && wf.targetAudience.toLowerCase().includes(searchText.toLowerCase()));
    return matchesCategory && matchesText;
  });

  const handleOpenModal = (item?: JobWorkflow) => {
    if (item) {
      setEditingWorkflow(item);
      form.setFieldsValue({
        code: item.code,
        title: item.title,
        description: item.description,
        categoryId: item.categoryId,
        status: item.status || 'active',
        estimatedDuration: item.estimatedDuration,
        targetAudience: item.targetAudience,
      });
    } else {
      setEditingWorkflow(null);
      form.resetFields();
      form.setFieldsValue({
        code: `WF-${Date.now().toString().slice(-6)}`,
        status: 'active',
        targetAudience: 'พนักงานหน้าด่าน / ชิปปิ้ง',
        estimatedDuration: '1 วันทำการ',
      });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingWorkflow) {
        await updateMutation.mutateAsync({ id: editingWorkflow.id, data: values });
        message.success('แก้ไขข้อมูลสายงานปฏิบัติการสำเร็จ');
      } else {
        await createMutation.mutateAsync(values);
        message.success('สร้างสายงานปฏิบัติการใหม่สำเร็จ');
      }
      setModalOpen(false);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'ยืนยันการลบสายงานปฏิบัติการ',
      content: 'คุณแน่ใจหรือไม่ว่าต้องการลบสายงานนี้? ขั้นตอนที่ผูกกับสายงานนี้จะถูกลบออกทั้งหมด (แต่คู่มือ SOP หลักจะไม่ได้รับผลกระทบ)',
      okText: 'ลบข้อมูล',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          message.success('ลบสายงานปฏิบัติการสำเร็จ');
        } catch (err: any) {
          message.error(err.response?.data?.error || 'ไม่สามารถลบสายงานได้');
        }
      },
    });
  };

  const columns = [
    {
      title: 'ลำดับ',
      key: 'index',
      width: 55,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (
        <span style={{ fontSize: 11, color: isDarkMode ? '#94a3b8' : '#8c8c8c' }}>
          {(currentPage - 1) * pageSize + index + 1}
        </span>
      ),
    },
    {
      title: 'ชื่อสายงานปฏิบัติการ (Job Workflow)',
      dataIndex: 'title',
      key: 'title',
      width: 310,
      render: (text: string, record: JobWorkflow) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Tag color="cyan" style={{ fontSize: 10, margin: 0, padding: '0 4px', fontWeight: 600 }}>
              {record.code}
            </Tag>
            <a
              onClick={() => navigate(`/workflows/${record.id}`)}
              style={{
                fontWeight: 600,
                fontSize: 12.5,
                color: primaryColor,
                lineHeight: 1.35,
                display: 'inline-block',
              }}
            >
              {text}
            </a>
          </div>
          {record.description && (
            <div
              style={{
                fontSize: 11,
                color: isDarkMode ? '#a1a1aa' : '#8c8c8c',
                marginTop: 2,
                lineHeight: 1.25,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 290,
              }}
            >
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'หมวดหมู่',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 140,
      render: (_: any, record: JobWorkflow) => {
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
      title: 'ผู้รับผิดชอบ',
      dataIndex: 'targetAudience',
      key: 'targetAudience',
      width: 150,
      render: (val: string) => (
        <Space size={4} style={{ fontSize: 11 }}>
          <UserOutlined style={{ color: '#8c8c8c' }} />
          <span>{val || 'ชิปปิ้ง / หน้าด่าน'}</span>
        </Space>
      ),
    },
    {
      title: 'ระยะเวลา',
      dataIndex: 'estimatedDuration',
      key: 'estimatedDuration',
      width: 110,
      render: (val: string) => (
        <span style={{ fontSize: 11, color: isDarkMode ? '#94a3b8' : '#595959' }}>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {val || '-'}
        </span>
      ),
    },
    {
      title: 'ขั้นตอน & คู่มือ SOP',
      key: 'stepCounts',
      width: 140,
      render: (_: any, record: JobWorkflow) => {
        const total = record.stepCount || 0;
        const ready = record.sopReadyCount || 0;
        return (
          <div style={{ fontSize: 11 }}>
            <div>👣 {total} ขั้นตอน</div>
            <div style={{ color: ready === total && total > 0 ? '#52c41a' : '#d97706', fontSize: 10.5 }}>
              <BookOutlined style={{ marginRight: 3 }} />
              {ready}/{total} มีคู่มือ
            </div>
          </div>
        );
      },
    },
    {
      title: 'ความพร้อม',
      key: 'completionRate',
      width: 110,
      align: 'center' as const,
      render: (_: any, record: JobWorkflow) => {
        const rate = record.completionRate || 0;
        return (
          <div style={{ width: 85, margin: '0 auto' }}>
            <Progress
              percent={rate}
              size="small"
              strokeColor={rate === 100 ? '#52c41a' : rate > 50 ? primaryColor : '#faad14'}
            />
          </div>
        );
      },
    },
    {
      title: 'จัดการ',
      key: 'actions',
      width: isAuthenticated ? 130 : 65,
      align: 'center' as const,
      fixed: 'right' as const,
      render: (_: any, record: JobWorkflow) => (
        <Space size={2}>
          <Tooltip title="เปิดผังสายงาน (Mindmap Flowchart)">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined style={{ color: '#1677ff', fontSize: 13 }} />}
              onClick={() => navigate(`/workflows/${record.id}`)}
              style={{ width: 26, height: 26, padding: 0 }}
            />
          </Tooltip>

          {isAuthenticated && (
            <>
              <Tooltip title="แก้ไขข้อมูลสายงาน">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined style={{ color: '#fa8c16', fontSize: 13 }} />}
                  onClick={() => handleOpenModal(record)}
                  style={{ width: 26, height: 26, padding: 0 }}
                />
              </Tooltip>
              {isAdmin && (
                <Tooltip title="ลบสายงาน">
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
            <Title level={5} style={{ margin: 0, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ApartmentOutlined style={{ color: '#0284c7' }} />
              สายงานและกระบวนการปฏิบัติการ (Job Workflows)
            </Title>
            <Text type="secondary" style={{ fontSize: 11.5 }}>
              แผนผังสายงานร้อยเรียงคู่มือขั้นตอนปฏิบัติงานแบบ End-to-End Operation Flowcharts
            </Text>
          </Col>
          <Col>
            <Space size={8}>
              <Radio.Group
                size="small"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="table">
                  <BarsOutlined style={{ marginRight: 4 }} /> ตาราง
                </Radio.Button>
                <Radio.Button value="grid">
                  <AppstoreOutlined style={{ marginRight: 4 }} /> การ์ด
                </Radio.Button>
              </Radio.Group>

              {isAdmin && (
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => handleOpenModal()}
                  style={{ borderRadius: 4, fontWeight: 500 }}
                >
                  สร้างสายงานใหม่
                </Button>
              )}
            </Space>
          </Col>
        </Row>

        {/* Filter Controls */}
        <Row gutter={[8, 8]} align="middle">
          <Col xs={24} sm={14} md={16}>
            <Input
              size="small"
              placeholder="ค้นหาชื่อสายงาน, รหัสสายงาน เช่น WF-IMP-FOOD..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={10} md={8}>
            <Select
              size="small"
              style={{ width: '100%' }}
              placeholder="ทุกหมวดหมู่"
              allowClear
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categories?.map((c) => ({
                value: c.id,
                label: `${c.icon} ${c.name}`,
              }))}
            />
          </Col>
        </Row>
      </Card>

      {/* Content Rendering */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="กำลังโหลดสายงานปฏิบัติการ..." />
        </div>
      ) : error ? (
        <Alert type="error" message="ไม่สามารถโหลดข้อมูลสายงานได้" showIcon />
      ) : filteredWorkflows && filteredWorkflows.length === 0 ? (
        <Card
          size="small"
          style={{
            textAlign: 'center',
            padding: '30px 0',
            borderRadius: 8,
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
            background: isDarkMode ? '#1a1d21' : '#fff',
          }}
        >
          <Empty description="ไม่พบสายงานที่ตรงกับเงื่อนไขการค้นหา" />
          {selectedCategory && (
            <Button size="small" type="primary" onClick={() => setSelectedCategory(null)} style={{ marginTop: 12 }}>
              ล้างตัวกรองหมวดหมู่
            </Button>
          )}
        </Card>
      ) : viewMode === 'table' ? (
        /* Table View */
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
            dataSource={filteredWorkflows}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 1000 }}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredWorkflows?.length || 0,
              showSizeChanger: true,
              pageSizeOptions: ['5', '10', '20', '50'],
              showTotal: (total, range) => `แสดง ${range[0]}-${range[1]} จาก ${total} สายงาน`,
              onChange: (page, newPageSize) => {
                setCurrentPage(page);
                if (newPageSize && newPageSize !== pageSize) {
                  setPageSize(newPageSize);
                }
              },
              style: { padding: '8px 12px', margin: 0 },
              size: 'small',
            }}
            size="small"
          />
        </Card>
      ) : (
        /* Grid Card View */
        <Row gutter={[16, 16]}>
          {filteredWorkflows?.map((wf) => (
            <Col key={wf.id} xs={24} sm={12} md={8} lg={6} style={{ display: 'flex' }}>
              <WorkflowCard workflow={wf} />
            </Col>
          ))}
        </Row>
      )}

      {/* Create / Edit Workflow Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ApartmentOutlined style={{ color: '#0284c7' }} />
            <span>{editingWorkflow ? 'แก้ไขข้อมูลสายงานปฏิบัติการ' : 'สร้างสายงานปฏิบัติการใหม่'}</span>
          </div>
        }
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="บันทึกข้อมูล"
        cancelText="ยกเลิก"
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" size="small" style={{ marginTop: 14 }}>
          <Row gutter={12}>
            <Col span={10}>
              <Form.Item
                name="code"
                label="รหัสสายงาน (Code)"
                rules={[{ required: true, message: 'กรุณาระบุรหัสสายงาน' }]}
              >
                <Input placeholder="เช่น WF-IMP-FOOD" />
              </Form.Item>
            </Col>
            <Col span={14}>
              <Form.Item
                name="categoryId"
                label="หมวดหมู่หลัก"
                rules={[{ required: true, message: 'กรุณาเลือกหมวดหมู่' }]}
              >
                <Select
                  placeholder="เลือกหมวดหมู่"
                  options={categories?.map((c) => ({
                    value: c.id,
                    label: `${c.icon} ${c.name}`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="title"
            label="ชื่อสายงานปฏิบัติการ (Title)"
            rules={[{ required: true, message: 'กรุณาระบุชื่อสายงาน' }]}
          >
            <Input placeholder="เช่น สายงานการผ่านพิธีการนำเข้าสินค้าอาหารและพืชแปรรูป" />
          </Form.Item>

          <Form.Item name="description" label="คำอธิบายสรุปภาพรวม (Overview)">
            <Input.TextArea
              rows={3}
              placeholder="อธิบายกระบวนการโดยย่อตั้งแต่เริ่มต้นจนจบขั้นตอนการทำงาน..."
            />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="estimatedDuration" label="ระยะเวลาดำเนินการโดยประมาณ">
                <Input placeholder="เช่น 1-2 วันทำการ, 3-5 ชั่วโมง" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="targetAudience" label="ผู้รับผิดชอบหลัก">
                <Input placeholder="เช่น พนักงานชิปปิ้ง / หน้าด่าน" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="status" label="สถานะการใช้งาน" initialValue="active">
            <Radio.Group>
              <Radio value="active">เปิดใช้งาน (Active)</Radio>
              <Radio value="draft">แบบร่าง (Draft)</Radio>
              <Radio value="archived">เก็บถาวร (Archived)</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
