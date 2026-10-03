import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Tag, Typography, message, Row, Col, Tooltip } from 'antd';
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
      width: 50,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (
        <span style={{ fontSize: 11, color: '#64748b' }}>{index + 1}</span>
      ),
    },
    {
      title: 'รหัสสายเรือ (Short Name)',
      dataIndex: 'code',
      key: 'code',
      width: 160,
      render: (code: string) => (
        <Tag color="cyan" style={{ fontWeight: 500, fontSize: 11, height: 20, lineHeight: '18px' }}>
          {code}
        </Tag>
      ),
    },
    {
      title: 'ชื่อเต็ม (Full Name)',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span style={{ fontSize: 11, color: '#0f172a' }}>{name}</span>,
    },
    {
      title: 'จัดการ',
      key: 'actions',
      width: 85,
      align: 'center' as const,
      render: (_: any, record: Agent) => (
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
            จัดการสายเรือ / เอเย่นต์ (Agents)
          </Title>
          <Text type="secondary" style={{ fontSize: 11.5 }}>
            รายชื่อตัวแทนสายการเดินเรือทั้งหมด {agents?.length || 0} รายการ
          </Text>
        </Col>
        <Col>
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            เพิ่มสายเรือใหม่
          </Button>
        </Col>
      </Row>

      <div style={{ marginBottom: 12, maxWidth: 280 }}>
        <Input
          placeholder="ค้นหารหัสหรือชื่อสายเรือ..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="small"
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredAgents}
        rowKey="id"
        loading={isLoading}
        size="small"
        scroll={{ x: 700 }}
        pagination={{ pageSize: 15, showSizeChanger: true, size: 'small' }}
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
