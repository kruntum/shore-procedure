import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  NodeProps,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Tag, Button, Typography, Space, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  BookOutlined,
  PlusOutlined,
  BankOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import { JobWorkflowStep } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const { Text } = Typography;

// Custom Step Node Component
export const StepNode: React.FC<NodeProps> = ({ data }: any) => {
  const step: JobWorkflowStep = data.step;
  const isDarkMode = data.isDarkMode;
  const onOpenSop = data.onOpenSop;
  const onCreateSop = data.onCreateSop;
  const onEditStep = data.onEditStep;
  const onDeleteStep = data.onDeleteStep;
  const isAuthenticated = data.isAuthenticated;

  const hasSop = !!step.procedureId;

  return (
    <div
      style={{
        width: 250,
        padding: '10px 12px',
        borderRadius: 8,
        border: hasSop
          ? '2px solid #52c41a'
          : (isDarkMode ? '2px dashed rgba(245, 158, 11, 0.6)' : '2px dashed #faad14'),
        backgroundColor: isDarkMode ? '#1a1d21' : '#ffffff',
        boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.08)',
        color: isDarkMode ? 'rgba(255,255,255,0.88)' : '#1e293b',
        position: 'relative',
        fontSize: 12,
        transition: 'all 0.2s',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: '#555', width: 8, height: 8 }} />

      {/* Node Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Space size={4}>
          <span
            style={{
              backgroundColor: hasSop ? '#52c41a' : '#faad14',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: 10,
            }}
          >
            #{step.sortOrder}
          </span>
          {step.agencyShortName && (
            <Tag color="volcano" style={{ margin: 0, fontSize: 10, padding: '0 4px' }}>
              <BankOutlined /> {step.agencyShortName}
            </Tag>
          )}
          {step.portCode && (
            <Tag color="blue" style={{ margin: 0, fontSize: 10, padding: '0 4px' }}>
              <CompassOutlined /> {step.portCode}
            </Tag>
          )}
        </Space>

        <Space size={4}>
          {hasSop ? (
            <Tooltip title="มีคู่มือ SOP สมบูรณ์แล้ว">
              <Tag color="success" style={{ margin: 0, fontSize: 10, padding: '0 4px' }}>
                <CheckCircleOutlined /> พร้อมใช้
              </Tag>
            </Tooltip>
          ) : (
            <Tooltip title="ขั้นตอนนี้ยังไม่มีคู่มือ SOP">
              <Tag color="warning" style={{ margin: 0, fontSize: 10, padding: '0 4px' }}>
                <ExclamationCircleOutlined /> รอคู่มือ
              </Tag>
            </Tooltip>
          )}

          {isAuthenticated && onEditStep && (
            <Tooltip title="แก้ไขขั้นตอนนี้">
              <Button
                type="text"
                size="small"
                icon={<span style={{ fontSize: 11, cursor: 'pointer' }}>✏️</span>}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditStep(step);
                }}
                style={{ width: 18, height: 18, padding: 0 }}
              />
            </Tooltip>
          )}
          {isAuthenticated && onDeleteStep && (
            <Tooltip title="ลบขั้นตอนนี้">
              <Button
                type="text"
                danger
                size="small"
                icon={<span style={{ fontSize: 11, cursor: 'pointer' }}>🗑️</span>}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteStep(step);
                }}
                style={{ width: 18, height: 18, padding: 0 }}
              />
            </Tooltip>
          )}
        </Space>
      </div>

      {/* Node Title */}
      <Text strong style={{ fontSize: 12.5, display: 'block', lineHeight: 1.35, marginBottom: 4 }}>
        {step.title}
      </Text>

      {/* Brief Description */}
      {step.briefDescription && (
        <Text type="secondary" style={{ fontSize: 11, display: 'block', lineHeight: 1.3, marginBottom: 6 }}>
          {step.briefDescription}
        </Text>
      )}

      {/* Outputs */}
      {step.outputs && step.outputs.length > 0 && (
        <div style={{ marginBottom: 8, background: isDarkMode ? '#131519' : '#f8fafc', padding: '3px 6px', borderRadius: 4 }}>
          <Text type="secondary" style={{ fontSize: 10, display: 'block' }}>สิ่งที่ได้รับ:</Text>
          {step.outputs.map((out, idx) => (
            <div key={idx} style={{ fontSize: 10.5, color: hasSop ? '#52c41a' : '#d97706' }}>
              • {out}
            </div>
          ))}
        </div>
      )}

      {/* Action Button */}
      <div style={{ marginTop: 6, paddingTop: 6, borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f0f0f0' }}>
        {hasSop ? (
          <Button
            type="primary"
            size="small"
            block
            icon={<BookOutlined />}
            style={{ fontSize: 11, height: 24, backgroundColor: '#52c41a' }}
            onClick={(e) => {
              e.stopPropagation();
              onOpenSop(step.procedureId);
            }}
          >
            เปิดดูคู่มือ SOP
          </Button>
        ) : (
          <Button
            type="dashed"
            size="small"
            block
            icon={<PlusOutlined />}
            style={{ fontSize: 11, height: 24, color: '#faad14', borderColor: '#faad14' }}
            onClick={(e) => {
              e.stopPropagation();
              onCreateSop(step);
            }}
          >
            + สร้างคู่มือนี้
          </Button>
        )}
      </div>

      <Handle type="source" position={Position.Right} style={{ background: '#555', width: 8, height: 8 }} />
    </div>
  );
};

const nodeTypes = {
  stepNode: StepNode,
};

interface WorkflowMindmapViewProps {
  steps: JobWorkflowStep[];
  dependencies: { stepId: number; dependsOnStepId: number }[];
  onOpenSop: (procedureId: number) => void;
  onCreateSop: (step: JobWorkflowStep) => void;
  onEditStep?: (step: JobWorkflowStep) => void;
  onDeleteStep?: (step: JobWorkflowStep) => void;
  isAuthenticated?: boolean;
}

export const WorkflowMindmapView: React.FC<WorkflowMindmapViewProps> = ({
  steps,
  dependencies,
  onOpenSop,
  onCreateSop,
  onEditStep,
  onDeleteStep,
  isAuthenticated,
}) => {
  const { isDarkMode } = useTheme();

  // Generate nodes and edges layout horizontally
  const { nodes, edges } = useMemo(() => {
    const stepIdToStepMap = new Map<number, JobWorkflowStep>();
    steps.forEach((s) => stepIdToStepMap.set(s.id, s));

    // Calculate levels based on dependencies
    const stepLevels: Record<number, number> = {};
    const calculateLevel = (stepId: number, visited = new Set<number>()): number => {
      if (visited.has(stepId)) return 0;
      if (stepLevels[stepId] !== undefined) return stepLevels[stepId];
      visited.add(stepId);

      const prereqs = dependencies.filter((d) => d.stepId === stepId);
      if (prereqs.length === 0) {
        stepLevels[stepId] = 0;
        return 0;
      }
      const maxPrereqLevel = Math.max(...prereqs.map((d) => calculateLevel(d.dependsOnStepId, visited)));
      stepLevels[stepId] = maxPrereqLevel + 1;
      return stepLevels[stepId];
    };

    steps.forEach((s) => calculateLevel(s.id));

    // Group steps by level for horizontal column placement
    const levelColumns: Record<number, JobWorkflowStep[]> = {};
    steps.forEach((s) => {
      const lvl = stepLevels[s.id] || 0;
      if (!levelColumns[lvl]) levelColumns[lvl] = [];
      levelColumns[lvl].push(s);
    });

    const generatedNodes: Node[] = [];
    const colSpacing = 320;
    const rowSpacing = 200;

    Object.keys(levelColumns).forEach((lvlStr) => {
      const lvl = parseInt(lvlStr);
      const itemsInCol = levelColumns[lvl];

      itemsInCol.forEach((step, idx) => {
        generatedNodes.push({
          id: `step-${step.id}`,
          type: 'stepNode',
          position: {
            x: 50 + lvl * colSpacing,
            y: 80 + idx * rowSpacing,
          },
          data: {
            step,
            isDarkMode,
            onOpenSop,
            onCreateSop,
            onEditStep,
            onDeleteStep,
            isAuthenticated,
          },
        });
      });
    });

    // Generate edges
    const generatedEdges: Edge[] = dependencies.map((d, idx) => ({
      id: `edge-${d.dependsOnStepId}-${d.stepId}-${idx}`,
      source: `step-${d.dependsOnStepId}`,
      target: `step-${d.stepId}`,
      animated: true,
      style: { stroke: isDarkMode ? '#60a5fa' : '#2563eb', strokeWidth: 2 },
    }));

    return { nodes: generatedNodes, edges: generatedEdges };
  }, [steps, dependencies, isDarkMode, onOpenSop, onCreateSop, onEditStep, onDeleteStep, isAuthenticated]);

  return (
    <div
      style={{
        width: '100%',
        height: 520,
        backgroundColor: isDarkMode ? '#141414' : '#f8fafc',
        borderRadius: 8,
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
        overflow: 'hidden',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color={isDarkMode ? '#333' : '#cbd5e1'} gap={16} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
};
