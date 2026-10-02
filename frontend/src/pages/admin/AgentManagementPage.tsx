import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Tag, Typography, message, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useAgents } from '../../hooks/queries';
import { useCreateAgent, useUpdateAgent, useDeleteAgent } from '../../hooks/mutations';
import { authService } from '../../services/auth';
import { Agent } from '../../types';

const { Title, Text } = Typography;

export const AgentManagementPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();

  const { data: agents, isLoading } = useAgents();
  const createMutation = useCreateAgent();
  const updateMutation = useUpdateAgent();
  const deleteMutation = useDeleteAgent();
  const isAdmin = authService.isAdmin();

  const filteredAgents = agents?.filter(
    (a) =>
      a.code.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (agent?: Agent) => {
    if (agent) {
      setEditingAgent(agent);
      form.setFieldsValue(agent);
    } else {
      setEditingAgent(null);
      form.resetFields();
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingAgent) {
        await updateMutation.mutateAsync({ id: editingAgent.id, data: values });
        message.success('แก้ไขข้อมูลสายเรือสำเร็จ');
      } else {
        await createMutation.mutateAsync(values);
        message.success('เพิ่มสายเรือใหม่สำเร็จ');
      }
      setModalOpen(false);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'ยืนยันการลบ',
      content: 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลสายเรือนี้?',
      okText: 'ลบ',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          message.success('ลบสายเรือสำเร็จ');
        } catch (err: any) {
          message.error(err.response?.data?.error || 'ไม่สามารถลบได้');
        }
      },
    });
  };

  const columns = [
    {
      title: 'ลำดับ',
      key: 'index',
      width: 70,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'รหัสสายเรือ (Short Name)',
      dataIndex: 'code',
      key: 'code',
      width: 160,
      render: (code: string) => <Tag color="cyan" style={{ fontWeight: 'bold' }}>{code}</Tag>,
    },
    {
      title: 'ชื่อเต็ม (Full Name)',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'จัดการ',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      align: 'center' as const,
      render: (_: any, record: Agent) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined style={{ color: '#d97706' }} />}
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
            จัดการสายเรือ / เอเย่นต์ (Agents)
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            รายชื่อตัวแทนสายการเดินเรือทั้งหมด {agents?.length || 0} รายการ
          </Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            เพิ่มสายเรือใหม่
          </Button>
        </Col>
      </Row>

      <div style={{ marginBottom: 12, maxWidth: 300 }}>
        <Input
          placeholder="ค้นหารหัสหรือชื่อสายเรือ..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="middle"
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredAgents}
        rowKey="id"
        loading={isLoading}
        size="middle"
        scroll={{ x: 750 }}
        pagination={{ pageSize: 15, showSizeChanger: true }}
      />

      <Modal
        title={editingAgent ? 'แก้ไขข้อมูลสายเรือ' : 'เพิ่มสายเรือใหม่'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="code"
            label="รหัสสายเรือ (เช่น WHL, ONE, EVERGREEN)"
            rules={[{ required: true, message: 'กรุณากรอกรหัสสายเรือ' }]}
          >
            <Input placeholder="เช่น WHL" disabled={!!editingAgent} />
          </Form.Item>

          <Form.Item
            name="name"
            label="ชื่อเต็มสายเรือ"
            rules={[{ required: true, message: 'กรุณากรอกชื่อเต็ม' }]}
          >
            <Input placeholder="เช่น WAN HAI LINES (THAILAND) LTD." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
