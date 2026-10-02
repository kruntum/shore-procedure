import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, Tag, Typography, message, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { usePorts } from '../../hooks/queries';
import { useCreatePort, useUpdatePort, useDeletePort } from '../../hooks/mutations';
import { authService } from '../../services/auth';
import { Port } from '../../types';

const { Title, Text } = Typography;

export const PortManagementPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<Port | null>(null);
  const [form] = Form.useForm();

  const { data: ports, isLoading } = usePorts();
  const createMutation = useCreatePort();
  const updateMutation = useUpdatePort();
  const deleteMutation = useDeletePort();
  const isAdmin = authService.isAdmin();

  const handleOpenModal = (port?: Port) => {
    if (port) {
      setEditingPort(port);
      form.setFieldsValue(port);
    } else {
      setEditingPort(null);
      form.resetFields();
      form.setFieldsValue({ paymentMethod: 'ออนไลน์', operatingHours: '24 ชม.' });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingPort) {
        await updateMutation.mutateAsync({ id: editingPort.id, data: values });
        message.success('แก้ไขข้อมูลท่าเรือสำเร็จ');
      } else {
        await createMutation.mutateAsync(values);
        message.success('เพิ่มท่าเรือใหม่สำเร็จ');
      }
      setModalOpen(false);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'ยืนยันการลบ',
      content: 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลท่าเรือนี้?',
      okText: 'ลบ',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          message.success('ลบท่าเรือสำเร็จ');
        } catch (err: any) {
          message.error(err.response?.data?.error || 'ไม่สามารถลบได้');
        }
      },
    });
  };

  const columns = [
    {
      title: 'รหัสท่า (Code)',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => <Tag color="blue" style={{ fontWeight: 'bold' }}>{code}</Tag>,
    },
    {
      title: 'ชื่อท่าเรือ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'วิธีชำระเงิน',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 160,
      render: (method: string) => (
        <Tag color={method === 'หน้าเคาน์เตอร์เท่านั้น' ? 'error' : 'success'}>
          {method}
        </Tag>
      ),
    },
    {
      title: 'เวลาทำการ',
      dataIndex: 'operatingHours',
      key: 'operatingHours',
      width: 200,
    },
    {
      title: 'หมายเหตุ',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes: string) => notes ? <span style={{ color: '#d46b08', fontSize: 12 }}>{notes}</span> : '-',
    },
    {
      title: 'จัดการ',
      key: 'actions',
      width: 110,
      render: (_: any, record: Port) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          />
          {isAdmin && (
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            จัดการรายชื่อท่าเรือ (Ports)
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            กำหนดรหัสท่าเรือ วิธีการชำระ และเวลาเปิดให้บริการ
          </Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            เพิ่มท่าเรือใหม่
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={ports}
        rowKey="id"
        loading={isLoading}
        size="small"
        pagination={{ pageSize: 12 }}
      />

      <Modal
        title={editingPort ? 'แก้ไขข้อมูลท่าเรือ' : 'เพิ่มท่าเรือใหม่'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="code"
            label="รหัสท่าเรือ (เช่น A2, B2, C1C2)"
            rules={[{ required: true, message: 'กรุณากรอกรหัสท่าเรือ' }]}
          >
            <Input placeholder="เช่น A2" disabled={!!editingPort} />
          </Form.Item>

          <Form.Item
            name="name"
            label="ชื่อท่าเรือ"
            rules={[{ required: true, message: 'กรุณากรอกชื่อท่าเรือ' }]}
          >
            <Input placeholder="เช่น ท่าเรือ A2" />
          </Form.Item>

          <Form.Item
            name="paymentMethod"
            label="วิธีการชำระเงิน"
            rules={[{ required: true, message: 'กรุณาเลือกวิธีการชำระ' }]}
          >
            <Select
              options={[
                { value: 'ออนไลน์', label: 'ออนไลน์' },
                { value: 'หน้าเคาน์เตอร์เท่านั้น', label: 'หน้าเคาน์เตอร์เท่านั้น' },
                { value: 'ออนไลน์ / หน้าเคาน์เตอร์', label: 'ออนไลน์ / หน้าเคาน์เตอร์' },
              ]}
            />
          </Form.Item>

          <Form.Item name="operatingHours" label="เวลาเปิดให้บริการ">
            <Input placeholder="เช่น 24 ชม. หรือ 08:00-19:30" />
          </Form.Item>

          <Form.Item name="notes" label="หมายเหตุ / ข้อควรระวังพิเศษ">
            <Input.TextArea placeholder="เช่น รอดราฟ ช้า หรือ ปิดเคาน์เตอร์ 2 ช่วงเวลา..." rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
