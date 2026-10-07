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
  Form,
  Input,
  InputNumber,
  Select,
  message,
} from 'antd';
import {
  ApartmentOutlined,
  TableOutlined,
  ArrowLeftOutlined,
  BookOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  BankOutlined,
  CompassOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkflow, useProcedure, useProcedures, useGovernmentAgencies, usePorts } from '../hooks/queries';
import { useAddWorkflowStep, useUpdateWorkflowStep, useDeleteWorkflowStep } from '../hooks/mutations';
import { useTheme } from '../contexts/ThemeContext';
import { WorkflowMindmapView } from '../components/WorkflowMindmapView';
import { JobWorkflowStep } from '../types';
import { authService } from '../services/auth';

const { Title, Text, Paragraph } = Typography;

export const WorkflowDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDarkMode, primaryColor } = useTheme();
  const isAuthenticated = authService.isAuthenticated();

  const workflowId = id ? parseInt(id) : undefined;
  const { data: workflow, isLoading, error } = useWorkflow(workflowId);

  // Queries for select dropdowns in Add/Edit Step Modal
  const { data: allProcedures } = useProcedures();
  const { data: govAgencies } = useGovernmentAgencies();
  const { data: ports } = usePorts();

  // Mutations
  const addStepMutation = useAddWorkflowStep();
  const updateStepMutation = useUpdateWorkflowStep();
  const deleteStepMutation = useDeleteWorkflowStep();

  const [viewMode, setViewMode] = useState<'mindmap' | 'table'>('mindmap');
  const [selectedSopId, setSelectedSopId] = useState<number | null>(null);

  // Step Modal State
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<JobWorkflowStep | null>(null);
  const [stepForm] = Form.useForm();

  // Hook to fetch linked SOP when clicked in modal
  const { data: selectedProcedure, isLoading: isSopLoading } = useProcedure(selectedSopId || undefined);

  // Critical Path Method (CPM) calculation for workflow total duration
  const totalWorkflowEstimatedMinutes = React.useMemo(() => {
    if (!workflow?.steps || workflow.steps.length === 0) return 0;

    const steps = workflow.steps;
    const deps = workflow.dependencies || [];

    // Map of step id to step object
    const stepMap = new Map(steps.map((s) => [s.id, s]));

    // Graph adjacency: incoming prerequisites for each step
    const prereqsMap = new Map<number, number[]>();
    steps.forEach((s) => prereqsMap.set(s.id, []));

    if (deps.length > 0) {
      deps.forEach((d) => {
        if (prereqsMap.has(d.stepId)) {
          prereqsMap.get(d.stepId)!.push(d.dependsOnStepId);
        }
      });
    } else {
      // Default sequential dependency by sortOrder
      const sorted = [...steps].sort((a, b) => a.sortOrder - b.sortOrder);
      for (let i = 1; i < sorted.length; i++) {
        prereqsMap.get(sorted[i].id)!.push(sorted[i - 1].id);
      }
    }

    // Earliest Finish Time (EF) for each node using memoized DP
    const earliestFinish = new Map<number, number>();

    const getEF = (stepId: number, visited = new Set<number>()): number => {
      if (earliestFinish.has(stepId)) return earliestFinish.get(stepId)!;
      if (visited.has(stepId)) return 0; // Prevent cycle recursion
      visited.add(stepId);

      const step = stepMap.get(stepId);
      const stepDuration = step?.estimatedMinutes || 0;

      const prereqs = prereqsMap.get(stepId) || [];
      let maxPrereqEF = 0;

      for (const pId of prereqs) {
        const pEF = getEF(pId, new Set(visited));
        if (pEF > maxPrereqEF) {
          maxPrereqEF = pEF;
        }
      }

      const ef = maxPrereqEF + stepDuration;
      earliestFinish.set(stepId, ef);
      return ef;
    };

    let projectDuration = 0;
    steps.forEach((s) => {
      const ef = getEF(s.id);
      if (ef > projectDuration) {
        projectDuration = ef;
      }
    });

    return projectDuration;
  }, [workflow?.steps, workflow?.dependencies]);

  const formattedWorkflowTime = React.useMemo(() => {
    if (totalWorkflowEstimatedMinutes <= 0) return null;
    const hours = Math.floor(totalWorkflowEstimatedMinutes / 60);
    const mins = totalWorkflowEstimatedMinutes % 60;
    if (hours > 0 && mins > 0) return `${hours} ชม. ${mins} นาที`;
    if (hours > 0) return `${hours} ชั่วโมง`;
    return `${mins} นาที`;
  }, [totalWorkflowEstimatedMinutes]);

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
    const params = new URLSearchParams();
    params.set('title', step.title);
    if (workflow.categoryId) params.set('categoryId', String(workflow.categoryId));
    if (step.governmentAgencyId) params.set('governmentAgencyId', String(step.governmentAgencyId));
    if (step.portId) params.set('portId', String(step.portId));
    navigate(`/admin/procedures/new?${params.toString()}`);
  };

  const handleOpenStepModal = (step?: JobWorkflowStep) => {
    if (step) {
      setEditingStep(step);
      const currentDeps = (workflow?.dependencies || [])
        .filter((d) => d.stepId === step.id)
        .map((d) => d.dependsOnStepId);

      stepForm.setFieldsValue({
        sortOrder: step.sortOrder,
        stepType: step.stepType || 'standard',
        title: step.title,
        briefDescription: step.briefDescription,
        procedureId: step.procedureId || null,
        governmentAgencyId: step.governmentAgencyId || null,
        portId: step.portId || null,
        estimatedMinutes: step.estimatedMinutes || undefined,
        dependsOnStepIds: currentDeps,
        outputsText: (step.outputs || []).join('\n'),
      });
    } else {
      setEditingStep(null);
      stepForm.resetFields();
      const nextOrder = (workflow?.steps?.length || 0) + 1;
      stepForm.setFieldsValue({
        sortOrder: nextOrder,
        stepType: 'standard',
        estimatedMinutes: 30,
        outputsText: '',
        dependsOnStepIds: [],
      });
    }
    setStepModalOpen(true);
  };

  const handleProcedureSelect = (procId?: number | null) => {
    if (!procId) return;
    const proc = allProcedures?.find((p) => p.id === procId);
    if (!proc) return;

    const govId =
      proc.governmentAgencyId ||
      (proc.governmentAgencies && proc.governmentAgencies.length > 0 ? proc.governmentAgencies[0].id : null) ||
      (proc.governmentAgencyIds && proc.governmentAgencyIds.length > 0 ? proc.governmentAgencyIds[0] : null) ||
      null;

    // Calculate total duration from procedure steps if available
    let totalProcMinutes = 0;
    if (proc.variants && proc.variants.length > 0) {
      totalProcMinutes = (proc.variants[0].steps || []).reduce((acc: number, s: any) => acc + (s.estimatedMinutes || 0), 0);
    }

    const patch: Record<string, any> = {
      title: proc.title,
    };

    if (proc.description) {
      patch.briefDescription = proc.description;
    }
    if (govId) {
      patch.governmentAgencyId = govId;
    }
    if (proc.portId) {
      patch.portId = proc.portId;
    }
    if (totalProcMinutes > 0) {
      patch.estimatedMinutes = totalProcMinutes;
    }

    stepForm.setFieldsValue(patch);
    message.success(`ดึงข้อมูลจากคู่มือ "${proc.title}" ลงในฟอร์มเรียบร้อยแล้ว`);
  };

  const handleSaveStep = async () => {
    try {
      const values = await stepForm.validateFields();
      const outputs = values.outputsText
        ? values.outputsText.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0)
        : [];

      const payload = {
        title: values.title,
        briefDescription: values.briefDescription || null,
        procedureId: values.procedureId || null,
        governmentAgencyId: values.governmentAgencyId || null,
        portId: values.portId || null,
        sortOrder: values.sortOrder || 1,
        stepType: values.stepType || 'standard',
        estimatedMinutes: values.estimatedMinutes || null,
        outputs,
        dependsOnStepIds: values.dependsOnStepIds || [],
      };

      if (editingStep && workflowId) {
        await updateStepMutation.mutateAsync({
          workflowId,
          stepId: editingStep.id,
          data: payload,
        });
        message.success('แก้ไขขั้นตอนสำเร็จ');
      } else if (workflowId) {
        await addStepMutation.mutateAsync({
          workflowId,
          data: payload,
        });
        message.success('เพิ่มขั้นตอนเข้าสายงานสำเร็จ');
      }
      setStepModalOpen(false);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกขั้นตอน');
    }
  };

  const handleDeleteStep = (step: JobWorkflowStep) => {
    if (!workflowId) return;
    Modal.confirm({
      title: 'ยืนยันการลบขั้นตอน',
      content: `คุณต้องการลบขั้นตอน #${step.sortOrder} "${step.title}" ออกจากสายงานนี้ใช่หรือไม่?`,
      okText: 'ลบขั้นตอน',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: async () => {
        try {
          await deleteStepMutation.mutateAsync({
            workflowId,
            stepId: step.id,
          });
          message.success('ลบขั้นตอนสำเร็จ');
        } catch (err: any) {
          message.error(err.response?.data?.error || 'ไม่สามารถลบขั้นตอนได้');
        }
      },
    });
  };

  const tableColumns = [
    {
      title: 'ลำดับ',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 60,
      align: 'center' as const,
      render: (val: number) => <Tag color="blue" style={{ margin: 0, fontWeight: 600 }}>#{val}</Tag>,
    },
    {
      title: 'ขั้นตอนการปฏิบัติงาน',
      key: 'title',
      width: 280,
      render: (_: any, record: JobWorkflowStep) => (
        <div style={{ wordBreak: 'break-word' }}>
          <Text strong style={{ fontSize: 13, lineHeight: 1.4, display: 'inline-block' }}>{record.title}</Text>
          {record.briefDescription && (
            <div style={{ fontSize: 11.5, color: isDarkMode ? '#a1a1aa' : '#64748b', marginTop: 3, lineHeight: 1.35 }}>
              {record.briefDescription}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'หน่วยงาน / สถานที่',
      key: 'location',
      width: 170,
      render: (_: any, record: JobWorkflowStep) => (
        <Space size={[0, 4]} wrap>
          {record.agencyShortName && (
            <Tag color="volcano" style={{ margin: '1px 2px' }}><BankOutlined /> {record.agencyShortName}</Tag>
          )}
          {record.portCode && (
            <Tag color="blue" style={{ margin: '1px 2px' }}><CompassOutlined /> ท่า {record.portCode}</Tag>
          )}
          {!record.agencyShortName && !record.portCode && (
            <Text type="secondary" style={{ fontSize: 11 }}>-</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'เวลาโดยประมาณ',
      dataIndex: 'estimatedMinutes',
      key: 'estimatedMinutes',
      width: 125,
      align: 'center' as const,
      render: (mins?: number | null) => (
        mins ? (
          <Tag color="orange" style={{ margin: 0, fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' }}>
            <ClockCircleOutlined /> ~{mins} นาที
          </Tag>
        ) : (
          <Text type="secondary" style={{ fontSize: 11 }}>-</Text>
        )
      ),
    },
    {
      title: 'สิ่งที่ต้องได้ (Outputs)',
      dataIndex: 'outputs',
      key: 'outputs',
      width: 190,
      render: (outputs?: string[]) => (
        <div>
          {outputs && outputs.length > 0 ? (
            outputs.map((out, idx) => (
              <Tag key={idx} color="default" style={{ margin: '2px', fontSize: 11, wordBreak: 'break-word' }}>
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
      width: 140,
      align: 'center' as const,
      render: (_: any, record: JobWorkflowStep) => {
        const hasSop = !!record.procedureId;
        return hasSop ? (
          <Button
            type="primary"
            size="small"
            icon={<BookOutlined />}
            style={{ backgroundColor: '#52c41a', fontSize: 11, whiteSpace: 'nowrap' }}
            onClick={() => handleOpenSop(record.procedureId!)}
          >
            ดูคู่มือขั้นตอน
          </Button>
        ) : (
          <Button
            type="dashed"
            size="small"
            icon={<PlusOutlined />}
            style={{ color: '#faad14', borderColor: '#faad14', fontSize: 11, whiteSpace: 'nowrap' }}
            onClick={() => handleCreateSop(record)}
          >
            + สร้างคู่มือนี้
          </Button>
        );
      },
    },
    {
      title: 'จัดการ',
      key: 'actions',
      width: isAuthenticated ? 100 : 50,
      align: 'center' as const,
      fixed: 'right' as const,
      render: (_: any, record: JobWorkflowStep) => (
        <Space size={2}>
          {isAuthenticated && (
            <>
              <Tooltip title="แก้ไขขั้นตอนนี้">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined style={{ color: '#fa8c16', fontSize: 13 }} />}
                  onClick={() => handleOpenStepModal(record)}
                  style={{ width: 26, height: 26, padding: 0 }}
                />
              </Tooltip>
              <Tooltip title="ลบขั้นตอนนี้">
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined style={{ fontSize: 13 }} />}
                  onClick={() => handleDeleteStep(record)}
                  style={{ width: 26, height: 26, padding: 0 }}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
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

          {isAuthenticated && (
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => handleOpenStepModal()}
              style={{ borderRadius: 4, fontWeight: 500 }}
            >
              + เพิ่มขั้นตอน (Add Step)
            </Button>
          )}
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
              {formattedWorkflowTime && (
                <Tag color="success" style={{ fontWeight: 600 }}>
                  <ClockCircleOutlined /> รวมประมาณการ: ~{formattedWorkflowTime}
                </Tag>
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
        workflow.steps && workflow.steps.length > 0 ? (
          <WorkflowMindmapView
            steps={workflow.steps || []}
            dependencies={workflow.dependencies || []}
            onOpenSop={handleOpenSop}
            onCreateSop={handleCreateSop}
            onEditStep={handleOpenStepModal}
            onDeleteStep={handleDeleteStep}
            isAuthenticated={isAuthenticated}
          />
        ) : (
          <Card
            size="small"
            style={{
              textAlign: 'center',
              padding: '60px 0',
              borderRadius: 8,
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
              background: isDarkMode ? '#1a1d21' : '#fff',
            }}
          >
            <ApartmentOutlined style={{ fontSize: 36, color: '#94a3b8', marginBottom: 12 }} />
            <Title level={5} style={{ margin: '0 0 6px 0' }}>ยังไม่มีขั้นตอนในสายงานนี้</Title>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
              เริ่มต้นสร้างขั้นตอนแรกในกระบวนการทำงานเพื่อแสดงแผนผัง
            </Text>
            {isAuthenticated && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenStepModal()}
              >
                เพิ่มขั้นตอนแรกในสายงานนี้
              </Button>
            )}
          </Card>
        )
      ) : (
        <Card
          size="small"
          style={{
            borderRadius: 8,
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
            boxShadow: isDarkMode ? '0 4px 16px -2px rgba(0, 0, 0, 0.45)' : '0 1px 3px rgba(0, 0, 0, 0.03)',
            background: isDarkMode ? '#1a1d21' : '#fff',
            overflow: 'hidden',
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            columns={tableColumns}
            dataSource={workflow.steps || []}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ x: 950 }}
          />
        </Card>
      )}

      {/* Add / Edit Step Modal */}
      <Modal
        title={
          <Space>
            <ApartmentOutlined style={{ color: primaryColor }} />
            <span>{editingStep ? `แก้ไขขั้นตอน #${editingStep.sortOrder}` : '+ เพิ่มขั้นตอนใหม่ในสายงาน'}</span>
          </Space>
        }
        open={stepModalOpen}
        onOk={handleSaveStep}
        onCancel={() => setStepModalOpen(false)}
        confirmLoading={addStepMutation.isPending || updateStepMutation.isPending}
        okText="บันทึกขั้นตอน"
        cancelText="ยกเลิก"
        destroyOnClose
        width={560}
      >
        <Form form={stepForm} layout="vertical" size="small" style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Form.Item
              name="sortOrder"
              label="ลำดับที่ (#)"
              rules={[{ required: true, message: 'ระบุลำดับ' }]}
              style={{ width: 90 }}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="stepType"
              label="ประเภทขั้นตอน"
              style={{ width: 150 }}
            >
              <Select
                options={[
                  { value: 'standard', label: '📌 ปกติ (ลำดับ)' },
                  { value: 'parallel', label: '⚡ ทำงานคู่ขนาน' },
                  { value: 'decision', label: '🔀 ทางเลือก/เงื่อนไข' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="procedureId"
              label="เลือกคู่มือปฏิบัติงานมาตรฐาน (SOP)"
              extra="* เมื่อเลือกคู่มือ ระบบจะดึงชื่อ, คำอธิบาย, หน่วยงาน และท่าเรือให้อัตโนมัติ"
              style={{ flex: 1 }}
            >
              <Select
                allowClear
                showSearch
                placeholder="-- เลือกคู่มือ SOP ที่มีอยู่แล้ว หรือเว้นว่างไว้เพื่อสร้างใหม่ --"
                onChange={handleProcedureSelect}
                filterOption={(input, option) =>
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
                options={allProcedures?.map((p) => ({
                  value: p.id,
                  label: `[#${p.id}] ${p.title} (${p.category?.name || 'ทั่วไป'})`,
                }))}
              />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <Form.Item
              name="title"
              label="ชื่อขั้นตอนการปฏิบัติงาน"
              rules={[{ required: true, message: 'กรุณาระบุชื่อขั้นตอน' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="เช่น ยื่นขอใบอนุญาต อย. (LPI) หรือ นัดหมายตรวจสอบสินค้า" />
            </Form.Item>

            <Form.Item
              name="estimatedMinutes"
              label="เวลาโดยประมาณ (นาที)"
              extra="* เผื่อเวลาปฏิบัติงาน"
              style={{ width: 170 }}
            >
              <InputNumber
                placeholder="เช่น 30"
                min={1}
                max={1440}
                prefix={<span style={{ fontSize: 11, color: '#94a3b8' }}>⏱️</span>}
                addonAfter="นาที"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          <Form.Item name="briefDescription" label="คำอธิบายสรุปย่อขั้นตอน">
            <Input.TextArea rows={2} placeholder="อธิบายสิ่งที่ต้องปฏิบัติในขั้นตอนนี้..." />
          </Form.Item>

          <div style={{ display: 'flex', gap: 12 }}>
            <Form.Item name="governmentAgencyId" label="หน่วยงานราชการที่เกี่ยวข้อง" style={{ flex: 1 }}>
              <Select
                allowClear
                showSearch
                placeholder="เลือกหน่วยงานราชการ"
                filterOption={(input, option) =>
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
                options={govAgencies?.map((g) => ({
                  value: g.id,
                  label: `${g.shortName ? `[${g.shortName}] ` : ''}${g.name}`,
                }))}
              />
            </Form.Item>

            <Form.Item name="portId" label="ท่าเรือที่เกี่ยวข้อง (ถ้ามี)" style={{ flex: 1 }}>
              <Select
                allowClear
                showSearch
                placeholder="เลือกท่าเรือ"
                filterOption={(input, option) =>
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
                options={ports?.map((p) => ({
                  value: p.id,
                  label: `${p.code} - ${p.name}`,
                }))}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="dependsOnStepIds"
            label="ขั้นตอนก่อนหน้า (Prerequisites / Depends On)"
            extra="* ปล่อยว่างไว้เพื่อเชื่อมต่อตามลำดับ 1 -> 2 -> 3 อัตโนมัติ หรือเลือกขั้นตอนก่อนหน้าเพื่อสร้างสายงานแยก/คู่ขนาน (Branching Flow)"
          >
            <Select
              mode="multiple"
              allowClear
              placeholder="-- ปล่อยว่างไว้ (เชื่อมตามลำดับอัตโนมัติ) หรือเลือกขั้นตอนก่อนหน้า --"
              options={workflow?.steps
                ?.filter((s) => !editingStep || s.id !== editingStep.id)
                .map((s) => ({
                  value: s.id,
                  label: `#${s.sortOrder} - ${s.title}`,
                }))}
            />
          </Form.Item>

          <Form.Item
            name="outputsText"
            label="ผลลัพธ์ / เอกสารที่ต้องได้รับ (Outputs)"
            extra="* พิมพ์ 1 บรรทัดต่อ 1 รายการ เช่น ใบอนุญาตนำเข้า, ผลการเอ็กซเรย์"
          >
            <Input.TextArea rows={2} placeholder="ผลการเอ็กซเรย์ตู้สินค้า&#10;เลขที่ใบขนสินค้า" />
          </Form.Item>
        </Form>
      </Modal>

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
