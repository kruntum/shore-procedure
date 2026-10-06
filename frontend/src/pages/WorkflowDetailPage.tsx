import React, { useState } from 'react';
import {
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Radio,
  Progress,
  Divider,
  Spin,
  Alert,
  Table,
  Modal,
  Tooltip,
} from 'antd';
import {
  ApartmentOutlined,
  TableOutlined,
  ArrowLeftOutlined,
  BookOutlined,
  PlusOutlined,
  PrinterOutlined,
  ClockCircleOutlined,
  BankOutlined,
  CompassOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkflow, useProcedure } from '../hooks/queries';
import { useTheme } from '../contexts/ThemeContext';
import { WorkflowMindmapView } from '../components/WorkflowMindmapView';
import { JobWorkflowStep } from '../types';
import { SOPPrintModal } from '../components/SOPPrintModal';

const { Title, Text, Paragraph } = Typography;

export const WorkflowDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDarkMode, primaryColor } = useTheme();

  const workflowId = id ? parseInt(id) : undefined;
  const { data: workflow, isLoading, error } = useWorkflow(workflowId);

  const [viewMode, setViewMode] = useState<'mindmap' | 'table'>('mindmap');
  const [selectedSopId, setSelectedSopId] = useState<number | null>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // Hook to fetch linked SOP when clicked in modal
  const { data: selectedProcedure, isLoading: isSopLoading } = useProcedure(selectedSopId || undefined);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Spin size="large" tip="กำลังโหลดแผนผังสายงานปฏิบัติการ..." />
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/workflows')} style={{ marginBottom: 16 }}>
          ย้อนกลับ
        </Button>
        <Alert type="error" message="ไม่พบสายงานปฏิบัติการที่ระบุ" showIcon />
      </div>
    );
  }

  const handleOpenSop = (procedureId: number) => {
    setSelectedSopId(procedureId);
  };

  const handleCreateSop = (step: JobWorkflowStep) => {
    // Open procedure builder with step prefilled parameters
    const params = new URLSearchParams();
    params.set('title', step.title);
    if (workflow.categoryId) params.set('categoryId', String(workflow.categoryId));
    if (step.governmentAgencyId) params.set('governmentAgencyId', String(step.governmentAgencyId));
    if (step.portId) params.set('portId', String(step.portId));
    navigate(`/admin/procedures/new?${params.toString()}`);
  };

  const tableColumns = [
    {
      title: 'ลำดับ',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 60,
      align: 'center' as const,
      render: (val: number) => <Tag color="blue">#{val}</Tag>,
    },
    {
      title: 'ขั้นตอนการปฏิบัติงาน',
      key: 'title',
      render: (_: any, record: JobWorkflowStep) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{record.title}</Text>
          {record.briefDescription && (
            <div style={{ fontSize: 11.5, color: isDarkMode ? '#a1a1aa' : '#64748b', marginTop: 2 }}>
              {record.briefDescription}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'หน่วยงาน / สถานที่',
      key: 'location',
      width: 180,
      render: (_: any, record: JobWorkflowStep) => (
        <Space size={4} wrap>
          {record.agencyShortName && (
            <Tag color="volcano"><BankOutlined /> {record.agencyShortName}</Tag>
          )}
          {record.portCode && (
            <Tag color="blue"><CompassOutlined /> ท่า {record.portCode}</Tag>
          )}
          {!record.agencyShortName && !record.portCode && (
            <Text type="secondary" style={{ fontSize: 11 }}>-</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'สิ่งที่ต้องได้ (Outputs)',
      dataIndex: 'outputs',
      key: 'outputs',
      width: 220,
      render: (outputs?: string[]) => (
        <div>
          {outputs && outputs.length > 0 ? (
            outputs.map((out, idx) => (
              <Tag key={idx} color="default" style={{ margin: '2px', fontSize: 11 }}>
                • {out}
              </Tag>
            ))
          ) : (
            <Text type="secondary" style={{ fontSize: 11 }}>-</Text>
          )}
        </div>
      ),
    },
    {
      title: 'สถานะคู่มือ (SOP)',
      key: 'sopStatus',
      width: 150,
      align: 'center' as const,
      render: (_: any, record: JobWorkflowStep) => {
        const hasSop = !!record.procedureId;
        return hasSop ? (
          <Button
            type="primary"
            size="small"
            icon={<BookOutlined />}
            style={{ backgroundColor: '#52c41a', fontSize: 11 }}
            onClick={() => handleOpenSop(record.procedureId!)}
          >
            ดูคู่มือขั้นตอน
          </Button>
        ) : (
          <Button
            type="dashed"
            size="small"
            icon={<PlusOutlined />}
            style={{ color: '#faad14', borderColor: '#faad14', fontSize: 11 }}
            onClick={() => handleCreateSop(record)}
          >
            + สร้างคู่มือนี้
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      {/* Top Bar */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/workflows')} size="small">
          ย้อนกลับ
        </Button>
        <Space>
          <Radio.Group
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            size="small"
            buttonStyle="solid"
          >
            <Radio.Button value="mindmap">
              <ApartmentOutlined /> ผังงาน (Mindmap Flow)
            </Radio.Button>
            <Radio.Button value="table">
              <TableOutlined /> ตารางเช็คลิสต์ (Table)
            </Radio.Button>
          </Radio.Group>
        </Space>
      </div>

      {/* Workflow Header Banner */}
      <Card
        size="small"
        style={{
          marginBottom: 16,
          borderRadius: 8,
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
          background: isDarkMode ? '#1a1d21' : '#fff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <Space size={6} style={{ marginBottom: 6 }}>
              <Tag color="cyan" style={{ fontWeight: 600 }}>{workflow.code}</Tag>
              {workflow.category && (
                <Tag color={workflow.category.color || 'blue'}>
                  {workflow.category.icon} {workflow.category.name}
                </Tag>
              )}
              {workflow.estimatedDuration && (
                <Tag color="default"><ClockCircleOutlined /> {workflow.estimatedDuration}</Tag>
              )}
            </Space>
            <Title level={4} style={{ margin: '4px 0 6px 0', fontSize: 17 }}>
              {workflow.title}
            </Title>
            {workflow.description && (
              <Paragraph type="secondary" style={{ margin: 0, fontSize: 12.5, maxWidth: 850 }}>
                {workflow.description}
              </Paragraph>
            )}
          </div>

          {/* Completion summary */}
          <div style={{ minWidth: 200, textAlign: 'right' }}>
            <div style={{ fontSize: 12, marginBottom: 4 }}>
              ความสมบูรณ์ของคู่มือ: <strong>{workflow.sopReadyCount}/{workflow.stepCount} ขั้นตอน ({workflow.completionRate}%)</strong>
            </div>
            <Progress
              percent={workflow.completionRate || 0}
              size="small"
              strokeColor={workflow.completionRate === 100 ? '#52c41a' : primaryColor}
            />
          </div>
        </div>
      </Card>

      {/* Main View Area */}
      {viewMode === 'mindmap' ? (
        <WorkflowMindmapView
          steps={workflow.steps || []}
          dependencies={workflow.dependencies || []}
          onOpenSop={handleOpenSop}
          onCreateSop={handleCreateSop}
        />
      ) : (
        <Card
          size="small"
          style={{
            borderRadius: 8,
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
            background: isDarkMode ? '#1a1d21' : '#fff',
          }}
        >
          <Table
            columns={tableColumns}
            dataSource={workflow.steps || []}
            rowKey="id"
            size="small"
            pagination={false}
          />
        </Card>
      )}

      {/* Linked SOP Quick Modal */}
      <Modal
        title={
          selectedProcedure ? (
            <Space>
              <BookOutlined style={{ color: primaryColor }} />
              <span>คู่มือประกอบขั้นตอน: {selectedProcedure.title}</span>
            </Space>
          ) : 'กำลังโหลดคู่มือ...'
        }
        open={!!selectedSopId}
        onCancel={() => setSelectedSopId(null)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setSelectedSopId(null)}>
            ปิด
          </Button>,
          selectedProcedure && (
            <Button
              key="viewFull"
              type="primary"
              onClick={() => {
                const targetId = selectedProcedure.id;
                setSelectedSopId(null);
                navigate(`/procedures/${targetId}`);
              }}
            >
              เปิดหน้าคู่มือฉบับเต็ม
            </Button>
          ),
        ]}
      >
        {isSopLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin tip="กำลังโหลดขั้นตอน..." />
          </div>
        ) : selectedProcedure ? (
          <div>
            <div style={{ marginBottom: 12 }}>
              <Space wrap>
                {selectedProcedure.category && (
                  <Tag color={selectedProcedure.category.color || 'blue'}>
                    {selectedProcedure.category.icon} {selectedProcedure.category.name}
                  </Tag>
                )}
                {selectedProcedure.workType && (
                  <Tag color="purple">{selectedProcedure.workType.name}</Tag>
                )}
                {selectedProcedure.contactHotline && (
                  <Tag color="green">สายด่วน: {selectedProcedure.contactHotline}</Tag>
                )}
              </Space>
              {selectedProcedure.description && (
                <Paragraph type="secondary" style={{ marginTop: 8, fontSize: 12.5 }}>
                  {selectedProcedure.description}
                </Paragraph>
              )}
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <Title level={5} style={{ fontSize: 13.5 }}>
              เงื่อนไขและขั้นตอนการปฏิบัติงาน:
            </Title>

            {(selectedProcedure.variants || []).map((v, vIdx) => (
              <Card
                key={v.id}
                size="small"
                style={{
                  marginBottom: 10,
                  backgroundColor: isDarkMode ? '#141414' : '#fafafa',
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f0f0f0',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 12.5, color: primaryColor, marginBottom: 6 }}>
                  เงื่อนไขที่ {vIdx + 1}: {v.conditionName} {v.cutoffTime ? `(ตัดรอบ ${v.cutoffTime})` : ''}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {v.steps?.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 4,
                        background: isDarkMode ? '#1e293b' : '#fff',
                        border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0',
                        fontSize: 12,
                      }}
                    >
                      <Space align="start">
                        <Tag color="blue" style={{ margin: 0, fontWeight: 700 }}>{s.stepNumber}</Tag>
                        <div>
                          <strong>{s.title}</strong>
                          {s.description && (
                            <div style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11.5, marginTop: 2 }}>
                              {s.description}
                            </div>
                          )}
                        </div>
                      </Space>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
