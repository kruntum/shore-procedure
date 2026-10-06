import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Switch, Tag, Typography, message, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined, GlobalOutlined, PhoneOutlined } from '@ant-design/icons';
import { useGovernmentAgencies } from '../../hooks/queries';
import { useCreateGovAgency, useUpdateGovAgency, useDeleteGovAgency } from '../../hooks/mutations';
import { authService } from '../../services/auth';
import { GovernmentAgency } from '../../types';

const { Title, Text } = Typography;

export const GovAgencyManagementPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GovernmentAgency | null>(null);
  const [form] = Form.useForm();

  const { data: agencies, isLoading } = useGovernmentAgencies();
  const createMutation = useCreateGovAgency();
  const updateMutation = useUpdateGovAgency();
  const deleteMutation = useDeleteGovAgency();
  const isAdmin = authService.isAdmin();

  const handleOpenModal = (item?: GovernmentAgency) => {
    if (item) {
      setEditingItem(item);
      form.setFieldsValue(item);
    } else {
      setEditingItem(null);
      form.resetFields();
      form.setFieldsValue({ isActive: true });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await updateMutation.mutateAsync({ id: editingItem.id, data: values });
        message.success('แก้ไขข้อมูลหน่วยงานสำเร็จ');
      } else {
        await createMutation.mutateAsync(values);
        message.success('เพิ่มหน่วยงานใหม่สำเร็จ');
      }
      setModalOpen(false);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'ยืนยันการลบหน่วยงาน',
      content: 'คุณแน่ใจหรือไม่ว่าต้องการลบหน่วยงานนี้? การลบอาจส่งผลกระทบต่อคู่มือที่เชื่อมโยงอยู่',
      okText: 'ลบข้อมูล',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          message.success('ลบหน่วยงานสำเร็จ');
        } catch (err: any) {
          message.error(err.response?.data?.error || 'ไม่สามารถลบได้');
        }
      },
    });
  };

  const columns = [
    {
      title: 'รหัสหน่วยงาน',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      render: (code: string) => (
        <Tag color="cyan" style={{ fontWeight: 600 }}>
          {code}
        </Tag>
      ),
    },
    {
      title: 'ชื่อหน่วยงาน',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: GovernmentAgency) => (
        <div>
          <Space>
            <BankOutlined style={{ color: '#1677ff' }} />
            <Text strong>{name}</Text>
            {record.shortName && <Tag color="blue">{record.shortName}</Tag>}
          </Space>
          {record.contactInfo && (
            <div style={{ marginTop: 2 }}>
              <Text type="secondary" style={{ fontSize: 11.5 }}>
                <PhoneOutlined style={{ marginRight: 4 }} />
                {record.contactInfo}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'เว็บไซต์ / ระบบ e-Service',
      dataIndex: 'website',
      key: 'website',
      width: 220,
      render: (website?: string) =>
        website ? (
          <a href={website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12 }}>
            <GlobalOutlined style={{ marginRight: 4 }} />
            {website.replace(/^https?:\/\//, '')}
          </a>
        ) : (
          <Text type="secondary" style={{ fontSize: 11.5 }}>-</Text>
        ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 90,
      align: 'center' as const,
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'default'}>
          {active ? 'ใช้งาน' : 'ระงับ'}
        </Tag>
      ),
    },
    {
      title: 'จัดการ',
      key: 'action',
      width: 140,
      align: 'center' as const,
      render: (_: any, record: GovernmentAgency) => (
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
            หน่วยงานราชการ / องค์กรภายนอก (Government Agencies)
          </Title>
          <Text type="secondary" style={{ fontSize: 11.5 }}>
            รายชื่อหน่วยงานราชการ ด่านศุลกากร ด่านกักตรวจพืช/สัตว์ และผู้ออกใบอนุญาตนำเข้า-ส่งออก
          </Text>
        </Col>
        <Col>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            เพิ่มหน่วยงานใหม่
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={agencies}
        rowKey="id"
        loading={isLoading}
        size="small"
        scroll={{ x: 700 }}
        pagination={false}
      />

      {/* Add / Edit Modal */}
      <Modal
        title={editingItem ? 'แก้ไขข้อมูลหน่วยงาน' : 'เพิ่มหน่วยงานใหม่'}
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
                label="รหัสหน่วยงาน (Code)"
                rules={[
                  { required: true, message: 'กรุณาระบุรหัสหน่วยงาน' },
                  { pattern: /^[A-Z0-9_]+$/, message: 'ใช้ตัวพิมพ์ใหญ่ภาษาอังกฤษ ตัวเลข หรือ _ เช่น CUSTOMS_DEPT, DFT' },
                ]}
              >
                <Input placeholder="เช่น CUSTOMS_DEPT, DOA, ACFS" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="shortName" label="ชื่อย่อ">
                <Input placeholder="เช่น ศุลกากร, อย., มกอช." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="name"
            label="ชื่อหน่วยงานเต็ม"
            rules={[{ required: true, message: 'กรุณาระบุชื่อหน่วยงาน' }]}
          >
            <Input placeholder="เช่น กรมศุลกากร, กรมการค้าต่างประเทศ กระทรวงพาณิชย์" />
          </Form.Item>

          <Form.Item name="website" label="เว็บไซต์ / ลิงก์ระบบ e-Service">
            <Input placeholder="เช่น https://www.customs.go.th" />
          </Form.Item>

          <Form.Item name="contactInfo" label="ข้อมูลการติดต่อ / สายด่วน / ที่ตั้ง">
            <Input.TextArea rows={2} placeholder="เช่น Call Center 1164 หรือ อาคาร 1 ชั้น 2 ด่านตรวจพืชแหลมฉบัง" />
          </Form.Item>

          <Form.Item name="isActive" label="สถานะเปิดใช้งาน" valuePropName="checked">
            <Switch checkedChildren="เปิด" unCheckedChildren="ปิด" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
