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
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Tag, Button, Typography, Space, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  BookOutlined,
  PlusOutlined,
  BankOutlined,
  CompassOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { JobWorkflowStep } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const { Text } = Typography;

// Custom Step Node Component (Vertical Layout with Top/Bottom Handles)
export const StepNode: React.FC<NodeProps> = ({ data }: any) => {
  const step: JobWorkflowStep = data.step;
  const isDarkMode = data.isDarkMode;
  const onOpenSop = data.onOpenSop;
  const onCreateSop = data.onCreateSop;
  const onEditStep = data.onEditStep;
  const onDeleteStep = data.onDeleteStep;
  const isAuthenticated = data.isAuthenticated;

  const hasSop = !!step.procedureId;
  const borderColor = hasSop
    ? '#10b981' // Emerald / Green
    : isDarkMode ? '#f59e0b' : '#f59e0b'; // Amber

  return (
    <div
      style={{
        width: 280,
        padding: '12px 14px',
        borderRadius: 12,
        border: hasSop
          ? `1.5px solid ${borderColor}`
          : (isDarkMode ? '1.5px dashed rgba(245, 158, 11, 0.7)' : '1.5px dashed #f59e0b'),
        backgroundColor: isDarkMode ? '#1a1d21' : '#ffffff',
        boxShadow: isDarkMode ? '0 4px 16px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.06)',
        color: isDarkMode ? 'rgba(255,255,255,0.88)' : '#1e293b',
        position: 'relative',
        fontSize: 12,
        transition: 'all 0.2s ease',
      }}
    >
      {/* Target Handle at TOP */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 10,
          height: 10,
          background: '#ffffff',
          border: `2px solid ${borderColor}`,
          borderRadius: '50%',
          top: -6,
        }}
      />

      {/* Node Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Space size={4}>
          <span
            style={{
              backgroundColor: hasSop ? '#10b981' : '#f59e0b',
              color: '#fff',
              fontSize: 10.5,
              fontWeight: 700,
              padding: '1px 7px',
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
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: '#10b981',
                  background: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
                  padding: '1px 6px',
                  borderRadius: 12,
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <CheckCircleOutlined /> พร้อมใช้
              </span>
            </Tooltip>
          ) : (
            <Tooltip title="ขั้นตอนนี้ยังไม่มีคู่มือ SOP">
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: '#d97706',
                  background: isDarkMode ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb',
                  padding: '1px 6px',
                  borderRadius: 12,
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                <ClockCircleOutlined /> รอคู่มือ
              </span>
            </Tooltip>
          )}

          {isAuthenticated && onEditStep && (
            <Tooltip title="แก้ไขขั้นตอนนี้">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined style={{ fontSize: 11, color: '#fa8c16' }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditStep(step);
                }}
                style={{ width: 20, height: 20, padding: 0 }}
              />
            </Tooltip>
          )}
          {isAuthenticated && onDeleteStep && (
            <Tooltip title="ลบขั้นตอนนี้">
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined style={{ fontSize: 11 }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteStep(step);
                }}
                style={{ width: 20, height: 20, padding: 0 }}
              />
            </Tooltip>
          )}
        </Space>
      </div>

      {/* Node Title */}
      <Text strong style={{ fontSize: 13, display: 'block', lineHeight: 1.35, marginBottom: 4 }}>
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
        <div style={{ marginBottom: 8, background: isDarkMode ? '#131519' : '#f8fafc', padding: '4px 6px', borderRadius: 4 }}>
          <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 2 }}>สิ่งที่ได้รับ:</Text>
          {step.outputs.map((out, idx) => (
            <div key={idx} style={{ fontSize: 10.5, color: hasSop ? '#10b981' : '#d97706', lineHeight: 1.3 }}>
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
            style={{ fontSize: 11, height: 24, backgroundColor: '#10b981', borderColor: '#10b981' }}
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
            style={{ fontSize: 11, height: 24, color: '#f59e0b', borderColor: '#f59e0b' }}
            onClick={(e) => {
              e.stopPropagation();
              onCreateSop(step);
            }}
          >
            + สร้างคู่มือนี้
          </Button>
        )}
      </div>

      {/* Source Handle at BOTTOM */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 10,
          height: 10,
          background: '#ffffff',
          border: `2px solid ${borderColor}`,
          borderRadius: '50%',
          bottom: -6,
        }}
      />
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

  // Generate nodes and edges layout vertically (Top to Bottom)
  const { nodes, edges } = useMemo(() => {
    // Sort steps primarily by sortOrder
    const sortedSteps = [...steps].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    const stepIdMap = new Map<number, JobWorkflowStep>();
    sortedSteps.forEach((s) => stepIdMap.set(s.id, s));

    // Determine effective dependencies:
    // If explicit dependencies provided, use them.
    // Otherwise, connect steps sequentially: 1 -> 2 -> 3
    let effectiveDeps = dependencies && dependencies.length > 0 ? [...dependencies] : [];

    if (effectiveDeps.length === 0 && sortedSteps.length > 1) {
      for (let i = 0; i < sortedSteps.length - 1; i++) {
        effectiveDeps.push({
          dependsOnStepId: sortedSteps[i].id,
          stepId: sortedSteps[i + 1].id,
        });
      }
    }

    // Calculate topological levels (Rows: top to bottom)
    const stepLevels: Record<number, number> = {};
    const calculateLevel = (stepId: number, visited = new Set<number>()): number => {
      if (visited.has(stepId)) return 0;
      if (stepLevels[stepId] !== undefined) return stepLevels[stepId];
      visited.add(stepId);

      const prereqs = effectiveDeps.filter((d) => d.stepId === stepId);
      if (prereqs.length === 0) {
        stepLevels[stepId] = 0;
        return 0;
      }
      const maxPrereqLevel = Math.max(...prereqs.map((d) => calculateLevel(d.dependsOnStepId, visited)));
      stepLevels[stepId] = maxPrereqLevel + 1;
      return stepLevels[stepId];
    };

    sortedSteps.forEach((s) => calculateLevel(s.id));

    // Group steps by level (row)
    const levelRows: Record<number, JobWorkflowStep[]> = {};
    sortedSteps.forEach((s) => {
      const lvl = stepLevels[s.id] || 0;
      if (!levelRows[lvl]) levelRows[lvl] = [];
      levelRows[lvl].push(s);
    });

    const generatedNodes: Node[] = [];
    const nodeWidth = 280;
    const colSpacing = 320;
    const rowSpacing = 220;
    const centerX = 360;

    Object.keys(levelRows).forEach((lvlStr) => {
      const lvl = parseInt(lvlStr);
      const itemsInRow = levelRows[lvl];
      const count = itemsInRow.length;

      itemsInRow.forEach((step, idx) => {
        // Center items symmetrically in this level row
        const xOffset = (idx - (count - 1) / 2) * colSpacing;
        generatedNodes.push({
          id: `step-${step.id}`,
          type: 'stepNode',
          position: {
            x: centerX + xOffset - nodeWidth / 2,
            y: 40 + lvl * rowSpacing,
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

    // Generate edges with SmoothStep and Arrowhead Marker (just like in the example!)
    const generatedEdges: Edge[] = effectiveDeps.map((d, idx) => {
      const sourceStep = stepIdMap.get(d.dependsOnStepId);
      const isSourceComplete = !!sourceStep?.procedureId;
      const strokeColor = isSourceComplete
        ? (isDarkMode ? '#34d399' : '#10b981') // Green when ready
        : (isDarkMode ? '#94a3b8' : '#94a3b8'); // Slate when pending

      return {
        id: `edge-${d.dependsOnStepId}-${d.stepId}-${idx}`,
        source: `step-${d.dependsOnStepId}`,
        target: `step-${d.stepId}`,
        type: 'smoothstep',
        animated: !isSourceComplete,
        style: {
          stroke: strokeColor,
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: strokeColor,
        },
      };
    });

    return { nodes: generatedNodes, edges: generatedEdges };
  }, [steps, dependencies, isDarkMode, onOpenSop, onCreateSop, onEditStep, onDeleteStep, isAuthenticated]);

  return (
    <div
      style={{
        width: '100%',
        height: 560,
        backgroundColor: isDarkMode ? '#141414' : '#fafafa',
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
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
      >
        <Background color={isDarkMode ? '#333' : '#cbd5e1'} gap={16} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
};
