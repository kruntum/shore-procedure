import React, { useEffect, useCallback } from 'react';
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
  useNodesState,
  useEdgesState,
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
  ReloadOutlined,
} from '@ant-design/icons';
import { JobWorkflowStep } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const { Text } = Typography;

// Custom Step Node Component (Vertical Layout with Top/Bottom Handles & Drag support)
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
    : (isDarkMode ? '#f59e0b' : '#f59e0b'); // Amber

  return (
    <div
      style={{
        width: 280,
        padding: '12px 14px',
        borderRadius: 12,
        border: hasSop
          ? `1.5px solid ${borderColor}`
          : (isDarkMode ? '1.5px dashed rgba(245, 158, 11, 0.75)' : '1.5px dashed #f59e0b'),
        backgroundColor: isDarkMode ? '#1a1d24' : '#ffffff',
        boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.6)' : '0 2px 10px rgba(0,0,0,0.06)',
        color: isDarkMode ? '#f8fafc' : '#1e293b',
        position: 'relative',
        fontSize: 12,
        cursor: 'grab',
        userSelect: 'none',
        transition: 'border 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Target Handle at TOP (Center) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 8,
          height: 8,
          background: isDarkMode ? '#1a1d24' : '#ffffff',
          border: `1.5px solid ${borderColor}`,
          borderRadius: '50%',
          zIndex: 10,
        }}
      />

      {/* Node Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Space size={4} wrap>
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
          {step.stepType === 'parallel' && (
            <Tag color="purple" style={{ margin: 0, fontSize: 9.5, padding: '0 4px', fontWeight: 600 }}>
              ⚡ คู่ขนาน
            </Tag>
          )}
          {step.stepType === 'decision' && (
            <Tag color="orange" style={{ margin: 0, fontSize: 9.5, padding: '0 4px', fontWeight: 600 }}>
              🔀 ทางเลือก
            </Tag>
          )}
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
                  color: isDarkMode ? '#34d399' : '#10b981',
                  background: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#ecfdf5',
                  padding: '1px 6px',
                  borderRadius: 12,
                  border: isDarkMode ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid rgba(16, 185, 129, 0.3)',
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
                  color: isDarkMode ? '#fbbf24' : '#d97706',
                  background: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : '#fffbeb',
                  padding: '1px 6px',
                  borderRadius: 12,
                  border: isDarkMode ? '1px solid rgba(251, 191, 36, 0.35)' : '1px solid rgba(245, 158, 11, 0.3)',
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

      {/* Node Title (Bright white in Dark Mode) */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          display: 'block',
          lineHeight: 1.35,
          marginBottom: 4,
          color: isDarkMode ? '#f8fafc' : '#0f172a',
        }}
      >
        {step.title}
      </div>

      {/* Brief Description */}
      {step.briefDescription && (
        <div
          style={{
            fontSize: 11,
            display: 'block',
            lineHeight: 1.3,
            marginBottom: 6,
            color: isDarkMode ? '#94a3b8' : '#64748b',
          }}
        >
          {step.briefDescription}
        </div>
      )}

      {/* Outputs */}
      {step.outputs && step.outputs.length > 0 && (
        <div
          style={{
            marginBottom: 8,
            background: isDarkMode ? '#12141a' : '#f8fafc',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #f1f5f9',
            padding: '4px 6px',
            borderRadius: 4,
          }}
        >
          <div style={{ fontSize: 10, display: 'block', marginBottom: 2, color: isDarkMode ? '#94a3b8' : '#64748b' }}>
            สิ่งที่ได้รับ:
          </div>
          {step.outputs.map((out, idx) => (
            <div
              key={idx}
              style={{
                fontSize: 10.5,
                color: hasSop
                  ? (isDarkMode ? '#34d399' : '#10b981')
                  : (isDarkMode ? '#fbbf24' : '#d97706'),
                lineHeight: 1.3,
              }}
            >
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
            style={{
              fontSize: 11,
              height: 24,
              color: '#f59e0b',
              borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.6)' : '#f59e0b',
              backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onCreateSop(step);
            }}
          >
            + สร้างคู่มือนี้
          </Button>
        )}
      </div>

      {/* Source Handle at BOTTOM (Center) */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 8,
          height: 8,
          background: isDarkMode ? '#1a1d24' : '#ffffff',
          border: `1.5px solid ${borderColor}`,
          borderRadius: '50%',
          zIndex: 10,
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

  // Controlled ReactFlow nodes and edges with drag support
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Function to build clean, nicely spaced layout
  const buildLayout = useCallback(() => {
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
    // Generous spacing for comfortable, professional diagram layout:
    const colSpacing = 380;
    const rowSpacing = 330;
    const centerX = 400;

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

    // Generate edges with clean SmoothStep curve and crisp Arrowhead
    const generatedEdges: Edge[] = effectiveDeps.map((d, idx) => {
      const sourceStep = stepIdMap.get(d.dependsOnStepId);
      const isSourceComplete = !!sourceStep?.procedureId;
      const strokeColor = isSourceComplete
        ? (isDarkMode ? '#34d399' : '#10b981') // Bright Emerald green in dark mode
        : (isDarkMode ? '#38bdf8' : '#0284c7'); // Vibrant sky blue in dark mode

      return {
        id: `edge-${d.dependsOnStepId}-${d.stepId}-${idx}`,
        source: `step-${d.dependsOnStepId}`,
        target: `step-${d.stepId}`,
        type: 'smoothstep',
        pathOptions: {
          borderRadius: 20, // Gentle, elegant 20px rounded corner
          offset: 35,       // Travels 35px straight down before branching
        },
        animated: false,   // Solid, crisp, non-cluttered professional line
        style: {
          stroke: strokeColor,
          strokeWidth: 1.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 12,
          height: 12,
          color: strokeColor,
        },
      };
    });

    return { generatedNodes, generatedEdges };
  }, [steps, dependencies, isDarkMode, onOpenSop, onCreateSop, onEditStep, onDeleteStep, isAuthenticated]);

  // Recalculate layout when steps, dependencies, or theme changes
  useEffect(() => {
    const { generatedNodes, generatedEdges } = buildLayout();
    setNodes(generatedNodes);
    setEdges(generatedEdges);
  }, [buildLayout, setNodes, setEdges]);

  // Handler to reset layout back to auto-alignment
  const handleResetLayout = () => {
    const { generatedNodes, generatedEdges } = buildLayout();
    setNodes(generatedNodes);
    setEdges(generatedEdges);
  };

  return (
    <div
      className={isDarkMode ? 'dark-mindmap-canvas' : ''}
      style={{
        width: '100%',
        height: 580,
        backgroundColor: isDarkMode ? '#0e1014' : '#fafafa',
        borderRadius: 8,
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Dark mode CSS injection for React Flow Controls & attribution */}
      <style>{`
        .dark-mindmap-canvas .react-flow__controls {
          background-color: #1a1d24 !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6) !important;
          border-radius: 6px !important;
          overflow: hidden !important;
        }
        .dark-mindmap-canvas .react-flow__controls-button {
          background-color: #1a1d24 !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          fill: #94a3b8 !important;
          color: #94a3b8 !important;
        }
        .dark-mindmap-canvas .react-flow__controls-button:hover {
          background-color: #262b35 !important;
        }
        .dark-mindmap-canvas .react-flow__controls-button svg {
          fill: #94a3b8 !important;
        }
        .dark-mindmap-canvas .react-flow__controls-button:hover svg {
          fill: #f8fafc !important;
        }
        .dark-mindmap-canvas .react-flow__attribution {
          background-color: rgba(14, 16, 20, 0.8) !important;
          color: #475569 !important;
        }
        .dark-mindmap-canvas .react-flow__attribution a {
          color: #64748b !important;
        }
      `}</style>

      {/* Auto-alignment reset button overlay */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
        <Button
          size="small"
          icon={<ReloadOutlined />}
          onClick={handleResetLayout}
          style={{
            fontSize: 11,
            backgroundColor: isDarkMode ? '#1a1d24' : '#ffffff',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : '#d9d9d9',
            color: isDarkMode ? '#e2e8f0' : '#1e293b',
            boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.5)' : '0 2px 6px rgba(0,0,0,0.08)',
          }}
        >
          จัดผังอัตโนมัติ
        </Button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={true}
        nodesConnectable={false}
        attributionPosition="bottom-left"
      >
        <Background color={isDarkMode ? '#272b34' : '#cbd5e1'} gap={16} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
};
