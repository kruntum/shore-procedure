import React from 'react';
import { Card, Tag, Typography, Progress, Button, Space, Tooltip } from 'antd';
import {
  ApartmentOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowRightOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { JobWorkflow } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const { Title, Text, Paragraph } = Typography;

interface WorkflowCardProps {
  workflow: JobWorkflow;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow }) => {
  const navigate = useNavigate();
  const { isDarkMode, primaryColor } = useTheme();

  const totalSteps = workflow.stepCount || 0;
  const readySops = workflow.sopReadyCount || 0;
  const completionRate = workflow.completionRate || 0;

  return (
    <Card
      hoverable
      size="small"
      onClick={() => navigate(`/workflows/${workflow.id}`)}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 8,
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
        borderTop: `3px solid ${workflow.category?.color ? `var(--ant-${workflow.category.color})` : '#0284c7'}`,
        boxShadow: isDarkMode ? '0 4px 16px -2px rgba(0, 0, 0, 0.45)' : '0 1px 4px rgba(0, 0, 0, 0.04)',
        background: isDarkMode ? '#1a1d21' : '#fff',
        transition: 'all 0.2s ease',
      }}
      bodyStyle={{
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      <div>
        {/* Header Tags */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Space size={4}>
            <Tag color="cyan" style={{ margin: 0, fontSize: 10.5, fontWeight: 600 }}>
              <ApartmentOutlined style={{ marginRight: 3 }} /> โฟลว์งาน
            </Tag>
            {workflow.category && (
              <Tag color={workflow.category.color || 'blue'} style={{ margin: 0, fontSize: 10.5 }}>
                {workflow.category.icon} {workflow.category.name}
              </Tag>
            )}
          </Space>

          {workflow.estimatedDuration && (
            <Text type="secondary" style={{ fontSize: 10.5, display: 'flex', alignItems: 'center', gap: 3 }}>
              <ClockCircleOutlined /> {workflow.estimatedDuration}
            </Text>
          )}
        </div>

        {/* Title */}
        <Title
          level={5}
          ellipsis={{ rows: 2 }}
          style={{
            margin: '0 0 6px',
            fontSize: 13.5,
            lineHeight: 1.35,
            color: isDarkMode ? '#e2e8f0' : '#1e293b',
          }}
        >
          {workflow.title}
        </Title>

        {/* Description */}
        {workflow.description && (
          <Paragraph
            ellipsis={{ rows: 2 }}
            type="secondary"
            style={{ fontSize: 11.5, margin: '0 0 10px', lineHeight: 1.35 }}
          >
            {workflow.description}
          </Paragraph>
        )}

        {/* Audience */}
        {workflow.targetAudience && (
          <div style={{ fontSize: 11, marginBottom: 8 }}>
            <Text type="secondary">ผู้รับผิดชอบ: </Text>
            <Text style={{ fontSize: 11 }}>{workflow.targetAudience}</Text>
          </div>
        )}
      </div>

      {/* Footer Progress & Action */}
      <div style={{ marginTop: 10, paddingTop: 8, borderTop: isDarkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Space size={6} style={{ fontSize: 11 }}>
            <span style={{ fontWeight: 600 }}>👣 {totalSteps} ขั้นตอน</span>
            <span>•</span>
            <span style={{ color: readySops === totalSteps && totalSteps > 0 ? '#52c41a' : '#d97706' }}>
              <BookOutlined style={{ marginRight: 2 }} /> {readySops}/{totalSteps} คู่มือ
            </span>
          </Space>

          <Text style={{ color: primaryColor, fontSize: 11.5, fontWeight: 500 }}>
            เปิดผังงาน <ArrowRightOutlined style={{ fontSize: 10 }} />
          </Text>
        </div>

        {/* Completion Progress Bar */}
        <Progress
          percent={completionRate}
          size="small"
          strokeColor={completionRate === 100 ? '#52c41a' : (completionRate > 50 ? primaryColor : '#faad14')}
          showInfo={false}
          style={{ margin: 0 }}
        />
      </div>
    </Card>
  );
};
