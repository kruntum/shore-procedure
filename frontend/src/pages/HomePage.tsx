import React, { useState } from 'react';
import { Card, Row, Col, Typography, Tag, Space, Input, Spin, Alert, Button, Select, Divider, Empty, Tabs } from 'antd';
import {
  RightOutlined,
  AppstoreOutlined,
  SearchOutlined,
  ApartmentOutlined,
  BookOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCategories, useProcedures, useWorkflows } from '../hooks/queries';
import { useTheme } from '../contexts/ThemeContext';
import { WorkflowCard } from '../components/WorkflowCard';
import { ProcedureCard } from '../components/ProcedureCard';

const { Title, Text, Paragraph } = Typography;

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, primaryColor } = useTheme();
  const [filterText, setFilterText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('workflows');

  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: procedures, isLoading: isProceduresLoading, error: proceduresError } = useProcedures();
  const { data: workflows, isLoading: isWorkflowsLoading, error: workflowsError } = useWorkflows();

  // Filter workflows
  const filteredWorkflows = workflows?.filter((wf) => {
    const matchesCategory = selectedCategory ? wf.categoryId === selectedCategory : true;
    const matchesText = filterText.trim() === '' ||
      wf.title.toLowerCase().includes(filterText.toLowerCase()) ||
      wf.code.toLowerCase().includes(filterText.toLowerCase()) ||
      (wf.description && wf.description.toLowerCase().includes(filterText.toLowerCase()));
    return matchesCategory && matchesText;
  });

  // Filter procedures
  const filteredProcedures = procedures?.filter((proc) => {
    const matchesCategory = selectedCategory ? proc.categoryId === selectedCategory : true;
    const matchesText = filterText.trim() === '' ||
      proc.title.toLowerCase().includes(filterText.toLowerCase()) ||
      (proc.description && proc.description.toLowerCase().includes(filterText.toLowerCase())) ||
      (proc.port && proc.port.code.toLowerCase().includes(filterText.toLowerCase())) ||
      (proc.agents && proc.agents.some((a) => a.code.toLowerCase().includes(filterText.toLowerCase()))) ||
      (proc.governmentAgencies && proc.governmentAgencies.some((g) => (g.shortName || g.name).toLowerCase().includes(filterText.toLowerCase())));
    return matchesCategory && matchesText;
  });

  const recentWorkflows = filteredWorkflows?.slice(0, 4) || [];
  const recentProcedures = filteredProcedures?.slice(0, 4) || [];

  return (
    <div>
      {/* 1. Hero Banner */}
      <Card
        style={{
          marginBottom: 20,
          background: isDarkMode
            ? 'linear-gradient(135deg, #092b00 0%, #003a8c 50%, #1f1f1f 100%)'
            : 'linear-gradient(135deg, #0958d9 0%, #1677ff 50%, #36cfc9 100%)',
          borderRadius: 8,
          border: 'none',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Tag color="#fff" style={{ color: '#0958d9', fontWeight: 700, borderRadius: 4, margin: 0 }}>
                Operations Hub
              </Tag>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>
                Asiathai Freight SOP & Workflow Management System
              </Text>
            </div>
            <Title level={3} style={{ color: '#fff', margin: 0 }}>
              ระบบคู่มือและสายงานปฏิบัติการนำเข้า-ส่งออกครบวงจร
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.9)', margin: '8px 0 0', fontSize: 13 }}>
              เชื่อมโยงขั้นตอนตั้งแต่ยื่นใบอนุญาตหน่วยงานรัฐ พิธีการศุลกากร จนถึงการชำระค่าภาระท่าเรือและแลก D/O ปล่อยสินค้า
            </Paragraph>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Button
                ghost
                icon={<ApartmentOutlined />}
                onClick={() => navigate('/workflows')}
                style={{ borderColor: '#fff', color: '#fff', fontWeight: 500 }}
              >
                ดูผังโฟลว์งานทั้งหมด
              </Button>
              <Button
                icon={<BookOutlined />}
                onClick={() => navigate('/procedures')}
                style={{ background: '#fff', color: '#0958d9', fontWeight: 600, border: 'none' }}
              >
                ดูคู่มือทั้งหมด
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 2. Unified Quick Search & Filter */}
      <Card
        size="small"
        style={{
          marginBottom: 20,
          borderRadius: 8,
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
          boxShadow: isDarkMode ? '0 4px 14px -2px rgba(0, 0, 0, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.03)',
          background: isDarkMode ? '#1a1d21' : '#fff',
        }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={15} md={16}>
            <Input
              size="middle"
              placeholder="ค้นหาชื่อโฟลว์งาน, ชื่อคู่มือ SOP, ท่าเรือ, สายเรือ, หรือหน่วยงานราชการ..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={9} md={8}>
            <Select
              size="middle"
              style={{ width: '100%' }}
              placeholder="กรองตามหมวดหมู่ทั้งหมด"
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

      {/* 3. Category Overview Cards (แสดงทั้งโฟลว์และคู่มือ) */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <Title level={5} style={{ margin: 0, fontSize: 15 }}>
              <AppstoreOutlined style={{ marginRight: 6, color: primaryColor }} />
              หมวดหมู่การปฏิบัติงาน (Operation Categories)
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              คลิกการ์ดหมวดหมู่เพื่อกรองดูเฉพาะงานในหมวดหมู่นั้นๆ
            </Text>
          </div>
          {selectedCategory && (
            <Button
              type="link"
              size="small"
              onClick={() => setSelectedCategory(null)}
              style={{ padding: 0 }}
            >
              แสดงทุกหมวดหมู่ (ล้างตัวกรอง)
            </Button>
          )}
        </div>

        {isCategoriesLoading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Spin size="small" />
          </div>
        ) : (
          <Row gutter={[12, 12]}>
            {categories?.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const wfCount = cat.workflowCount ?? (workflows?.filter((w) => w.categoryId === cat.id).length || 0);
              const procCount = cat.procedureCount ?? (procedures?.filter((p) => p.categoryId === cat.id).length || 0);

              return (
                <Col key={cat.id} xs={24} sm={12} md={8} lg={4} style={{ flexGrow: 1 }}>
                  <Card
                    hoverable
                    size="small"
                    onClick={() => {
                      setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                    }}
                    style={{
                      height: '100%',
                      borderRadius: 8,
                      border: isSelected ? `2px solid ${primaryColor}` : (isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0'),
                      borderTop: `3px solid var(--ant-${cat.color || 'blue'})`,
                      background: isSelected ? (isDarkMode ? '#1e293b' : '#f0f7ff') : (isDarkMode ? '#1a1d21' : '#fff'),
                      boxShadow: isDarkMode ? '0 4px 14px -2px rgba(0, 0, 0, 0.4)' : '0 1px 3px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    bodyStyle={{ padding: '12px 14px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 26, lineHeight: 1 }}>{cat.icon}</span>
                      <Tag color={cat.color || 'blue'} style={{ margin: 0, fontWeight: 600, fontSize: 10.5 }}>
                        {wfCount} โฟลว์
                      </Tag>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <Text strong style={{ fontSize: 13, display: 'block', color: isSelected ? primaryColor : undefined }}>
                        {cat.name}
                      </Text>
                      <div style={{ fontSize: 11, marginTop: 4, color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                        <span>📊 {wfCount} โฟลว์</span>
                        <span style={{ margin: '0 4px' }}>•</span>
                        <span>📖 {procCount} คู่มือ</span>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>

      <Divider style={{ margin: '20px 0' }} />

      {/* 4. Operations Dashboard with Tabs Switcher */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="middle"
        tabBarExtraContent={
          <Button
            type="link"
            size="small"
            onClick={() => navigate(activeTab === 'workflows' ? '/workflows' : '/procedures')}
            style={{ fontSize: 13, padding: 0 }}
          >
            {activeTab === 'workflows'
              ? `ดูผังสายงานทั้งหมด (${filteredWorkflows?.length || 0})`
              : `ดูคู่มือปฏิบัติงานทั้งหมด (${filteredProcedures?.length || 0})`}{' '}
            <RightOutlined style={{ fontSize: 11 }} />
          </Button>
        }
        items={[
          {
            key: 'workflows',
            label: (
              <span style={{ fontSize: 13.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ApartmentOutlined style={{ color: '#0284c7' }} />
                ผังสายงานปฏิบัติการ (Job Workflows)
                <Tag color="cyan" style={{ borderRadius: 10, margin: '0 0 0 4px', fontSize: 11 }}>
                  {filteredWorkflows?.length || 0}
                </Tag>
              </span>
            ),
            children: (
              <div style={{ marginTop: 8 }}>
                <div style={{ marginBottom: 14 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    🗺️ แผนผังกระบวนการแบบภาพรวม (End-to-End) ร้อยเรียงขั้นตอนและคู่มือที่เกี่ยวข้องเป็นลำดับการทำงาน
                  </Text>
                </div>

                {isWorkflowsLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="small" tip="กำลังโหลดสายงาน..." />
                  </div>
                ) : workflowsError ? (
                  <Alert type="warning" message="ไม่สามารถดึงข้อมูลสายงานได้" showIcon />
                ) : filteredWorkflows?.length === 0 ? (
                  <Card
                    size="small"
                    style={{
                      textAlign: 'center',
                      padding: '32px 0',
                      borderRadius: 8,
                      background: isDarkMode ? '#1a1d21' : '#fff',
                      border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                    }}
                  >
                    <Empty description="ไม่พบสายงานที่ตรงกับเงื่อนไขการค้นหา" />
                  </Card>
                ) : (
                  <Row gutter={[16, 16]}>
                    {filteredWorkflows?.map((wf) => (
                      <Col key={wf.id} xs={24} sm={12} md={8} lg={6} style={{ display: 'flex' }}>
                        <WorkflowCard workflow={wf} />
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            ),
          },
          {
            key: 'procedures',
            label: (
              <span style={{ fontSize: 13.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOutlined style={{ color: '#1677ff' }} />
                คู่มือปฏิบัติงาน (Standard Procedures)
                <Tag color="blue" style={{ borderRadius: 10, margin: '0 0 0 4px', fontSize: 11 }}>
                  {filteredProcedures?.length || 0}
                </Tag>
              </span>
            ),
            children: (
              <div style={{ marginTop: 8 }}>
                <div style={{ marginBottom: 14 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    📖 คู่มือการปฏิบัติงานรายขั้นตอน (SOP) ข้อมูลเงื่อนไข ท่าเรือ หน่วยงานรัฐ และภาพหน้าจอประกอบจริง
                  </Text>
                </div>

                {isProceduresLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="small" tip="กำลังโหลดคู่มือ..." />
                  </div>
                ) : proceduresError ? (
                  <Alert type="warning" message="ไม่สามารถดึงข้อมูลคู่มือได้" showIcon />
                ) : filteredProcedures?.length === 0 ? (
                  <Card
                    size="small"
                    style={{
                      textAlign: 'center',
                      padding: '32px 0',
                      borderRadius: 8,
                      background: isDarkMode ? '#1a1d21' : '#fff',
                      border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                    }}
                  >
                    <Empty description="ไม่พบคู่มือที่ตรงกับเงื่อนไขการค้นหา" />
                  </Card>
                ) : (
                  <Row gutter={[16, 16]}>
                    {filteredProcedures?.map((proc) => (
                      <Col key={proc.id} xs={24} sm={12} md={8} lg={6} style={{ display: 'flex' }}>
                        <ProcedureCard procedure={proc} />
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};
