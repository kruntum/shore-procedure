import React, { useState } from 'react';
import { Card, Row, Col, Typography, Tag, Space, Input, Spin, Alert, Button, Select, Divider, Empty, Tooltip } from 'antd';
import {
  CompassOutlined,
  ClockCircleOutlined,
  RightOutlined,
  PlusOutlined,
  AppstoreOutlined,
  BankOutlined,
  BookOutlined,
  HistoryOutlined,
  TeamOutlined,
  SearchOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCategories, useProcedures } from '../hooks/queries';
import { useTheme } from '../contexts/ThemeContext';
import { authService } from '../services/auth';
import { Procedure } from '../types';

const { Title, Text, Paragraph } = Typography;

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, primaryColor } = useTheme();
  const [filterText, setFilterText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: procedures, isLoading: isProceduresLoading, error: proceduresError } = useProcedures();
  const user = authService.getCurrentUser();

  // Filter procedures by search text and selected category
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

  return (
    <div>
      {/* Hero Banner */}
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
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={17}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Tag color="#fff" style={{ color: '#0958d9', fontWeight: 700, borderRadius: 4, margin: 0 }}>
                ASIATHAI LOGISTICS
              </Tag>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>
                Single Source of Truth
              </Text>
            </div>
            <Title level={3} style={{ color: '#fff', margin: 0 }}>
              Asiathai Freight SOP — ระบบคู่มือปฏิบัติงานนำเข้า-ส่งออก
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.9)', margin: '8px 0 0', fontSize: 13 }}>
              คลังคู่มือขั้นตอนการทำงานครบวงจร: พิธีการศุลกากร, ขอใบรับรองราชการ (Form E, ไฟโต, มกอช.), งานหน้าท่าเรือ, สายเรือ และงานภายใน
            </Paragraph>
          </Col>
          <Col xs={24} md={7} style={{ textAlign: 'right' }}>
            <Space size="small" wrap>
              {user && (
                <Button
                  type="primary"
                  ghost
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/admin/procedures/new')}
                  style={{ borderColor: '#fff', color: '#fff' }}
                >
                  เพิ่มคู่มือใหม่
                </Button>
              )}
              <Button
                type="default"
                onClick={() => navigate('/procedures')}
                style={{ background: '#fff', color: '#0958d9', fontWeight: 600, border: 'none' }}
              >
                ดูคู่มือทั้งหมด ({procedures?.length || 0})
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Category Navigation Dashboard */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <Title level={5} style={{ margin: 0, fontSize: 15 }}>
              <AppstoreOutlined style={{ marginRight: 6, color: primaryColor }} />
              หมวดหมู่การปฏิบัติงาน (Operation Categories)
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              คลิกหมวดหมู่ที่ต้องการเพื่อกรองคู่มือทันที
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
              const count = procedures?.filter((p) => p.categoryId === cat.id).length || 0;
              const isSelected = selectedCategory === cat.id;

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
                      border: isSelected ? `2px solid ${primaryColor}` : (isDarkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #e2e8f0'),
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
                      <Tag color={cat.color || 'blue'} style={{ margin: 0, fontWeight: 600, fontSize: 11 }}>
                        {count} คู่มือ
                      </Tag>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <Text strong style={{ fontSize: 13, display: 'block', color: isSelected ? primaryColor : undefined }}>
                        {cat.name}
                      </Text>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>

      <Divider style={{ margin: '20px 0' }} />

      {/* Recently Updated Procedures Section */}
      <div style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={5} style={{ margin: 0, fontSize: 15 }}>
              <HistoryOutlined style={{ marginRight: 6, color: primaryColor }} />
              คู่มือปฏิบัติงานล่าสุด (Recently Updated Procedures)
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {selectedCategory
                ? `แสดงคู่มือเฉพาะหมวดหมู่ "${categories?.find((c) => c.id === selectedCategory)?.name}"`
                : 'ขั้นตอนการปฏิบัติงานที่สร้างและอัปเดตล่าสุด สามารถคลิกเพื่อดูขั้นตอนและรูปภาพประกอบได้ทันที'}
            </Text>
          </Col>
          <Col>
            <Text type="secondary" style={{ fontSize: 12 }}>
              พบ {filteredProcedures?.length || 0} จาก {procedures?.length || 0} คู่มือ
            </Text>
          </Col>
        </Row>
      </div>

      {/* Filter Toolbar for Procedures */}
      <Card
        size="small"
        style={{
          marginBottom: 16,
          borderRadius: 8,
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #e2e8f0',
          boxShadow: isDarkMode ? '0 4px 14px -2px rgba(0, 0, 0, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.03)',
          background: isDarkMode ? '#1a1d21' : '#fff',
        }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={14} md={16}>
            <Input
              size="small"
              placeholder="ค้นหาชื่อคู่มือ, ท่าเรือ, สายเรือ, หรือหน่วยงานราชการ..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
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

      {/* Procedures Loading & Error */}
      {isProceduresLoading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" tip="กำลังโหลดคู่มือปฏิบัติงาน..." />
        </div>
      )}

      {proceduresError && (
        <Alert
          type="error"
          message="ไม่สามารถเชื่อมต่อฐานข้อมูลได้"
          description="โปรดตรวจสอบว่า PostgreSQL ทำงานปกติ"
          showIcon
        />
      )}

      {/* Procedures Cards Grid */}
      {!isProceduresLoading && filteredProcedures && filteredProcedures.length === 0 && (
        <Card
          size="small"
          style={{
            textAlign: 'center',
            padding: '30px 0',
            borderRadius: 8,
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #e2e8f0',
            background: isDarkMode ? '#1a1d21' : '#fff',
          }}
        >
          <Empty description="ไม่พบคู่มือที่ตรงกับเงื่อนไขการค้นหา" />
          {selectedCategory && (
            <Button size="small" type="primary" onClick={() => setSelectedCategory(null)} style={{ marginTop: 12 }}>
              ล้างตัวกรองหมวดหมู่
            </Button>
          )}
        </Card>
      )}

      <Row gutter={[14, 14]}>
        {filteredProcedures?.map((proc) => {
          const totalSteps = proc.variants?.reduce((acc, v) => acc + (v.steps?.length || 0), 0) || 0;
          const govList = proc.governmentAgencies && proc.governmentAgencies.length > 0
            ? proc.governmentAgencies
            : proc.governmentAgency ? [proc.governmentAgency] : [];

          return (
            <Col key={proc.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                size="small"
                onClick={() => navigate(`/procedures/${proc.id}`)}
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 8,
                  border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #e2e8f0',
                  borderTop: `3px solid ${proc.category?.color ? `var(--ant-${proc.category.color})` : primaryColor}`,
                  boxShadow: isDarkMode ? '0 4px 16px -2px rgba(0, 0, 0, 0.45)' : '0 1px 3px rgba(0, 0, 0, 0.03)',
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
                  {/* Card Top: Category and WorkType tags */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    {proc.category ? (
                      <Tag color={proc.category.color || 'blue'} style={{ margin: 0, fontSize: 10.5, fontWeight: 500 }}>
                        <span style={{ marginRight: 3 }}>{proc.category.icon}</span>
                        {proc.category.name}
                      </Tag>
                    ) : (
                      <Tag color="default" style={{ margin: 0, fontSize: 10.5 }}>ทั่วไป</Tag>
                    )}

                    {proc.workType && (
                      <Tag color="purple" style={{ margin: 0, fontSize: 10.5 }}>
                        {proc.workType.name}
                      </Tag>
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
                    {proc.title}
                  </Title>

                  {/* Description excerpt */}
                  {proc.description && (
                    <Paragraph
                      ellipsis={{ rows: 1 }}
                      type="secondary"
                      style={{ fontSize: 11.5, margin: '0 0 10px', lineHeight: 1.3 }}
                    >
                      {proc.description}
                    </Paragraph>
                  )}

                  {/* Context Info: Port / Gov Agency / Agents */}
                  <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {proc.port && (
                      <div style={{ fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CompassOutlined style={{ color: '#1677ff' }} />
                        <Text strong style={{ fontSize: 11.5 }}>ท่าเรือ {proc.port.code}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>({proc.port.name})</Text>
                      </div>
                    )}

                    {govList.length > 0 && (
                      <div style={{ fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                        <BankOutlined style={{ color: '#fa541c' }} />
                        {govList.map((g) => (
                          <Tag key={g.id} color="volcano" style={{ margin: 0, fontSize: 10 }}>
                            {g.shortName || g.name}
                          </Tag>
                        ))}
                      </div>
                    )}

                    {proc.agents && proc.agents.length > 0 && (
                      <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                        <TeamOutlined style={{ color: '#13c2c2' }} />
                        <span style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>สายเรือ:</span>
                        {proc.agents.slice(0, 3).map((ag) => (
                          <Tag key={ag.id} color="cyan" style={{ margin: 0, fontSize: 9.5 }}>
                            {ag.code}
                          </Tag>
                        ))}
                        {proc.agents.length > 3 && (
                          <span style={{ fontSize: 10, color: isDarkMode ? '#a1a1aa' : '#94a3b8' }}>+{proc.agents.length - 3}</span>
                        )}
                      </div>
                    )}

                    {proc.contactHotline && (
                      <div style={{ fontSize: 11, color: '#52c41a', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <PhoneOutlined />
                        <span>{proc.contactHotline}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Variants, Steps, and Action */}
                <div style={{ marginTop: 12, paddingTop: 8, borderTop: isDarkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size={6} style={{ fontSize: 11, color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                      <span>📋 {proc.variants?.length || 0} เงื่อนไข</span>
                      <span>•</span>
                      <span>👣 {totalSteps} ขั้นตอน</span>
                    </Space>

                    <Text style={{ color: primaryColor, fontSize: 11.5, fontWeight: 500 }}>
                      ดูขั้นตอน <RightOutlined style={{ fontSize: 10 }} />
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};
