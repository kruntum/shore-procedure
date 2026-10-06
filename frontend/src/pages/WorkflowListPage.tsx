import React, { useState } from 'react';
import { Card, Row, Col, Typography, Input, Select, Spin, Alert, Empty, Button, Space, Tag } from 'antd';
import {
  ApartmentOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWorkflows, useCategories } from '../hooks/queries';
import { WorkflowCard } from '../components/WorkflowCard';
import { useTheme } from '../contexts/ThemeContext';
import { authService } from '../services/auth';

const { Title, Text } = Typography;

export const WorkflowListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDarkMode, primaryColor } = useTheme();
  const isAdmin = authService.isAdmin();

  const [searchText, setSearchText] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : null
  );

  const { data: categories } = useCategories();
  const { data: workflows, isLoading, error } = useWorkflows();

  const filteredWorkflows = workflows?.filter((wf) => {
    const matchesCategory = selectedCategory ? wf.categoryId === selectedCategory : true;
    const matchesText = searchText.trim() === '' ||
      wf.title.toLowerCase().includes(searchText.toLowerCase()) ||
      wf.code.toLowerCase().includes(searchText.toLowerCase()) ||
      (wf.description && wf.description.toLowerCase().includes(searchText.toLowerCase()));
    return matchesCategory && matchesText;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ApartmentOutlined style={{ color: '#0284c7' }} />
            สายงานและกระบวนการปฏิบัติการทั้งหมด (Job Workflows)
          </Title>
          <Text type="secondary" style={{ fontSize: 12.5 }}>
            แผนผังสายงานร้อยเรียงคู่มือขั้นตอนปฏิบัติงาน (End-to-End Operation Flowcharts)
          </Text>
        </div>
        {isAdmin && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/workflows/new')}
            size="small"
          >
            สร้างสายงานใหม่
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <Card
        size="small"
        style={{
          marginBottom: 16,
          borderRadius: 8,
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
          background: isDarkMode ? '#1a1d21' : '#fff',
        }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={14} md={16}>
            <Input
              size="small"
              placeholder="ค้นหาชื่อสายงาน, รหัสสายงาน เช่น WF-IMP-FOOD..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={10} md={8}>
            <Select
              size="small"
              style={{ width: '100%' }}
              placeholder="เลือกหมวดหมู่ทั้งหมด"
              allowClear
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categories?.map((c) => ({
                value: c.id,
                label: `${c.icon} ${c.name}`,
              }))}
            />
          </Col>
        </Row>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="กำลังโหลดสายงานปฏิบัติการ..." />
        </div>
      ) : error ? (
        <Alert type="error" message="ไม่สามารถโหลดข้อมูลสายงานได้" showIcon />
      ) : filteredWorkflows && filteredWorkflows.length === 0 ? (
        <Card
          size="small"
          style={{
            textAlign: 'center',
            padding: '30px 0',
            borderRadius: 8,
            background: isDarkMode ? '#1a1d21' : '#fff',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
          }}
        >
          <Empty description="ไม่พบสายงานที่ตรงกับเงื่อนไขการค้นหา" />
          {selectedCategory && (
            <Button size="small" type="primary" onClick={() => setSelectedCategory(null)} style={{ marginTop: 12 }}>
              ล้างตัวกรองหมวดหมู่
            </Button>
          )}
        </Card>
      ) : (
        <Row gutter={[14, 14]}>
          {filteredWorkflows?.map((wf) => (
            <Col key={wf.id} xs={24} sm={12} md={8} lg={6}>
              <WorkflowCard workflow={wf} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};
