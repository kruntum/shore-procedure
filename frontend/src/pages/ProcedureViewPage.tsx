import React from 'react';
import { Card, Typography, Space, Tag, Button, Breadcrumb, Spin, Empty, Divider, Row, Col, Modal, message } from 'antd';
import {
  PrinterOutlined,
  EditOutlined,
  CopyOutlined,
  ArrowLeftOutlined,
  CompassOutlined,
  TeamOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useProcedure } from '../hooks/queries';
import { useDuplicateProcedure } from '../hooks/mutations';
import { VariantTabs } from '../components/VariantTabs';
import { SOPPrintModal } from '../components/SOPPrintModal';
import { authService } from '../services/auth';

const { Title, Text, Paragraph } = Typography;

export const ProcedureViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const procedureId = parseInt(id || '0');

  const { data: proc, isLoading } = useProcedure(procedureId);
  const duplicateMutation = useDuplicateProcedure();
  const isAuthenticated = authService.isAuthenticated();
  const [printModalOpen, setPrintModalOpen] = React.useState(false);

  const handlePrint = () => {
    setPrintModalOpen(true);
  };

  const handleDuplicate = () => {
    if (!proc) return;
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

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Spin size="large" tip="กำลังโหลดขั้นตอนคู่มือ..." />
      </div>
    );
  }

  if (!proc) {
    return <Empty description="ไม่พบคู่มือที่ระบุ" />;
  }

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <a onClick={() => navigate('/')}>หน้าหลัก</a> },
          { title: <a onClick={() => navigate(`/ports/${proc.port?.id}`)}>{proc.port?.code}</a> },
          {
            title:
              proc.agents && proc.agents.length > 0
                ? proc.agents.map((a) => a.code).join(', ')
                : proc.agent?.code,
          },
          { title: 'คู่มือขั้นตอน' },
        ]}
      />

      {/* Header Card */}
      <Card style={{ marginBottom: 16, borderRadius: 8 }}>
        <Row justify="space-between" align="top" gutter={[16, 16]}>
          <Col xs={24} md={18}>
            <Space align="start" size="middle">
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
              <div>
                <Space wrap style={{ marginBottom: 8 }}>
                  <Tag color="blue" icon={<CompassOutlined />}>
                    ท่าเรือ: {proc.port?.code} ({proc.port?.name})
                  </Tag>
                  {proc.agents && proc.agents.length > 0 ? (
                    proc.agents.map((ag) => (
                      <Tag color="green" icon={<TeamOutlined />} key={ag.id}>
                        สายเรือ: {ag.code} ({ag.name})
                      </Tag>
                    ))
                  ) : proc.agent ? (
                    <Tag color="green" icon={<TeamOutlined />}>
                      สายเรือ: {proc.agent.code} ({proc.agent.name})
                    </Tag>
                  ) : null}
                  <Tag color="purple">
                    {proc.workType?.name}
                  </Tag>
                </Space>

                <Title level={4} style={{ margin: '4px 0', color: '#1f1f1f' }}>
                  {proc.title}
                </Title>

                {proc.description && (
                  <Paragraph type="secondary" style={{ margin: '6px 0 0', fontSize: 13 }}>
                    {proc.description}
                  </Paragraph>
                )}

                {proc.referenceDocuments && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#4b5563' }}>
                    <Text strong>เอกสารอ้างอิง: </Text>
                    <span>{proc.referenceDocuments}</span>
                  </div>
                )}

                <div style={{ marginTop: 8, fontSize: 11, color: '#8c8c8c' }}>
                  อัปเดตล่าสุด: {proc.updatedAt ? new Date(proc.updatedAt).toLocaleDateString('th-TH') : '-'} โดย {proc.updatedBy || 'ผู้ดูแลระบบ'}
                </div>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={10} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                พิมพ์เอกสาร A4 (Print SOP)
              </Button>
              {isAuthenticated && (
                <>
                  <Button
                    icon={<CopyOutlined />}
                    loading={duplicateMutation.isPending}
                    onClick={handleDuplicate}
                  >
                    คัดลอกคู่มือ
                  </Button>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/admin/procedures/${proc.id}/edit`)}
                  >
                    แก้ไข
                  </Button>
                </>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Operating Guidelines & Steps */}
      <Card style={{ borderRadius: 8 }}>
        <Title level={5} style={{ marginBottom: 12 }}>
          เงื่อนไขและลำดับขั้นตอนการปฏิบัติงาน
        </Title>
        <VariantTabs variants={proc.variants} />
      </Card>

      {/* A4 SOP Print & PDF Modal */}
      <SOPPrintModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        procedure={proc}
      />
    </div>
  );
};
