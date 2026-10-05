import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Tag, Typography, message, Row, Col, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCategories } from '../../hooks/queries';
import { useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/mutations';
import { authService } from '../../services/auth';
import { Category } from '../../types';

const { Title, Text } = Typography;

const COLOR_OPTIONS = [
  { value: 'blue', label: 'Blue (น้ำเงิน)' },
  { value: 'volcano', label: 'Volcano (ส้มแดง)' },
  { value: 'green', label: 'Green (เขียว)' },
  { value: 'orange', label: 'Orange (ส้ม)' },
  { value: 'purple', label: 'Purple (ม่วง)' },
  { value: 'cyan', label: 'Cyan (ฟ้าอมเขียว)' },
  { value: 'magenta', label: 'Magenta (ชมพูม่วง)' },
  { value: 'gold', label: 'Gold (ทอง)' },
];

export const CategoryManagementPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const isAdmin = authService.isAdmin();

  const handleOpenModal = (item?: Category) => {
    if (item) {
      setEditingItem(item);
      form.setFieldsValue(item);
    } else {
      setEditingItem(null);
      form.resetFields();
      form.setFieldsValue({ icon: '📋', color: 'blue', sortOrder: 0 });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, data: values });
        message.success('แก้ไขข้อมูลหมวดหมู่สำเร็จ');
      } else {
        await createMutation.mutateAsync(values);
        message.success('เพิ่มหมวดหมู่ใหม่สำเร็จ');
      }
      setModalOpen(false);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'ยืนยันการลบหมวดหมู่',
      content: 'คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้? คู่มือที่เคยผูกอยู่จะถูกปลดออกจากหมวดหมู่',
      okText: 'ลบข้อมูล',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          message.success('ลบหมวดหมู่สำเร็จ');
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
      width: 70,
      align: 'center' as const,
    },
    {
      title: 'ไอคอน',
      dataIndex: 'icon',
      key: 'icon',
      width: 70,
      align: 'center' as const,
      render: (icon: string) => <span style={{ fontSize: 18 }}>{icon}</span>,
    },
    {
      title: 'รหัสหมวดหมู่ (Code)',
      dataIndex: 'code',
      key: 'code',
      width: 180,
      render: (code: string, record: Category) => (
        <Tag color={record.color || 'blue'} style={{ fontWeight: 600 }}>
          {code}
        </Tag>
      ),
    },
    {
      title: 'ชื่อหมวดหมู่',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'จัดการ',
      key: 'action',
      width: 140,
      align: 'center' as const,
      render: (_: any, record: Category) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined style={{ color: '#1677ff' }} />}
            onClick={() => handleOpenModal(record)}
          >
            แก้ไข
          </Button>
          {isAdmin && (
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            >
              ลบ
            </Button>
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
            หมวดหมู่คู่มือ (Categories)
          </Title>
          <Text type="secondary" style={{ fontSize: 11.5 }}>
            จัดกลุ่มคู่มือขั้นตอนการทำงานตามสายงาน (เช่น งานหน้าท่าเรือ, พิธีการศุลกากร, ใบอนุญาตราชการ)
          </Text>
        </Col>
        <Col>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            เพิ่มหมวดหมู่ใหม่
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={isLoading}
        size="small"
        scroll={{ x: 600 }}
        pagination={false}
      />

      {/* Add / Edit Modal */}
      <Modal
        title={editingItem ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
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
            <Col span={16}>
              <Form.Item
                name="code"
                label="รหัสหมวดหมู่ (Code)"
                rules={[
                  { required: true, message: 'กรุณาระบุรหัสหมวดหมู่' },
                  { pattern: /^[A-Z0-9_]+$/, message: 'ใช้ตัวพิมพ์ใหญ่ภาษาอังกฤษ ตัวเลข หรือ _ เท่านั้น เช่น CUSTOMS' },
                ]}
              >
                <Input placeholder="เช่น CUSTOMS, PERMITS_CERTS" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="icon" label="ไอคอน (Emoji)">
                <Input placeholder="เช่น 🚢, 🏛️, 📜" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="name"
            label="ชื่อหมวดหมู่"
            rules={[{ required: true, message: 'กรุณาระบุชื่อหมวดหมู่' }]}
          >
            <Input placeholder="เช่น พิธีการศุลกากร, ใบอนุญาตและใบรับรอง" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="color" label="ธีมสี (Tag Color)">
                <Select options={COLOR_OPTIONS} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sortOrder" label="ลำดับการแสดงผล">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};
