import React, { useState } from 'react';
import { Modal, Button, Space, Select, Switch, Typography, Tag, message } from 'antd';
import {
  PrinterOutlined,
  FilePdfOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Procedure } from '../types';
import { SOPDocumentA4 } from './SOPDocumentA4';

const { Text } = Typography;

interface SOPPrintModalProps {
  open: boolean;
  onClose: () => void;
  procedure: Procedure;
}

export const SOPPrintModal: React.FC<SOPPrintModalProps> = ({
  open,
  onClose,
  procedure,
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState<number | 'all'>('all');
  const [showImages, setShowImages] = useState<boolean>(true);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  const handlePrint = () => {
    const printContainer = document.getElementById('printable-sop-document');
    if (!printContainer) {
      message.error('ไม่พบเนื้อหาเอกสารที่จะพิมพ์');
      return;
    }

    setIsPrinting(true);

    // Create a dedicated hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      setIsPrinting(false);
      document.body.removeChild(iframe);
      message.error('ไม่สามารถสร้างหน้าพิมพ์เอกสารได้');
      return;
    }

    const htmlContent = printContainer.innerHTML;

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html lang="th">
        <head>
          <meta charset="UTF-8" />
          <title>${procedure.title} - เอกสาร SOP</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm 12mm 15mm;
            }
            * {
              box-sizing: border-box;
            }
            html, body {
              margin: 0;
              padding: 0;
              background-color: #ffffff !important;
              font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .a4-page-sheet {
              width: 100% !important;
              max-width: 100% !important;
              min-height: auto !important;
              padding: 0 !important;
              margin: 0 !important;
              box-sizing: border-box !important;
              background-color: #ffffff !important;
              box-shadow: none !important;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            thead {
              display: table-header-group !important;
            }
            tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .sop-header-box,
            .sop-metadata-grid,
            .sop-description-box,
            .sop-signatures-box,
            .sop-footer-box {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .sop-variant-header {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
            .sop-variant-block {
              page-break-inside: auto;
              break-inside: auto;
              margin-bottom: 14px;
            }
            img {
              max-width: 100%;
              image-rendering: -webkit-optimize-contrast;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `);
    iframeDoc.close();

    const triggerPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Print execution error:', err);
      } finally {
        setIsPrinting(false);
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 2000);
      }
    };

    // Check if images are present and ensure they are loaded before calling print
    const images = iframeDoc.getElementsByTagName('img');
    const totalImages = images.length;

    if (totalImages === 0) {
      setTimeout(triggerPrint, 300);
    } else {
      let loadedCount = 0;
      let hasTriggered = false;

      const checkAllLoaded = () => {
        if (hasTriggered) return;
        loadedCount++;
        if (loadedCount >= totalImages) {
          hasTriggered = true;
          setTimeout(triggerPrint, 250);
        }
      };

      // Set fallback timer in case some images fail or hang
      const fallbackTimer = setTimeout(() => {
        if (!hasTriggered) {
          hasTriggered = true;
          triggerPrint();
        }
      }, 1500);

      Array.from(images).forEach((img) => {
        if (img.complete) {
          checkAllLoaded();
        } else {
          img.onload = () => {
            clearTimeout(fallbackTimer);
            checkAllLoaded();
          };
          img.onerror = () => {
            clearTimeout(fallbackTimer);
            checkAllLoaded();
          };
        }
      });
    }
  };

  const variantOptions = [
    { value: 'all', label: '📄 พิมพ์ทุกเงื่อนไข (รวมเป็นเล่มสมบูรณ์)' },
    ...(procedure.variants || []).map((v, idx) => ({
      value: v.id,
      label: `📌 เงื่อนไขที่ ${idx + 1}: ${v.conditionName}`,
    })),
  ];

  return (
    <Modal
      title={
        <Space wrap align="center">
          <FilePdfOutlined style={{ color: '#dc2626', fontSize: 18 }} />
          <span style={{ fontWeight: 600 }}>
            พิมพ์คู่มือขั้นตอนมาตรฐาน A4 (Standard Operating Procedure)
          </span>
          {procedure.category && (
            <Tag color={procedure.category.color || 'blue'} style={{ margin: 0, fontWeight: 500 }}>
              {procedure.category.icon} {procedure.category.name}
            </Tag>
          )}
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={960}
      style={{ top: 20 }}
      bodyStyle={{
        maxHeight: 'calc(85vh - 110px)',
        overflowY: 'auto',
        padding: 16,
        backgroundColor: '#525659',
      }}
      footer={[
        <Button key="close" onClick={onClose} disabled={isPrinting}>
          ปิด
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          loading={isPrinting}
          onClick={handlePrint}
          style={{ backgroundColor: '#2563eb' }}
        >
          สั่งพิมพ์ออกกระดาษ / บันทึกเป็น PDF (Print A4)
        </Button>,
      ]}
    >
      {/* Toolbar Controls */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '10px 14px',
          borderRadius: 4,
          marginBottom: 16,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        }}
      >
        <Space wrap align="center">
          <Text strong style={{ fontSize: 13 }}>
            เลือกเงื่อนไข:
          </Text>
          <Select
            value={selectedVariantId}
            onChange={(val) => setSelectedVariantId(val)}
            options={variantOptions}
            style={{ width: 280 }}
            size="middle"
          />
        </Space>

        <Space size="middle" align="center">
          <Space size="small">
            <Switch
              checked={showImages}
              onChange={setShowImages}
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
            />
            <Text style={{ fontSize: 13 }}>แสดงภาพหน้าจอประกอบ</Text>
          </Space>
        </Space>
      </div>

      {/* Paper Canvas Preview */}
      <div
        id="printable-sop-document"
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          borderRadius: 2,
          margin: '0 auto',
          width: 'fit-content',
        }}
      >
        <SOPDocumentA4
          procedure={procedure}
          selectedVariantId={selectedVariantId}
          showImages={showImages}
        />
      </div>
    </Modal>
  );
};
