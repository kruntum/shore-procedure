import React from 'react';
import { Card, Typography, Space, Tag, Button, Breadcrumb, Spin, Empty, Divider, Row, Col, Modal, message, Tooltip } from 'antd';
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

  const agentList =
    proc.agents && proc.agents.length > 0
      ? proc.agents
      : proc.agent
      ? [proc.agent]
      : [];

  const maxVisibleAgents = 4;
  const visibleAgents = agentList.slice(0, maxVisibleAgents);
  const remainingAgents = agentList.slice(maxVisibleAgents);

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <a onClick={() => navigate('/')}>หน้าหลัก</a> },
          { title: <a onClick={() => navigate(`/ports/${proc.port?.id}`)}>{proc.port?.code}</a> },
          {
            title:
              agentList.length > 0
                ? agentList.map((a) => a.code).join(', ')
                : 'ทุกสายเรือ',
          },
          { title: 'คู่มือขั้นตอน' },
        ]}
      />

      {/* Header Card */}
      <Card style={{ marginBottom: 16, borderRadius: 8 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {/* Left Title & Metadata */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 280 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              {/* Category & Metadata Tags */}
              <Space wrap size={[6, 6]} style={{ marginBottom: 6 }}>
                {proc.port && (
                  <Tag color="blue" icon={<CompassOutlined />} style={{ margin: 0 }}>
                    ท่าเรือ {proc.port.code} ({proc.port.name})
                  </Tag>
                )}
                {proc.workType && (
                  <Tag color="purple" style={{ margin: 0 }}>
                    {proc.workType.name}
                  </Tag>
                )}
                {/* Compact Agent Tags with Full Name in Tooltip */}
                {visibleAgents.map((ag) => (
                  <Tooltip key={ag.id} title={`สายเรือ: ${ag.code} - ${ag.name}`}>
                    <Tag color="cyan" icon={<TeamOutlined />} style={{ margin: 0, cursor: 'default' }}>
                      {ag.code}
                    </Tag>
                  </Tooltip>
                ))}
                {remainingAgents.length > 0 && (
                  <Tooltip title={remainingAgents.map((a) => `${a.code} - ${a.name}`).join(', ')}>
                    <Tag color="geekblue" style={{ margin: 0, cursor: 'pointer' }}>
                      +{remainingAgents.length} สายเรือ
                    </Tag>
                  </Tooltip>
                )}
              </Space>

              <Title level={4} style={{ margin: '4px 0 6px', color: '#1f1f1f', fontSize: 18 }}>
                {proc.title}
              </Title>

              {proc.description && (
                <Paragraph type="secondary" style={{ margin: '4px 0', fontSize: 13, color: '#4b5563' }}>
                  {proc.description}
                </Paragraph>
              )}

              {proc.referenceDocuments && (
                <div style={{ marginTop: 4, fontSize: 12, color: '#4b5563' }}>
                  <Text strong>เอกสารอ้างอิง: </Text>
                  <span>{proc.referenceDocuments}</span>
                </div>
              )}

              <div style={{ marginTop: 6, fontSize: 11, color: '#8c8c8c' }}>
                อัปเดตล่าสุด: {proc.updatedAt ? new Date(proc.updatedAt).toLocaleDateString('th-TH') : '-'} โดย {proc.updatedBy || 'ผู้ดูแลระบบ'}
              </div>
            </div>
          </div>

          {/* Right Action Buttons: Print SOP, Copy, Edit */}
          <Space wrap size="small" style={{ flexShrink: 0, marginTop: 2 }}>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              พิมพ์เอกสาร A4
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
        </div>
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
