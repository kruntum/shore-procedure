import React from 'react';
import { Timeline, Typography, Card, Empty, Row, Col, Space, Tag } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { ProcedureStep } from '../types';
import { StepImageViewer } from './StepImageViewer';
import { RoleTag } from './RoleTag';
import { useTheme } from '../contexts/ThemeContext';

const { Title, Text, Paragraph } = Typography;

export const StepTimeline: React.FC<{ steps?: ProcedureStep[] }> = ({ steps }) => {
  const { isDarkMode, primaryColor } = useTheme();

  if (!steps || steps.length === 0) {
    return <Empty description="ยังไม่มีขั้นตอนการปฏิบัติงานสำหรับเงื่อนไขนี้" style={{ margin: '32px 0' }} />;
  }

  const timelineItems = steps.map((step) => {
    const hasImages = step.images && step.images.length > 0;

    return {
      color: primaryColor,
      children: (
        <Card
          size="small"
          style={{
            marginBottom: 12,
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #e2e8f0',
            boxShadow: isDarkMode ? '0 4px 14px -2px rgba(0, 0, 0, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.03)',
            borderRadius: 8,
            background: isDarkMode ? '#1a1d21' : '#fff',
          }}
        >
          {/* 2-Column Responsive Layout starting from Title */}
          <Row gutter={[16, 12]} align="top">
            {/* Left Column: Title, Description & RoleTag */}
            <Col xs={24} md={hasImages ? 15 : 24} lg={hasImages ? 16 : 24}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                <Title level={5} style={{ margin: 0, color: isDarkMode ? '#f1f5f9' : '#1e293b', fontSize: 13.5 }}>
                  ขั้นตอนที่ {step.stepNumber}: {step.title}
                </Title>
                {step.estimatedMinutes && (
                  <Tag
                    color="orange"
                    style={{
                      margin: 0,
                      fontSize: 11,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      borderRadius: 12,
                      padding: '1px 8px',
                      fontWeight: 500,
                    }}
                  >
                    <ClockCircleOutlined /> ~{step.estimatedMinutes} นาที
                  </Tag>
                )}
              </div>

              {step.description ? (
                <Paragraph
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-line',
                    color: isDarkMode ? '#94a3b8' : '#475569',
                    fontSize: 12.5,
                    lineHeight: 1.6,
                  }}
                >
                  {step.description}
                </Paragraph>
              ) : (
                <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>
                  ไม่มีรายละเอียดคำอธิบายเพิ่มเติม
                </Text>
              )}

              {/* Responsible Role placed underneath the description */}
              {step.responsibleRole && (
                <div style={{ marginTop: 8 }}>
                  <Space size={6} align="center">
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      ผู้รับผิดชอบ:
                    </Text>
                    <RoleTag role={step.responsibleRole} />
                  </Space>
                </div>
              )}
            </Col>

            {/* Right Column: Step Images (Starts flush at the top with title on desktop, wraps below on mobile) */}
            {hasImages && (
              <Col xs={24} md={9} lg={8}>
                <div
                  style={{
                    background: isDarkMode ? '#14171b' : '#f8fafc',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ fontSize: 11, color: isDarkMode ? '#a1a1aa' : '#64748b', marginBottom: 6, fontWeight: 500 }}>
                    📷 ภาพประกอบ ({step.images?.length} รูป):
                  </div>
                  <StepImageViewer images={step.images} />
                </div>
              </Col>
            )}
          </Row>
        </Card>
      ),
    };
  });

  return (
    <div style={{ marginTop: 16 }}>
      <Timeline items={timelineItems} />
    </div>
  );
};
