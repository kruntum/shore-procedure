import React from 'react';
import { Card, Tag, Typography, Space } from 'antd';
import {
  CompassOutlined,
  BankOutlined,
  TeamOutlined,
  PhoneOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Procedure } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const { Title, Text, Paragraph } = Typography;

interface ProcedureCardProps {
  procedure: Procedure;
}

export const ProcedureCard: React.FC<ProcedureCardProps> = ({ procedure }) => {
  const navigate = useNavigate();
  const { isDarkMode, primaryColor } = useTheme();

  const totalSteps = procedure.variants?.reduce((acc, v) => acc + (v.steps?.length || 0), 0) || 0;
  const govList = procedure.governmentAgencies && procedure.governmentAgencies.length > 0
    ? procedure.governmentAgencies
    : procedure.governmentAgency ? [procedure.governmentAgency] : [];

  return (
    <Card
      hoverable
      size="small"
      onClick={() => navigate(`/procedures/${procedure.id}`)}
      style={{
        height: '100%',
        minHeight: 180,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 8,
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
        borderTop: `3px solid ${procedure.category?.color ? `var(--ant-${procedure.category.color})` : primaryColor}`,
        boxShadow: isDarkMode ? '0 4px 16px -2px rgba(0, 0, 0, 0.45)' : '0 1px 3px rgba(0, 0, 0, 0.03)',
        background: isDarkMode ? '#1a1d21' : '#fff',
        transition: 'all 0.2s ease',
      }}
      bodyStyle={{
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flex: 1,
      }}
    >
      <div>
        {/* Card Top: Category and WorkType tags */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          {procedure.category ? (
            <Tag color={procedure.category.color || 'blue'} style={{ margin: 0, fontSize: 10.5, fontWeight: 500 }}>
              <span style={{ marginRight: 3 }}>{procedure.category.icon}</span>
              {procedure.category.name}
            </Tag>
          ) : (
            <Tag color="default" style={{ margin: 0, fontSize: 10.5 }}>ทั่วไป</Tag>
          )}

          {procedure.workType && (
            <Tag color="purple" style={{ margin: 0, fontSize: 10.5 }}>
              {procedure.workType.name}
            </Tag>
          )}
        </div>

        {/* Title */}
        <Title
          level={5}
          ellipsis={{ rows: 2 }}
          style={{
            margin: '0 0 6px',
            fontSize: 13,
            lineHeight: 1.35,
            minHeight: 35,
            color: isDarkMode ? '#e2e8f0' : '#1e293b',
          }}
        >
          {procedure.title}
        </Title>

        {/* Description excerpt */}
        <Paragraph
          ellipsis={{ rows: 1 }}
          type="secondary"
          style={{ fontSize: 11, margin: '0 0 6px', minHeight: 18, lineHeight: 1.3 }}
        >
          {procedure.description || '-'}
        </Paragraph>

        {/* Context Info: Port / Gov Agency / Agents */}
        <div style={{ minHeight: 46, display: 'flex', flexDirection: 'column', gap: 3, justifyContent: 'flex-start' }}>
          {procedure.port && (
            <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <CompassOutlined style={{ color: '#1677ff' }} />
              <Text strong style={{ fontSize: 11 }}>ท่าเรือ {procedure.port.code}</Text>
              <Text type="secondary" style={{ fontSize: 10.5 }}>({procedure.port.name})</Text>
            </div>
          )}

          {govList.length > 0 && (
            <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
              <BankOutlined style={{ color: '#fa541c' }} />
              {govList.map((g) => (
                <Tag key={g.id} color="volcano" style={{ margin: 0, fontSize: 10 }}>
                  {g.shortName || g.name}
                </Tag>
              ))}
            </div>
          )}

          {procedure.agents && procedure.agents.length > 0 && (
            <div style={{ fontSize: 10.5, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
              <TeamOutlined style={{ color: '#13c2c2' }} />
              <span style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>สายเรือ:</span>
              {procedure.agents.slice(0, 2).map((ag) => (
                <Tag key={ag.id} color="cyan" style={{ margin: 0, fontSize: 9.5 }}>
                  {ag.code}
                </Tag>
              ))}
              {procedure.agents.length > 2 && (
                <span style={{ fontSize: 10, color: isDarkMode ? '#a1a1aa' : '#94a3b8' }}>+{procedure.agents.length - 2}</span>
              )}
            </div>
          )}

          {procedure.contactHotline && (
            <div style={{ fontSize: 11, color: '#52c41a', display: 'flex', alignItems: 'center', gap: 4 }}>
              <PhoneOutlined />
              <span>{procedure.contactHotline}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Bottom: Variants, Steps, and Action */}
      <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: isDarkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 20 }}>
          <Space size={6} style={{ fontSize: 11, color: isDarkMode ? '#94a3b8' : '#64748b' }}>
            <span>📋 {procedure.variants?.length || 0} เงื่อนไข</span>
            <span>•</span>
            <span>👣 {totalSteps} ขั้นตอน</span>
          </Space>

          <Text style={{ color: primaryColor, fontSize: 11.5, fontWeight: 500 }}>
            ดูขั้นตอน <RightOutlined style={{ fontSize: 10 }} />
          </Text>
        </div>
      </div>
    </Card>
  );
};
