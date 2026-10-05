import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  AutoComplete,
  Button,
  Space,
  Typography,
  Divider,
  message,
  Row,
  Col,
  Tag,
  Spin,
  Alert,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  MinusCircleOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { usePorts, useAgents, useWorkTypes, useProcedure, useProcedureRoles, useCategories, useGovernmentAgencies } from '../../hooks/queries';
import { useCreateProcedure, useUpdateProcedure } from '../../hooks/mutations';
import { StepImageUploader } from '../../components/StepImageUploader';
import { DEFAULT_ROLES } from '../../components/RoleTag';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Text } = Typography;

export const ProcedureBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, primaryColor } = useTheme();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;
  const procedureId = isEditing ? parseInt(id) : undefined;

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const { data: categories } = useCategories();
  const { data: govAgencies } = useGovernmentAgencies(true);
  const { data: ports } = usePorts();
  const { data: agents } = useAgents();
  const { data: workTypes } = useWorkTypes();
  const { data: existingProc, isLoading: isProcLoading } = useProcedure(procedureId);
  const { data: serverRoles } = useProcedureRoles();

  const watchedCategoryId = Form.useWatch('categoryId', form);
  const currentCategory = categories?.find((c) => c.id === watchedCategoryId);

  const roleOptions = Array.from(new Set([...(serverRoles || []), ...DEFAULT_ROLES])).map((r) => ({
    value: r,
    label: r,
  }));

  const createMutation = useCreateProcedure();
  const updateMutation = useUpdateProcedure();

  useEffect(() => {
    if (isEditing && existingProc) {
      const initialAgentIds =
        existingProc.agents && existingProc.agents.length > 0
          ? existingProc.agents.map((a) => a.id)
          : existingProc.agentId
          ? [existingProc.agentId]
          : [];

      const initialGovAgencyIds =
        existingProc.governmentAgencies && existingProc.governmentAgencies.length > 0
          ? existingProc.governmentAgencies.map((g) => g.id)
          : existingProc.governmentAgencyId
          ? [existingProc.governmentAgencyId]
          : [];

      form.setFieldsValue({
        categoryId: existingProc.categoryId,
        portId: existingProc.portId,
        agentIds: initialAgentIds,
        governmentAgencyIds: initialGovAgencyIds,
        workTypeId: existingProc.workTypeId,
        title: existingProc.title,
        description: existingProc.description,
        referenceDocuments: existingProc.referenceDocuments || 'B/L, Booking Confirmation, ใบเสร็จชำระเงิน',
        contactHotline: existingProc.contactHotline || '',
        variants: existingProc.variants?.map((v) => ({
          id: v.id,
          conditionName: v.conditionName,
          executionMethod: v.executionMethod,
          cutoffTime: v.cutoffTime,
          notes: v.notes,
          steps: v.steps?.map((s) => ({
            id: s.id,
            stepNumber: s.stepNumber,
            title: s.title,
            description: s.description,
            responsibleRole: s.responsibleRole || 'พนักงานหน้างาน / ชิปปิ้ง',
          })),
        })),
      });
    } else if (!isEditing) {
      const defaultCategoryId = searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : (categories?.[0]?.id || 1);
      const defaultPortId = searchParams.get('portId') ? parseInt(searchParams.get('portId')!) : undefined;
      const defaultAgentId = searchParams.get('agentId') ? parseInt(searchParams.get('agentId')!) : undefined;
      const defaultGovId = searchParams.get('governmentAgencyId') ? parseInt(searchParams.get('governmentAgencyId')!) : undefined;

      form.setFieldsValue({
        categoryId: defaultCategoryId,
        portId: defaultPortId,
        agentIds: defaultAgentId ? [defaultAgentId] : [],
        governmentAgencyIds: defaultGovId ? [defaultGovId] : [],
        workTypeId: 1, // Default to จ่ายชอร์
        referenceDocuments: 'B/L, Booking Confirmation, ใบเสร็จชำระเงิน',
        variants: [
          {
            conditionName: 'กรณีปกติ (ชำระผ่านระบบ e-Portal)',
            executionMethod: 'Web Portal',
            cutoffTime: 'ก่อน 15:30 น.',
            notes: '',
            steps: [
              {
                stepNumber: 1,
                title: 'เข้าสู่ระบบและตรวจสอบเอกสาร',
                description: '',
                responsibleRole: 'พนักงานหน้างาน / ชิปปิ้ง',
              },
            ],
          },
        ],
      });
    }
  }, [isEditing, existingProc, searchParams, form, categories]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      // Format variants and steps with correct 1-based order numbers
      const formattedVariants = values.variants?.map((v: any, vIdx: number) => ({
        ...v,
        sortOrder: vIdx + 1,
        steps: v.steps?.map((s: any, sIdx: number) => ({
          ...s,
          stepNumber: sIdx + 1,
          sortOrder: sIdx + 1,
        })),
      }));

      const payload = {
        ...values,
        variants: formattedVariants,
      };

      if (isEditing && procedureId) {
        await updateMutation.mutateAsync({
          id: procedureId,
          data: payload,
        });
        message.success('แก้ไขข้อมูลคู่มือและขั้นตอนสำเร็จ');
        navigate(`/procedures/${procedureId}`);
      } else {
        const res = await createMutation.mutateAsync(payload);
        const createdId = res.data.data.id;
        message.success('สร้างคู่มือใหม่สำเร็จ! คุณสามารถอัปโหลดภาพหน้าจอประกอบขั้นตอนได้ทันที');
        // Redirect to edit mode so admin can upload screenshots immediately
        navigate(`/admin/procedures/${createdId}/edit`);
      }
    } catch (err: any) {
      message.error(err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  if (isEditing && isProcLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <Spin size="large" tip="กำลังโหลดข้อมูลคู่มือ..." />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          ย้อนกลับ
        </Button>
        {isEditing && (
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`/procedures/${procedureId}`)}
          >
            ดูหน้าคู่มือจริง (Manual View)
          </Button>
        )}
      </div>

      <Card
        style={{
          borderRadius: 8,
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #e2e8f0',
          boxShadow: isDarkMode ? '0 4px 16px -2px rgba(0, 0, 0, 0.45)' : '0 1px 4px rgba(0, 0, 0, 0.05)',
          background: isDarkMode ? '#1a1d21' : '#fff',
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          {isEditing ? 'แก้ไขคู่มือขั้นตอนการปฏิบัติงาน & จัดการภาพ' : 'สร้างคู่มือขั้นตอนการปฏิบัติงานใหม่'}
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          กำหนดเงื่อนไข (Variants) ลำดับขั้นตอน (Steps) และแนบภาพหน้าจอจริงประกอบขั้นตอน
        </Text>

        {!isEditing && (
          <Alert
            type="info"
            showIcon
            style={{ marginTop: 12, marginBottom: 16 }}
            message="ระบบการแนบภาพหน้าจอ"
            description="1. กรอกข้อมูลคู่มือ เงื่อนไข และขั้นตอนด้านล่างนี้  2. กดปุ่ม 'บันทึกคู่มือขั้นตอน'  3. ระบบจะพาเข้าสู่หน้าจัดการเพื่อให้อัปโหลดภาพหน้าจอประกอบแต่ละขั้นตอนได้ทันที"
          />
        )}

        <Divider style={{ margin: '16px 0' }} />

        <Form form={form} layout="vertical" onFinish={handleSubmit} size="small">
          {/* Main Info */}
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item
                name="categoryId"
                label="หมวดหมู่คู่มือ (Category)"
                rules={[{ required: true, message: 'กรุณาเลือกหมวดหมู่' }]}
              >
                <Select
                  placeholder="เลือกหมวดหมู่คู่มือ"
                  options={categories?.map((c) => ({
                    value: c.id,
                    label: `${c.icon} ${c.name}`,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="workTypeId"
                label="ประเภทงาน (Work Type)"
                rules={[{ required: true, message: 'กรุณาเลือกประเภทงาน' }]}
              >
                <Select
                  placeholder="เลือกประเภทงาน"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                  }
                  options={workTypes?.map((w) => ({ value: w.id, label: w.name }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="contactHotline" label="สายด่วน / เบอร์ติดต่อ (ถ้ามี)">
                <Input placeholder="เช่น สายด่วน 1164 หรือ 038-400-000" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            {/* Show Gov Agency if not strictly terminal or if selected */}
            {(!currentCategory || currentCategory.code !== 'TERMINAL_SHIPPING') && (
              <Col xs={24} md={12}>
                <Form.Item
                  name="governmentAgencyIds"
                  label="หน่วยงานราชการที่เกี่ยวข้อง (Government Agencies)"
                  tooltip="เช่น กรมศุลกากร, กรมการค้าต่างประเทศ (DFT), ด่านตรวจพืช (DOA)"
                >
                  <Select
                    mode="multiple"
                    placeholder="เลือกหน่วยงานราชการ..."
                    showSearch
                    allowClear
                    maxTagCount="responsive"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                    }
                    options={govAgencies?.map((g) => ({
                      value: g.id,
                      label: `${g.shortName ? `[${g.shortName}] ` : ''}${g.name}`,
                    }))}
                  />
                </Form.Item>
              </Col>
            )}

            <Col xs={24} md={(!currentCategory || currentCategory.code !== 'TERMINAL_SHIPPING') ? 12 : 8}>
              <Form.Item
                name="portId"
                label="ท่าเรือ / ด่านตรวจ (Port / Terminal)"
                tooltip="หากเป็นงานที่ต้องเข้าพื้นที่ท่าเรือหรือด่านตรวจหน้างาน"
              >
                <Select
                  placeholder="เลือกท่าเรือ (ถ้ามี)"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                  }
                  options={ports?.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` }))}
                />
              </Form.Item>
            </Col>

            {(!currentCategory || currentCategory.code === 'TERMINAL_SHIPPING') && (
              <Col xs={24} md={16}>
                <Form.Item
                  name="agentIds"
                  label={
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span>สายเรือ / เอเย่นต์ (เลือกได้หลายสายเรือ)</span>
                      <Space size="small">
                        <Button
                          type="link"
                          size="small"
                          style={{ padding: 0, fontSize: 11 }}
                          onClick={() => form.setFieldsValue({ agentIds: agents?.map((a) => a.id) })}
                        >
                          เลือกทุกสายเรือ (All)
                        </Button>
                        <span style={{ color: '#d9d9d9' }}>|</span>
                        <Button
                          type="link"
                          size="small"
                          style={{ padding: 0, fontSize: 11 }}
                          onClick={() => form.setFieldsValue({ agentIds: [] })}
                        >
                          ล้างค่า
                        </Button>
                      </Space>
                    </div>
                  }
                >
                  <Select
                    mode="multiple"
                    placeholder="เลือกสายเรือที่ใช้ขั้นตอนนี้ร่วมกัน..."
                    showSearch
                    allowClear
                    maxTagCount="responsive"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                    }
                    options={agents?.map((a) => ({ value: a.id, label: `${a.code} - ${a.name}` }))}
                  />
                </Form.Item>
              </Col>
            )}
          </Row>

          <Form.Item
            name="title"
            label="ชื่อหัวข้อคู่มือ (Procedure Title)"
            rules={[{ required: true, message: 'กรุณาระบุชื่อคู่มือ' }]}
          >
            <Input placeholder="เช่น ขั้นตอนการจ่ายชอร์ C1C2 ของสายเรือ WHL" />
          </Form.Item>

          <Form.Item name="description" label="รายละเอียดภาพรวม / คำชี้แจง">
            <Input.TextArea placeholder="คำอธิบายเพิ่มเติมเกี่ยวกับคู่มือฉบับนี้..." rows={2} />
          </Form.Item>

          <Form.Item
            name="referenceDocuments"
            label="เอกสารอ้างอิง (Reference Documents)"
            tooltip="เอกสารที่ต้องใช้ประกอบการทำงาน เช่น B/L, Booking Confirmation, ใบเสร็จชำระเงิน"
          >
            <Input placeholder="เช่น B/L, Booking Confirmation, ใบเสร็จชำระเงิน" />
          </Form.Item>

          {/* Variants and Steps Builder */}
          <Divider orientation="left" style={{ fontSize: 14 }}>
            เงื่อนไข / กรณีต่างๆ (Procedure Variants & Steps)
          </Divider>

          <Form.List name="variants">
            {(variantFields, { add: addVariant, remove: removeVariant }) => (
              <div>
                {variantFields.map((varField, varIndex) => {
                  const currentVar = existingProc?.variants?.[varIndex];

                  return (
                    <Card
                      key={varField.key}
                      size="small"
                      style={{
                        marginBottom: 16,
                        background: isDarkMode ? '#16191e' : '#fafafa',
                        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #d9d9d9',
                        boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.02)',
                        borderRadius: 8,
                      }}
                      title={
                        <Space>
                          <Tag color="blue">เงื่อนไขที่ {varIndex + 1}</Tag>
                          <span style={{ fontSize: 13 }}>ระบุสถานการณ์และลำดับขั้นตอน</span>
                        </Space>
                      }
                      extra={
                        variantFields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => removeVariant(varField.name)}
                          >
                            ลบเงื่อนไขนี้
                          </Button>
                        )
                      }
                    >
                      {/* Hidden field for variant id if exists */}
                      <Form.Item {...varField} name={[varField.name, 'id']} hidden>
                        <Input />
                      </Form.Item>

                      <Row gutter={[12, 0]}>
                        <Col xs={24} md={8}>
                          <Form.Item
                            {...varField}
                            name={[varField.name, 'conditionName']}
                            label="ชื่อเงื่อนไข/สถานการณ์"
                            rules={[{ required: true, message: 'กรุณากรอกชื่อเงื่อนไข' }]}
                          >
                            <Input placeholder="เช่น งานปกติ (ออนไลน์) หรือ ระบบขัดข้อง" />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                          <Form.Item
                            {...varField}
                            name={[varField.name, 'executionMethod']}
                            label="วิธีการดำเนินการ"
                            rules={[{ required: true, message: 'กรุณาระบุวิธีการทำ' }]}
                          >
                            <Input placeholder="เช่น Web Portal, ส่ง LINE, ยื่นหน้าเคาน์เตอร์" />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                          <Form.Item
                            {...varField}
                            name={[varField.name, 'cutoffTime']}
                            label="เวลาตัดรอบ (Cut-off Time)"
                          >
                            <Input placeholder="เช่น ก่อน 15:30 น." />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        {...varField}
                        name={[varField.name, 'notes']}
                        label="หมายเหตุ / ข้อควรระวังพิเศษสำหรับเงื่อนไขนี้"
                      >
                        <Input placeholder="เช่น กรุณาโทรยืนยันหลังส่งเอกสาร หรือ ต้องมีสลิปโอนเงิน..." />
                      </Form.Item>

                      {/* Steps within Variant */}
                      <div
                        style={{
                          marginTop: 12,
                          padding: '12px',
                          background: isDarkMode ? '#121418' : '#fff',
                          borderRadius: 6,
                          border: isDarkMode ? '1px dashed rgba(255, 255, 255, 0.12)' : '1px dashed #d9d9d9',
                        }}
                      >
                        <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                          ขั้นตอนการปฏิบัติงาน (Steps)
                        </Text>

                        <Form.List name={[varField.name, 'steps']}>
                          {(stepFields, { add: addStep, remove: removeStep, move: moveStep }) => (
                            <div>
                              {stepFields.map((stepField, stepIndex) => {
                                // Match step ID and existing images
                                const stepIdValue = form.getFieldValue([
                                  'variants',
                                  varField.name,
                                  'steps',
                                  stepField.name,
                                  'id',
                                ]);
                                const matchingStep =
                                  currentVar?.steps?.find((s) => s.id === stepIdValue) ||
                                  currentVar?.steps?.[stepIndex];

                                return (
                                  <Card
                                    key={stepField.key}
                                    size="small"
                                    style={{
                                      marginBottom: 10,
                                      background: isDarkMode ? '#1a1d21' : '#fff',
                                      border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #e2e8f0',
                                      boxShadow: isDarkMode ? '0 2px 6px rgba(0,0,0,0.25)' : '0 1px 2px rgba(0,0,0,0.02)',
                                      borderRadius: 6,
                                    }}
                                    bodyStyle={{ padding: 12 }}
                                  >
                                    {/* Hidden field for step id */}
                                    <Form.Item {...stepField} name={[stepField.name, 'id']} hidden>
                                      <Input />
                                    </Form.Item>

                                    <Row gutter={[8, 8]} align="middle">
                                      <Col xs={4} sm={1} style={{ textAlign: 'center' }}>
                                        <Tag color="geekblue" style={{ margin: 0, fontWeight: 'bold' }}>
                                          {stepIndex + 1}
                                        </Tag>
                                      </Col>

                                      <Col xs={20} sm={8}>
                                        <Form.Item
                                          {...stepField}
                                          name={[stepField.name, 'title']}
                                          style={{ marginBottom: 0 }}
                                          rules={[{ required: true, message: 'กรุณากรอกชื่อขั้นตอน' }]}
                                        >
                                          <Input placeholder={`ขั้นตอนที่ ${stepIndex + 1}: เช่น ล็อกอินเข้าระบบ`} />
                                        </Form.Item>
                                      </Col>

                                      <Col xs={16} sm={6}>
                                        <Form.Item
                                          {...stepField}
                                          name={[stepField.name, 'responsibleRole']}
                                          style={{ marginBottom: 0 }}
                                        >
                                          <AutoComplete
                                            options={roleOptions}
                                            placeholder="ผู้รับผิดชอบ (เช่น พนักงานหน้างาน)"
                                            filterOption={(inputValue, option) =>
                                              (option?.value ?? '').toLowerCase().includes(inputValue.toLowerCase())
                                            }
                                          />
                                        </Form.Item>
                                      </Col>

                                      <Col xs={24} sm={7}>
                                        <Form.Item
                                          {...stepField}
                                          name={[stepField.name, 'description']}
                                          style={{ marginBottom: 0 }}
                                        >
                                          <Input.TextArea
                                            placeholder="รายละเอียดวิธีปฏิบัติ..."
                                            autoSize={{ minRows: 1, maxRows: 3 }}
                                          />
                                        </Form.Item>
                                      </Col>

                                      {/* Step action buttons: Reorder Up/Down & Delete */}
                                      <Col xs={8} sm={2} style={{ textAlign: 'right' }}>
                                        <Space size={2}>
                                          <Tooltip title="เลื่อนขั้นตอนขึ้น">
                                            <Button
                                              type="text"
                                              size="small"
                                              disabled={stepIndex === 0}
                                              icon={<ArrowUpOutlined style={{ fontSize: 12 }} />}
                                              onClick={() => moveStep(stepIndex, stepIndex - 1)}
                                            />
                                          </Tooltip>
                                          <Tooltip title="เลื่อนขั้นตอนลง">
                                            <Button
                                              type="text"
                                              size="small"
                                              disabled={stepIndex === stepFields.length - 1}
                                              icon={<ArrowDownOutlined style={{ fontSize: 12 }} />}
                                              onClick={() => moveStep(stepIndex, stepIndex + 1)}
                                            />
                                          </Tooltip>
                                          {stepFields.length > 1 && (
                                            <Tooltip title="ลบขั้นตอนนี้">
                                              <Button
                                                type="text"
                                                danger
                                                size="small"
                                                icon={<MinusCircleOutlined style={{ fontSize: 12 }} />}
                                                onClick={() => removeStep(stepField.name)}
                                              />
                                            </Tooltip>
                                          )}
                                        </Space>
                                      </Col>
                                    </Row>

                                    {/* Image Uploader & Lightbox Viewer Component */}
                                    <div style={{ paddingLeft: 28, marginTop: 4 }}>
                                      <StepImageUploader
                                        stepId={matchingStep?.id}
                                        images={matchingStep?.images || []}
                                      />
                                    </div>
                                  </Card>
                                );
                              })}

                              <Button
                                type="dashed"
                                onClick={() =>
                                  addStep({
                                    stepNumber: stepFields.length + 1,
                                    title: '',
                                    description: '',
                                    responsibleRole: 'พนักงานหน้างาน / ชิปปิ้ง',
                                  })
                                }
                                block
                                icon={<PlusOutlined />}
                                style={{ marginTop: 4 }}
                              >
                                เพิ่มขั้นตอนถัดไป (Add Step)
                              </Button>
                            </div>
                          )}
                        </Form.List>
                      </div>
                    </Card>
                  );
                })}

                <Button
                  type="dashed"
                  onClick={() =>
                    addVariant({
                      conditionName: 'กรณีพิเศษ / ฉุกเฉิน',
                      executionMethod: 'LINE / หน้าเคาน์เตอร์',
                      cutoffTime: '',
                      notes: '',
                      steps: [
                        {
                          stepNumber: 1,
                          title: '',
                          description: '',
                          responsibleRole: 'พนักงานหน้างาน / ชิปปิ้ง',
                        },
                      ],
                    })
                  }
                  block
                  icon={<PlusOutlined />}
                  style={{ marginBottom: 20, height: 38 }}
                >
                  เพิ่มเงื่อนไข / กรณีใหม่ (Add Variant)
                </Button>
              </div>
            )}
          </Form.List>

          <Divider style={{ margin: '16px 0' }} />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => navigate(-1)}>ยกเลิก</Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting}>
                บันทึกคู่มือขั้นตอน
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
