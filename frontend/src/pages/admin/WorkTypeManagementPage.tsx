import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Tag, Typography, message, Row, Col, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useWorkTypes } from '../../hooks/queries';
import { useCreateWorkType, useUpdateWorkType, useDeleteWorkType } from '../../hooks/mutations';
import { authService } from '../../services/auth';
import { WorkType } from '../../types';

const { Title, Text } = Typography;

export const WorkTypeManagementPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkType | null>(null);
  const [form] = Form.useForm();

  const { data: workTypes, isLoading } = useWorkTypes();
  const createMutation = useCreateWorkType();
  const updateMutation = useUpdateWorkType();
  const deleteMutation = useDeleteWorkType();
  const isAdmin = authService.isAdmin();

  const handleOpenModal = (item?: WorkType) => {
    if (item) {
      setEditingItem(item);
      form.setFieldsValue(item);
    } else {
      setEditingItem(null);
      form.resetFields();
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, data: values });
        message.success('แก้ไขข้อมูลประเภทงานสำเร็จ');
      } else {
        await createMutation.mutateAsync(values);
        message.success('เพิ่มประเภทงานใหม่สำเร็จ');
      }
      setModalOpen(false);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'ยืนยันการลบประเภทงาน',
      content: 'คุณแน่ใจหรือไม่ว่าต้องการลบประเภทงานนี้? การลบอาจส่งผลกระทบต่อคู่มือที่เชื่อมโยงอยู่',
      okText: 'ลบข้อมูล',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          message.success('ลบประเภทงานสำเร็จ');
        } catch (err: any) {
          message.error(err.response?.data?.error || 'ไม่สามารถลบได้');
        }
      },
    });
  };

  const columns = [
    {
      title: 'รหัสประเภทงาน (Code)',
      dataIndex: 'code',
      key: 'code',
      width: 180,
      render: (code: string) => (
        <Tag color="purple" style={{ fontWeight: 500, fontSize: 11, height: 20, lineHeight: '18px' }}>
          {code}
        </Tag>
      ),
    },
    {
      title: 'ชื่อประเภทงาน',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span style={{ fontSize: 11, color: '#0f172a' }}>{name}</span>,
    },
    {
      title: 'จัดการ',
      key: 'action',
      width: 85,
      align: 'center' as const,
      render: (_: any, record: WorkType) => (
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
      <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
        <Col>
          <Title level={5} style={{ margin: 0, fontSize: 14 }}>
            ประเภทงาน (Work Types)
          </Title>
          <Text type="secondary" style={{ fontSize: 11.5 }}>
            ประเภทงานหลักที่ใช้เชื่อมโยงกับคู่มือปฏิบัติงาน (เช่น จ่ายชอร์, วางบิล/มัดจำตู้)
          </Text>
        </Col>
        <Col>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            เพิ่มประเภทงานใหม่
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={workTypes}
        rowKey="id"
        loading={isLoading}
        size="small"
        scroll={{ x: 600 }}
        pagination={false}
      />

      {/* Add / Edit Modal */}
      <Modal
        title={editingItem ? 'แก้ไขประเภทงาน' : 'เพิ่มประเภทงานใหม่'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="บันทึก"
        cancelText="ยกเลิก"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="code"
            label="รหัสประเภทงาน (Code)"
            rules={[
              { required: true, message: 'กรุณาระบุรหัสประเภทงาน' },
              { pattern: /^[A-Z0-9_]+$/, message: 'ใช้ตัวพิมพ์ใหญ่ภาษาอังกฤษ ตัวเลข หรือ _ เท่านั้น เช่น SHORE_PAY' },
            ]}
          >
            <Input placeholder="เช่น SHORE_PAY, CUSTOMS_CLEAR" />
          </Form.Item>
          <Form.Item
            name="name"
            label="ชื่อประเภทงาน"
            rules={[{ required: true, message: 'กรุณาระบุชื่อประเภทงาน' }]}
          >
            <Input placeholder="เช่น จ่ายชอร์, วางบิล/มัดจำตู้, ตรวจปล่อยสินค้า" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
