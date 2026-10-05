import React from 'react';
import { Card, Row, Col, Typography, Tag, Space } from 'antd';
import { ClockCircleOutlined, InfoCircleOutlined, DollarOutlined } from '@ant-design/icons';
import { ProcedureVariant } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const { Text } = Typography;

export const SummaryBanner: React.FC<{ variant?: ProcedureVariant }> = ({ variant }) => {
  const { isDarkMode, primaryColor } = useTheme();
  if (!variant) return null;

  return (
    <Card
      size="small"
      style={{
        marginBottom: 16,
        background: isDarkMode ? '#16191f' : '#f8fafc',
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #e2e8f0',
        borderLeft: `4px solid ${primaryColor}`,
        boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.02)',
        borderRadius: 6,
      }}
    >
      <Row gutter={[16, 8]} align="middle">
        <Col xs={24} sm={8}>
          <Space>
            <DollarOutlined style={{ color: '#1677ff' }} />
            <Text type="secondary">วิธีการดำเนินการ:</Text>
            <Tag color="blue">{variant.executionMethod}</Tag>
          </Space>
        </Col>

        <Col xs={24} sm={8}>
          <Space>
            <ClockCircleOutlined style={{ color: '#fa8c16' }} />
            <Text type="secondary">เวลาตัดรอบ:</Text>
            <Text strong style={{ color: variant.cutoffTime ? '#cf1322' : 'inherit' }}>
              {variant.cutoffTime || 'ตลอดเวลาทำการ'}
            </Text>
          </Space>
        </Col>

        <Col xs={24} sm={8}>
          {variant.notes && (
            <Space align="start">
              <InfoCircleOutlined style={{ color: '#faad14', marginTop: 3 }} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {variant.notes}
              </Text>
            </Space>
          )}
        </Col>
      </Row>
    </Card>
  );
};
