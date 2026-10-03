import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Tag,
  Typography,
  message,
  Row,
  Col,
  Tooltip,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRoles } from '../../hooks/queries';
import { useCreateRole, useUpdateRole, useDeleteRole } from '../../hooks/mutations';
import { authService } from '../../services/auth';
import { ResponsibleRole } from '../../types';
import { RoleTag } from '../../components/RoleTag';

const { Title, Text } = Typography;

const COLOR_OPTIONS = [
  { value: 'blue', label: 'น้ำเงิน (Blue)' },
  { value: 'volcano', label: 'ส้มอิฐ (Volcano)' },
  { value: 'cyan', label: 'ฟ้าคราม (Cyan)' },
  { value: 'purple', label: 'ม่วง (Purple)' },
  { value: 'gold', label: 'ทอง/ส้ม (Gold)' },
  { value: 'magenta', label: 'ชมพู (Magenta)' },
  { value: 'green', label: 'เขียว (Green)' },
  { value: 'geekblue', label: 'น้ำเงินเข้ม (Geekblue)' },
];

const EMOJI_OPTIONS = [
  { value: '👤', label: '👤 พนักงาน / บุคคล' },
  { value: '🏢', label: '🏢 สำนักงาน / ท่าเรือ' },
  { value: '🚢', label: '🚢 เรือ / เอเย่นต์' },
  { value: '💼', label: '💼 การเงิน / ออฟฟิศ' },
  { value: '🚚', label: '🚚 รถบรรทุก / ขนส่ง' },
  { value: '🏛️', label: '🏛️ ศุลกากร / หน่วยงานรัฐ' },
  { value: '🔍', label: '🔍 ผู้ตรวจสอบ / Surveyor' },
  { value: '📋', label: '📋 เจ้าหน้าที่เอกสาร' },
  { value: '⚙️', label: '⚙️ ช่าง / ฝ่ายปฏิบัติการ' },
];

export const RoleManagementPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<ResponsibleRole | null>(null);
  const [form] = Form.useForm();

  const { data: roles, isLoading } = useRoles();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();
  const isAdmin = authService.isAdmin();

  const handleOpenModal = (role?: ResponsibleRole) => {
    if (role) {
      setEditingRole(role);
      form.setFieldsValue(role);
    } else {
      setEditingRole(null);
      form.resetFields();
      form.setFieldsValue({
        color: 'blue',
        icon: '👤',
        sortOrder: (roles?.length || 0) + 1,
      });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingRole) {
        await updateMutation.mutateAsync({ id: editingRole.id, data: values });
        message.success('แก้ไขข้อมูลบทบาทสำเร็จ');
      } else {
        await createMutation.mutateAsync(values);
        message.success('เพิ่มบทบาทผู้รับผิดชอบใหม่สำเร็จ');
      }
      setModalOpen(false);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDelete = (id: number, name: string) => {
    Modal.confirm({
      title: 'ยืนยันการลบบทบาทผู้รับผิดชอบ',
      content: `คุณแน่ใจหรือไม่ว่าต้องการลบบทบาท "${name}"?`,
      okText: 'ลบข้อมูล',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          message.success('ลบบทบาทสำเร็จ');
        } catch (err: any) {
          message.error(err.response?.data?.error || 'ไม่สามารถลบได้');
        }
      },
    });
  };

  const columns = [
    {
      title: 'ลำดับ',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 50,
      align: 'center' as const,
      render: (order: number) => <span style={{ fontSize: 11, color: '#64748b' }}>{order}</span>,
    },
    {
      title: 'ไอคอน',
      dataIndex: 'icon',
      key: 'icon',
      width: 50,
      align: 'center' as const,
      render: (icon: string) => <span style={{ fontSize: 13 }}>{icon || '👤'}</span>,
    },
    {
      title: 'รหัสบทบาท (Code)',
      dataIndex: 'code',
      key: 'code',
      width: 130,
      render: (code: string) => (
        <Tag color="geekblue" style={{ fontWeight: 500, margin: 0, fontSize: 11, height: 20, lineHeight: '18px' }}>
          {code}
        </Tag>
      ),
    },
    {
      title: 'ชื่อบทบาท / ผู้รับผิดชอบ',
      dataIndex: 'name',
      key: 'name',
      width: 160,
      render: (name: string) => (
        <span style={{ color: '#0f172a', fontWeight: 400, fontSize: 11 }}>{name}</span>
      ),
    },
    {
      title: 'ตัวอย่างป้ายกำกับ',
      key: 'preview',
      width: 160,
      render: (_: any, record: ResponsibleRole) => <RoleTag role={record.name} />,
    },
    {
      title: 'คำอธิบายหน้าที่ความรับผิดชอบ',
      dataIndex: 'description',
      key: 'description',
      width: 260,
      render: (desc: string) => (
        <span style={{ color: '#64748b', fontSize: 10.5, lineHeight: 1.35, display: 'block' }}>
          {desc || '-'}
        </span>
      ),
    },
    {
      title: 'จัดการ',
      key: 'action',
      width: 85,
      align: 'center' as const,
      render: (_: any, record: ResponsibleRole) => (
        <Space size={4}>
          <Tooltip title="แก้ไข">
            <Button
              size="small"
              icon={<EditOutlined style={{ color: '#1677ff', fontSize: 12 }} />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          {isAdmin && (
            <Tooltip title="ลบ">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined style={{ fontSize: 12 }} />}
                onClick={() => handleDelete(record.id, record.name)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
        <Col>
          <Title level={5} style={{ margin: 0, fontSize: 14 }}>
            จัดการผู้รับผิดชอบ / บทบาท (Roles & Responsibilities)
          </Title>
          <Text type="secondary" style={{ fontSize: 11.5 }}>
            กำหนดบทบาท Master Data สำหรับเลือกเป็นผู้ดำเนินการในแต่ละขั้นตอนของคู่มือ SOP
          </Text>
        </Col>
        <Col>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            เพิ่มบทบาทใหม่
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={roles}
        rowKey="id"
        loading={isLoading}
        size="small"
        scroll={{ x: 860 }}
        pagination={false}
      />

      {/* Add / Edit Modal */}
      <Modal
        title={editingRole ? 'แก้ไขข้อมูลบทบาทผู้รับผิดชอบ' : 'เพิ่มบทบาทผู้รับผิดชอบใหม่'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="บันทึก"
        cancelText="ยกเลิก"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={14}>
              <Form.Item
                name="code"
                label="รหัสบทบาท (Code)"
                rules={[
                  { required: true, message: 'กรุณาระบุรหัสบทบาท' },
                  { pattern: /^[A-Z0-9_]+$/, message: 'ใช้ตัวพิมพ์ใหญ่ภาษาอังกฤษ ตัวเลข หรือ _' },
                ]}
              >
                <Input placeholder="เช่น SHIPPING_STAFF, SURVEYOR" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="icon" label="ไอคอน / อีโมจิ">
                <Select options={EMOJI_OPTIONS} placeholder="เลือกไอคอน" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="name"
            label="ชื่อบทบาท / ผู้รับผิดชอบ (Name)"
            rules={[{ required: true, message: 'กรุณาระบุชื่อบทบาท' }]}
          >
            <Input placeholder="เช่น เจ้าหน้าที่ตรวจสอบตู้ (Surveyor)" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={14}>
              <Form.Item name="color" label="โทนสีป้ายกำกับ (Tag Color)">
                <Select options={COLOR_OPTIONS} placeholder="เลือกสีแท็ก" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="sortOrder" label="ลำดับการแสดงผล">
                <InputNumber min={0} max={999} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="คำอธิบายขอบเขตหน้าที่ความรับผิดชอบ">
            <Input.TextArea
              placeholder="อธิบายหน้าที่ เช่น รับผิดชอบตรวจสอบสภาพตู้สินค้าก่อนนำออกจากท่า..."
              rows={2}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
