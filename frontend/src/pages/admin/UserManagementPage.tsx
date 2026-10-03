import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Typography,
  message,
  Row,
  Col,
  Switch,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  KeyOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useUsers } from '../../hooks/queries';
import { useCreateUser, useUpdateUser, useDeleteUser } from '../../hooks/mutations';
import { authService } from '../../services/auth';
import { User } from '../../types';

const { Title, Text } = Typography;

export const UserManagementPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const { data: users, isLoading } = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const currentUser = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      form.setFieldsValue({
        username: user.username,
        displayName: user.displayName,
        fullName: user.fullName || user.displayName,
        role: user.role,
        isActive: user.isActive !== false,
        password: '', // clear password on edit
      });
    } else {
      setEditingUser(null);
      form.resetFields();
      form.setFieldsValue({
        role: 'user',
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload: any = {
        displayName: values.displayName.trim(),
        fullName: (values.fullName || values.displayName).trim(),
        role: values.role,
        isActive: values.isActive,
      };

      if (!editingUser) {
        payload.username = values.username.trim();
        payload.password = values.password;
        await createMutation.mutateAsync(payload);
        message.success('เพิ่มผู้ใช้งานใหม่สำเร็จ');
      } else {
        if (values.password && values.password.trim().length > 0) {
          payload.password = values.password;
        }
        await updateMutation.mutateAsync({ id: editingUser.id, data: payload });

        // If the edited user is the current logged in user, update localStorage state immediately
        if (currentUser && currentUser.id === editingUser.id) {
          authService.updateCurrentUser({
            displayName: payload.displayName,
            fullName: payload.fullName,
            role: payload.role,
          });
        }
        message.success('แก้ไขข้อมูลผู้ใช้งานสำเร็จ');
      }
      setModalOpen(false);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDelete = (id: number, username: string, displayName: string) => {
    if (currentUser?.id === id) {
      message.warning('ไม่สามารถลบบัญชีผู้ใช้งานที่กำลังเข้าสู่ระบบอยู่ได้');
      return;
    }

    Modal.confirm({
      title: 'ยืนยันการลบบัญชีผู้ใช้งาน',
      content: `คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี "${displayName} (${username})"? การกระทำนี้ไม่สามารถย้อนกลับได้`,
      okText: 'ลบผู้ใช้งาน',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          message.success('ลบบัญชีผู้ใช้งานสำเร็จ');
        } catch (err: any) {
          message.error(err.response?.data?.error || 'ไม่สามารถลบผู้ใช้งานได้');
        }
      },
    });
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 45,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (
        <span style={{ color: '#8c8c8c', fontSize: 11.5 }}>{index + 1}</span>
      ),
    },
    {
      title: 'ชื่อผู้ใช้งาน (Username)',
      dataIndex: 'username',
      key: 'username',
      width: 140,
      render: (uname: string, record: User) => (
        <Space direction="vertical" size={1}>
          <Space direction="horizontal" size={4}>
            <Tag color="geekblue" style={{ fontWeight: 600, margin: 0, fontSize: 11.5 }}>
              {uname}
            </Tag>
            {record.id === currentUser?.id && (
              <Tag color="purple" style={{ fontSize: 10, margin: 0, padding: '0 4px' }}>
                บัญชีคุณ
              </Tag>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: 'ชื่อที่แสดง (Display Name)',
      dataIndex: 'displayName',
      key: 'displayName',
      width: 170,
      render: (name: string) => (
        <span style={{ fontWeight: 500, color: '#0f172a', fontSize: 12.5 }}>{name}</span>
      ),
    },
    {
      title: 'ชื่อ - นามสกุล เต็ม / ผู้จัดทำ SOP (Full Name)',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 220,
      render: (fullName: string, record: User) => (
        <div>
          <span style={{ color: '#1e293b', fontSize: 12.5 }}>
            {fullName || record.displayName}
          </span>
          <div style={{ fontSize: 10.5, color: '#64748b' }}>
            แสดงในช่อง &quot;ผู้จัดทำ SOP&quot;
          </div>
        </div>
      ),
    },
    {
      title: 'บทบาท (Role)',
      dataIndex: 'role',
      key: 'role',
      width: 130,
      render: (role: string) => {
        const isAdminRole = role === 'admin';
        return (
          <Tag
            color={isAdminRole ? 'gold' : 'blue'}
            icon={isAdminRole ? <SafetyCertificateOutlined /> : <UserOutlined />}
            style={{ fontWeight: 500, margin: 0, fontSize: 11 }}
          >
            {isAdminRole ? 'ผู้ดูแลระบบ (Admin)' : 'พนักงาน (User)'}
          </Tag>
        );
      },
    },
    {
      title: 'สถานะ',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center' as const,
      render: (active: boolean) => (
        <Tag color={active !== false ? 'success' : 'default'} style={{ margin: 0, fontSize: 11 }}>
          {active !== false ? 'ใช้งานอยู่' : 'ระงับการใช้งาน'}
        </Tag>
      ),
    },
    {
      title: 'จัดการ',
      key: 'action',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: User) => {
        const isSelf = record.id === currentUser?.id;
        return (
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
              <Tooltip title={isSelf ? 'ไม่สามารถลบบัญชีของคุณเองได้' : 'ลบบัญชีผู้ใช้งาน'}>
                <Button
                  type="text"
                  danger
                  size="small"
                  disabled={isSelf}
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record.id, record.username, record.displayName)}
                >
                  ลบ
                </Button>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
        <Col>
          <Title level={5} style={{ margin: 0, fontSize: 14 }}>
            จัดการผู้ใช้งานในระบบ (User Management)
          </Title>
          <Text type="secondary" style={{ fontSize: 11.5 }}>
            จัดการรายชื่อ บัญชีผู้ใช้งาน สิทธิ์การเข้าถึง และแก้ไขชื่อ-นามสกุลสำหรับแสดงเป็นผู้จัดทำ SOP ในเอกสาร
          </Text>
        </Col>
        <Col>
          {isAdmin && (
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
            >
              เพิ่มผู้ใช้งานใหม่
            </Button>
          )}
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={isLoading}
        size="small"
        scroll={{ x: 860 }}
        pagination={false}
      />

      {/* Add / Edit Modal */}
      <Modal
        title={
          editingUser ? (
            <span>
              แก้ไขข้อมูลผู้ใช้งาน: <Tag color="geekblue">{editingUser.username}</Tag>
            </span>
          ) : (
            'เพิ่มผู้ใช้งานใหม่'
          )
        }
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="บันทึก"
        cancelText="ยกเลิก"
        destroyOnClose
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {!editingUser ? (
            <Form.Item
              name="username"
              label="ชื่อผู้ใช้งาน (Username สำหรับเข้าสู่ระบบ)"
              rules={[
                { required: true, message: 'กรุณาระบุ Username' },
                { min: 3, message: 'Username ต้องมีอย่างน้อย 3 ตัวอักษร' },
                {
                  pattern: /^[a-zA-Z0-9._-]+$/,
                  message: 'ใช้ตัวอักษรภาษาอังกฤษ ตัวเลข จุด หรือขีดเท่านั้น',
                },
              ]}
            >
              <Input prefix={<UserOutlined style={{ color: '#8c8c8c' }} />} placeholder="เช่น somkiat, user01" />
            </Form.Item>
          ) : (
            <Form.Item label="ชื่อผู้ใช้งาน (Username)">
              <Input
                prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                value={editingUser.username}
                disabled
              />
            </Form.Item>
          )}

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="displayName"
                label="ชื่อที่แสดง (Display Name)"
                rules={[{ required: true, message: 'กรุณาระบุชื่อที่แสดง' }]}
                tooltip="ชื่อสั้นที่แสดงในแถบเมนูด้านบน"
              >
                <Input placeholder="เช่น สมเกียรติ สุวรรณสิทธิ์" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="สิทธิ์การใช้งาน (Role)"
                rules={[{ required: true, message: 'กรุณาเลือกบทบาท' }]}
              >
                <Select
                  options={[
                    { value: 'admin', label: '👑 ผู้ดูแลระบบ (Admin)' },
                    { value: 'user', label: '👤 พนักงานทั่วไป (User)' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="fullName"
            label="ชื่อ - นามสกุล เต็ม / ผู้จัดทำเอกสาร SOP (Full Name)"
            rules={[{ required: true, message: 'กรุณาระบุชื่อ-นามสกุล' }]}
            extra={
              <span style={{ fontSize: 11, color: '#1677ff' }}>
                <InfoCircleOutlined style={{ marginRight: 4 }} />
                ชื่อนี้จะถูกนำไปแสดงเป็น <b>&quot;ผู้จัดทำ: [ชื่อที่ระบุ]&quot;</b> ในเอกสาร A4 SOP และหน้าคู่มือปฏิบัติงาน
              </span>
            }
          >
            <Input placeholder="เช่น สมเกียรติ สุวรรณสิทธิ์ (Admin) หรือ กานต์ ประดิษฐ์วงษ์ (Kan)" />
          </Form.Item>

          <Form.Item
            name="password"
            label={editingUser ? 'รหัสผ่านใหม่ (Password)' : 'รหัสผ่าน (Password)'}
            rules={
              !editingUser
                ? [{ required: true, message: 'กรุณาระบุรหัสผ่านอย่างน้อย 4 ตัวอักษร', min: 4 }]
                : [{ min: 4, message: 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร' }]
            }
            extra={editingUser ? 'เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่านเดิม' : undefined}
          >
            <Input.Password
              prefix={<KeyOutlined style={{ color: '#8c8c8c' }} />}
              placeholder={editingUser ? 'ปล่อยว่างไว้เพื่อใช้รหัสเดิม' : 'ระบุรหัสผ่านอย่างน้อย 4 ตัวอักษร'}
            />
          </Form.Item>

          <Form.Item name="isActive" label="สถานะการใช้งานบัญชี" valuePropName="checked">
            <Switch
              checkedChildren="เปิดใช้งาน"
              unCheckedChildren="ระงับการใช้งาน"
              defaultChecked
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
