import React from 'react';
import { Procedure, ProcedureVariant } from '../types';
import { getRoleMeta } from './RoleTag';

interface SOPDocumentA4Props {
  procedure: Procedure;
  selectedVariantId?: number | 'all';
  showImages?: boolean;
}

export const SOPDocumentA4: React.FC<SOPDocumentA4Props> = ({
  procedure,
  selectedVariantId = 'all',
  showImages = true,
}) => {
  const printDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const updatedDate = procedure.updatedAt
    ? new Date(procedure.updatedAt).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '-';

  const yearStr = procedure.createdAt
    ? new Date(procedure.createdAt).getFullYear().toString().slice(-2)
    : new Date().getFullYear().toString().slice(-2);

  const docCode = `SOP${yearStr}${String(procedure.id).padStart(4, '0')}`;

  const variantsToDisplay =
    selectedVariantId === 'all'
      ? procedure.variants || []
      : (procedure.variants || []).filter((v) => v.id === selectedVariantId);

  const govList =
    procedure.governmentAgencies && procedure.governmentAgencies.length > 0
      ? procedure.governmentAgencies
      : procedure.governmentAgency
      ? [procedure.governmentAgency]
      : [];

  const agentList =
    procedure.agents && procedure.agents.length > 0
      ? procedure.agents
      : procedure.agent
      ? [procedure.agent]
      : [];

  const hasGov = govList.length > 0;
  const hasPort = !!procedure.port;
  const hasAgents = agentList.length > 0;
  const hasHotline = !!procedure.contactHotline;

  return (
    <div
      className="a4-page-sheet"
      style={{
        fontFamily: "'Sarabun', -apple-system, BlinkMacSystemFont, sans-serif",
        color: '#1f2937',
        width: '210mm',
        minHeight: '297mm',
        padding: '12mm 15mm',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        position: 'relative',
        fontSize: '12.5px',
        lineHeight: 1.5,
      }}
    >
      {/* 1. Header Box */}
      <div
        className="sop-header-box"
        style={{
          border: '1.5px solid #111827',
          borderRadius: 2,
          marginBottom: 10,
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              {/* Logo / Company */}
              <td
                style={{
                  width: '22%',
                  padding: '10px 12px',
                  verticalAlign: 'middle',
                  borderRight: '1px solid #111827',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '24px', lineHeight: 1 }}>🚢</div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '11px',
                    color: '#0f172a',
                    marginTop: 4,
                    letterSpacing: '0.5px',
                  }}
                >
                  ASIATHAI FREIGHT SOP
                </div>
                <div style={{ fontSize: '9px', color: '#64748b' }}>
                  ระบบคู่มือปฏิบัติงานนำเข้า-ส่งออก
                </div>
              </td>

              {/* Title */}
              <td
                style={{
                  width: '52%',
                  padding: '8px 12px',
                  verticalAlign: 'middle',
                  borderRight: '1px solid #111827',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#475569',
                    letterSpacing: '0.5px',
                  }}
                >
                  เอกสารขั้นตอนการปฏิบัติงานมาตรฐาน {procedure.category ? `• ${procedure.category.icon} ${procedure.category.name}` : ''}
                </div>
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#0f172a',
                    margin: '3px 0',
                  }}
                >
                  {procedure.title}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  STANDARD OPERATING PROCEDURE ({procedure.category?.name ? procedure.category.name.toUpperCase() : 'FREIGHT & LOGISTICS'})
                </div>
              </td>

              {/* Document Meta */}
              <td
                style={{
                  width: '26%',
                  padding: '6px 10px',
                  verticalAlign: 'middle',
                  fontSize: '10px',
                  lineHeight: 1.5,
                  backgroundColor: '#f8fafc',
                }}
              >
                <div>
                  <span style={{ fontWeight: 600 }}>รหัสเอกสาร:</span> {docCode}
                </div>
                <div>
                  <span style={{ fontWeight: 600 }}>หมวดหมู่:</span> {procedure.category ? `${procedure.category.icon} ${procedure.category.name}` : 'ทั่วไป'}
                </div>
                <div>
                  <span style={{ fontWeight: 600 }}>วันที่อัปเดต:</span> {updatedDate}
                </div>
                <div>
                  <span style={{ fontWeight: 600 }}>ผู้จัดทำ:</span> {procedure.updatedBy || 'ผู้ดูแลระบบ'}
                </div>
                <div>
                  <span style={{ fontWeight: 600 }}>พิมพ์เมื่อ:</span> {printDate}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Metadata Grid (Dynamic Multi-Domain Adapter) */}
      <table
        className="sop-metadata-grid"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: 10,
          border: '1px solid #cbd5e1',
          fontSize: '11.5px',
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
        }}
      >
        <tbody>
          {/* Row 1: หมวดหมู่ & ประเภทงาน */}
          <tr>
            <th
              style={{
                width: '18%',
                padding: '5px 8px',
                border: '1px solid #cbd5e1',
                textAlign: 'left',
                color: '#334155',
                backgroundColor: '#f1f5f9',
              }}
            >
              หมวดหมู่ (Category)
            </th>
            <td
              style={{
                width: '32%',
                padding: '5px 8px',
                border: '1px solid #cbd5e1',
                fontWeight: 600,
              }}
            >
              {procedure.category ? `${procedure.category.icon} ${procedure.category.name}` : 'คู่มือทั่วไป'}
            </td>
            <th
              style={{
                width: '18%',
                padding: '5px 8px',
                border: '1px solid #cbd5e1',
                textAlign: 'left',
                color: '#334155',
                backgroundColor: '#f1f5f9',
              }}
            >
              ประเภทงาน (Work Type)
            </th>
            <td
              style={{
                width: '32%',
                padding: '5px 8px',
                border: '1px solid #cbd5e1',
                fontWeight: 600,
                color: '#2563eb',
              }}
            >
              {procedure.workType?.name || 'ขั้นตอนปฏิบัติงาน'}
            </td>
          </tr>

          {/* Row 2: หน่วยงานราชการ (ถ้ามี) */}
          {hasGov && (
            <tr>
              <th
                style={{
                  padding: '5px 8px',
                  border: '1px solid #cbd5e1',
                  textAlign: 'left',
                  color: '#334155',
                  backgroundColor: '#f1f5f9',
                }}
              >
                หน่วยงานราชการที่เกี่ยวข้อง
              </th>
              <td
                colSpan={hasPort || hasAgents ? 1 : 3}
                style={{
                  padding: '5px 8px',
                  border: '1px solid #cbd5e1',
                  fontWeight: 600,
                  color: '#c2410c',
                }}
              >
                {govList.map((g) => (g.shortName ? `[${g.shortName}] ${g.name}` : g.name)).join(', ')}
              </td>
              {hasPort ? (
                <>
                  <th
                    style={{
                      padding: '5px 8px',
                      border: '1px solid #cbd5e1',
                      textAlign: 'left',
                      color: '#334155',
                      backgroundColor: '#f1f5f9',
                    }}
                  >
                    ท่าเรือ / ด่านตรวจ
                  </th>
                  <td
                    style={{
                      padding: '5px 8px',
                      border: '1px solid #cbd5e1',
                      fontWeight: 600,
                    }}
                  >
                    {procedure.port ? `${procedure.port.code} - ${procedure.port.name}` : '-'}
                  </td>
                </>
              ) : hasAgents ? (
                <>
                  <th
                    style={{
                      padding: '5px 8px',
                      border: '1px solid #cbd5e1',
                      textAlign: 'left',
                      color: '#334155',
                      backgroundColor: '#f1f5f9',
                    }}
                  >
                    สายเรือ (Agent)
                  </th>
                  <td
                    style={{
                      padding: '5px 8px',
                      border: '1px solid #cbd5e1',
                      fontWeight: 600,
                    }}
                  >
                    {agentList.map((a) => `${a.code} - ${a.name}`).join(', ')}
                  </td>
                </>
              ) : null}
            </tr>
          )}

          {/* Row 3: ท่าเรือ / สายเรือ (ถ้ามี และยังไม่ได้แสดงคู่กับ Gov ด้านบน) */}
          {((hasPort && !hasGov) || (hasAgents && (!hasGov || hasPort))) && (
            <tr>
              <th
                style={{
                  padding: '5px 8px',
                  border: '1px solid #cbd5e1',
                  textAlign: 'left',
                  color: '#334155',
                  backgroundColor: '#f1f5f9',
                }}
              >
                {hasPort && !hasGov ? 'ท่าเรือ / ด่านตรวจ (Port)' : 'สายเรือ / เอเย่นต์ (Agent)'}
              </th>
              <td
                colSpan={hasPort && !hasGov && hasAgents ? 1 : 3}
                style={{
                  padding: '5px 8px',
                  border: '1px solid #cbd5e1',
                  fontWeight: 600,
                }}
              >
                {hasPort && !hasGov
                  ? `${procedure.port?.code} - ${procedure.port?.name}`
                  : agentList.map((a) => `${a.code} - ${a.name}`).join(', ')}
              </td>
              {hasPort && !hasGov && hasAgents && (
                <>
                  <th
                    style={{
                      padding: '5px 8px',
                      border: '1px solid #cbd5e1',
                      textAlign: 'left',
                      color: '#334155',
                      backgroundColor: '#f1f5f9',
                    }}
                  >
                    สายเรือ (Agent)
                  </th>
                  <td
                    style={{
                      padding: '5px 8px',
                      border: '1px solid #cbd5e1',
                      fontWeight: 600,
                    }}
                  >
                    {agentList.map((a) => `${a.code} - ${a.name}`).join(', ')}
                  </td>
                </>
              )}
            </tr>
          )}

          {/* Row 4: เอกสารอ้างอิง & สายด่วนติดต่อ */}
          <tr>
            <th
              style={{
                padding: '5px 8px',
                border: '1px solid #cbd5e1',
                textAlign: 'left',
                color: '#334155',
                backgroundColor: '#f1f5f9',
              }}
            >
              เอกสารอ้างอิง
            </th>
            <td
              colSpan={hasHotline ? 1 : 3}
              style={{
                padding: '5px 8px',
                border: '1px solid #cbd5e1',
              }}
            >
              {procedure.referenceDocuments || 'B/L, Booking Confirmation, ใบเสร็จชำระเงิน'}
            </td>
            {hasHotline && (
              <>
                <th
                  style={{
                    padding: '5px 8px',
                    border: '1px solid #cbd5e1',
                    textAlign: 'left',
                    color: '#334155',
                    backgroundColor: '#f1f5f9',
                  }}
                >
                  สายด่วน / ติดต่อ
                </th>
                <td
                  style={{
                    padding: '5px 8px',
                    border: '1px solid #cbd5e1',
                    fontWeight: 600,
                    color: '#dc2626',
                  }}
                >
                  📞 {procedure.contactHotline}
                </td>
              </>
            )}
          </tr>
        </tbody>
      </table>

      {/* 3. Overview Description */}
      {procedure.description && (
        <div
          className="sop-description-box"
          style={{
            padding: '6px 10px',
            backgroundColor: '#fafafa',
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            marginBottom: 10,
            fontSize: '11px',
            color: '#475569',
            pageBreakInside: 'avoid',
            breakInside: 'avoid',
          }}
        >
          <strong style={{ color: '#0f172a' }}>วัตถุประสงค์ & ขอบเขต: </strong>
          {procedure.description}
        </div>
      )}

      {/* 4. Procedure Variants & Steps */}
      {variantsToDisplay.map((variant, vIdx) => (
        <div
          key={variant.id}
          className="sop-variant-block"
          style={{
            marginBottom: 14,
            pageBreakInside: 'auto',
            breakInside: 'auto',
          }}
        >
          {/* Condition Header Bar & Summary */}
          <div
            className="sop-variant-header"
            style={{
              pageBreakAfter: 'avoid',
              breakAfter: 'avoid',
            }}
          >
            <div
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '5px 10px',
                fontWeight: 700,
                fontSize: '12.5px',
                borderRadius: '2px 2px 0 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>
                เงื่อนไขที่ {vIdx + 1}: {variant.conditionName}
              </span>
              <span style={{ fontSize: '10.5px', fontWeight: 400, color: '#cbd5e1' }}>
                วิธีปฏิบัติ: {variant.executionMethod}
              </span>
            </div>

            {/* Condition Summary */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderTop: 'none',
                padding: '6px 10px',
                fontSize: '11px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
            <div>
              <strong style={{ color: '#334155' }}>วิธีการดำเนินการ:</strong>{' '}
              <span style={{ color: '#0f172a', fontWeight: 600 }}>
                {variant.executionMethod}
              </span>
            </div>
            {variant.cutoffTime && (
              <div>
                <strong style={{ color: '#334155' }}>เวลาตัดรอบ (Cut-off Time):</strong>{' '}
                <span
                  style={{
                    color: '#b91c1c',
                    fontWeight: 700,
                    backgroundColor: '#fee2e2',
                    padding: '1px 6px',
                    borderRadius: 2,
                  }}
                >
                  {variant.cutoffTime}
                </span>
              </div>
            )}
            {variant.notes && (
              <div style={{ width: '100%', color: '#d97706', fontWeight: 500 }}>
                ⚠️ <strong>ข้อควรระวัง:</strong> {variant.notes}
              </div>
            )}
          </div>
        </div>

          {/* Steps Table */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #cbd5e1',
              borderTop: 'none',
              fontSize: '11.5px',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#e2e8f0', color: '#1e293b' }}>
                <th
                  style={{
                    width: '8%',
                    padding: '6px 4px',
                    border: '1px solid #cbd5e1',
                    textAlign: 'center',
                  }}
                >
                  ลำดับ
                </th>
                <th
                  style={{
                    width: showImages ? '52%' : '92%',
                    padding: '6px 10px',
                    border: '1px solid #cbd5e1',
                    textAlign: 'left',
                  }}
                >
                  ขั้นตอนและวิธีปฏิบัติงาน (Operating Steps)
                </th>
                {showImages && (
                  <th
                    style={{
                      width: '40%',
                      padding: '6px 8px',
                      border: '1px solid #cbd5e1',
                      textAlign: 'center',
                    }}
                  >
                    ภาพหน้าจอประกอบ / จุดสังเกต (Screenshots)
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {variant.steps && variant.steps.length > 0 ? (
                variant.steps.map((step, sIdx) => (
                  <tr
                    key={step.id || sIdx}
                    style={{
                      backgroundColor: sIdx % 2 === 0 ? '#ffffff' : '#fcfcfc',
                      pageBreakInside: 'avoid',
                    }}
                  >
                    {/* Step Number */}
                    <td
                      style={{
                        padding: '8px 4px',
                        border: '1px solid #cbd5e1',
                        textAlign: 'center',
                        verticalAlign: 'top',
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-block',
                          width: '22px',
                          height: '22px',
                          lineHeight: '22px',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          fontWeight: 700,
                          borderRadius: '50%',
                          fontSize: '11px',
                        }}
                      >
                        {step.stepNumber || sIdx + 1}
                      </div>
                    </td>

                    {/* Step Title & Description & Responsible Role */}
                    <td
                      style={{
                        padding: '8px 10px',
                        border: '1px solid #cbd5e1',
                        verticalAlign: 'top',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '8px',
                          marginBottom: 4,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: '12px',
                            color: '#0f172a',
                          }}
                        >
                          {step.title}
                        </div>
                        {step.responsibleRole && (() => {
                          const meta = getRoleMeta(step.responsibleRole);
                          return (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 600,
                                color: meta.textHex,
                                backgroundColor: meta.bgHex,
                                border: `1px solid ${meta.borderHex}`,
                                padding: '1px 6px',
                                borderRadius: '3px',
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                flexShrink: 0,
                              }}
                            >
                              <span>{meta.emoji}</span>
                              <span>{step.responsibleRole}</span>
                            </span>
                          );
                        })()}
                      </div>
                      {step.description && (
                        <div
                          style={{
                            color: '#475569',
                            lineHeight: 1.55,
                            whiteSpace: 'pre-line',
                          }}
                        >
                          {step.description}
                        </div>
                      )}
                    </td>

                    {/* Step Images */}
                    {showImages && (
                      <td
                        style={{
                          padding: '6px 8px',
                          border: '1px solid #cbd5e1',
                          verticalAlign: 'top',
                          textAlign: 'center',
                        }}
                      >
                        {step.images && step.images.length > 0 ? (
                          <div>
                            {step.images.map((img) => (
                              <div
                                key={img.id}
                                style={{
                                  marginBottom: 6,
                                  border: '1px solid #e2e8f0',
                                  padding: 3,
                                  borderRadius: 2,
                                  backgroundColor: '#fafafa',
                                }}
                              >
                                <img
                                  src={`/api/files/steps/${img.id}`}
                                  alt={img.caption || img.originalFilename}
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '140px',
                                    height: 'auto',
                                    display: 'block',
                                    margin: '0 auto',
                                    objectFit: 'contain',
                                  }}
                                />
                                {img.caption && (
                                  <div
                                    style={{
                                      fontSize: '9.5px',
                                      color: '#64748b',
                                      marginTop: 3,
                                      fontStyle: 'italic',
                                      textAlign: 'center',
                                      lineHeight: 1.3,
                                    }}
                                  >
                                    📌 {img.caption}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                            - ไม่มีรูปภาพประกอบ -
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={showImages ? 3 : 2}
                    style={{
                      padding: '12px',
                      textAlign: 'center',
                      color: '#94a3b8',
                      fontStyle: 'italic',
                    }}
                  >
                    ยังไม่มีขั้นตอนการปฏิบัติงานสำหรับเงื่อนไขนี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}

      {/* 5. Sign-off & Control Block */}
      <div
        className="sop-signatures-box"
        style={{
          marginTop: 16,
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          border: '1px solid #94a3b8',
          borderRadius: 2,
        }}
      >
        <div
          style={{
            backgroundColor: '#f1f5f9',
            padding: '4px 10px',
            fontWeight: 600,
            fontSize: '10.5px',
            borderBottom: '1px solid #94a3b8',
            color: '#334155',
          }}
        >
          การรับรองและการควบคุมเอกสาร (DOCUMENT APPROVAL & CONTROL)
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
          <tbody>
            <tr>
              <td
                style={{
                  width: '33.33%',
                  padding: '16px 8px 8px',
                  borderRight: '1px solid #cbd5e1',
                  verticalAlign: 'bottom',
                }}
              >
                <div style={{ height: '32px' }}></div>
                <div style={{ borderTop: '1px dotted #64748b', paddingTop: 4 }}>
                  (.......................................................)
                </div>
                <div style={{ fontSize: '10px', color: '#475569', marginTop: 2 }}>
                  ผู้จัดทำ / ผู้บันทึกขั้นตอน
                </div>
                <div style={{ fontSize: '9px', color: '#94a3b8' }}>
                  วันที่: ......./......./...........
                </div>
              </td>

              <td
                style={{
                  width: '33.33%',
                  padding: '16px 8px 8px',
                  borderRight: '1px solid #cbd5e1',
                  verticalAlign: 'bottom',
                }}
              >
                <div style={{ height: '32px' }}></div>
                <div style={{ borderTop: '1px dotted #64748b', paddingTop: 4 }}>
                  (.......................................................)
                </div>
                <div style={{ fontSize: '10px', color: '#475569', marginTop: 2 }}>
                  ผู้ตรวจสอบหน้างาน / Supervisor
                </div>
                <div style={{ fontSize: '9px', color: '#94a3b8' }}>
                  วันที่: ......./......./...........
                </div>
              </td>

              <td
                style={{
                  width: '33.33%',
                  padding: '16px 8px 8px',
                  verticalAlign: 'bottom',
                }}
              >
                <div style={{ height: '32px' }}></div>
                <div style={{ borderTop: '1px dotted #64748b', paddingTop: 4 }}>
                  (.......................................................)
                </div>
                <div style={{ fontSize: '10px', color: '#475569', marginTop: 2 }}>
                  ผู้อนุมัติ / ฝ่ายปฏิบัติการ
                </div>
                <div style={{ fontSize: '9px', color: '#94a3b8' }}>
                  วันที่: ......./......./...........
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 6. Page Footer Notice */}
      <div
        className="sop-footer-box"
        style={{
          marginTop: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '9px',
          color: '#94a3b8',
          borderTop: '1px solid #e2e8f0',
          paddingTop: 4,
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
        }}
      >
        <span>
          Asiathai Freight SOP Management System • เอกสารขั้นตอนการปฏิบัติงานมาตรฐาน ({procedure.category ? procedure.category.name : 'SOP'})
        </span>
        <span>เอกสาร SOP ฉบับควบคุม (Internal Controlled Copy)</span>
      </div>
    </div>
  );
};
