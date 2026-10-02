import React from 'react';
import { Timeline, Typography, Card, Empty } from 'antd';
import { ProcedureStep } from '../types';
import { StepImageViewer } from './StepImageViewer';
import { RoleTag } from './RoleTag';

const { Title, Paragraph } = Typography;

export const StepTimeline: React.FC<{ steps?: ProcedureStep[] }> = ({ steps }) => {
  if (!steps || steps.length === 0) {
    return <Empty description="ยังไม่มีขั้นตอนการปฏิบัติงานสำหรับเงื่อนไขนี้" style={{ margin: '32px 0' }} />;
  }

  const timelineItems = steps.map((step) => ({
    color: '#1677ff',
    children: (
      <Card
        size="small"
        style={{
          marginBottom: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          borderRadius: 6,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: step.description ? 4 : 0,
          }}
        >
          <Title level={5} style={{ margin: 0, color: '#262626' }}>
            ขั้นตอนที่ {step.stepNumber}: {step.title}
          </Title>
          {step.responsibleRole && <RoleTag role={step.responsibleRole} />}
        </div>
        {step.description && (
          <Paragraph
            style={{
              marginTop: 6,
              marginBottom: 0,
              whiteSpace: 'pre-line',
              color: '#595959',
            }}
          >
            {step.description}
          </Paragraph>
        )}
        <StepImageViewer images={step.images} />
      </Card>
    ),
  }));

  return (
    <div style={{ marginTop: 16 }}>
      <Timeline items={timelineItems} />
    </div>
  );
};
