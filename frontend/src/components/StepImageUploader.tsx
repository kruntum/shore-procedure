import React, { useState, useEffect, useCallback } from 'react';
import {
  Upload,
  Button,
  Space,
  Typography,
  Image,
  Popconfirm,
  Input,
  message,
  Card,
  Modal,
  Tag,
  Tooltip,
} from 'antd';
import {
  InboxOutlined,
  DeleteOutlined,
  EditOutlined,
  PictureOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  SnippetsOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { StepImage } from '../types';
import {
  useUploadStepImage,
  useDeleteStepImage,
  useUpdateImageCaption,
} from '../hooks/mutations';
import { useTheme } from '../contexts/ThemeContext';

const { Text } = Typography;

interface StepImageUploaderProps {
  stepId?: number;
  images?: StepImage[];
  readOnly?: boolean;
}

export const StepImageUploader: React.FC<StepImageUploaderProps> = ({
  stepId,
  images = [],
  readOnly = false,
}) => {
  const { isDarkMode, primaryColor } = useTheme();
  const [editingImageId, setEditingImageId] = useState<number | null>(null);
  const [editingCaption, setEditingCaption] = useState<string>('');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [captionInput, setCaptionInput] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [pastePreviewUrl, setPastePreviewUrl] = useState<string | null>(null);

  const uploadMutation = useUploadStepImage();
  const deleteMutation = useDeleteStepImage();
  const updateCaptionMutation = useUpdateImageCaption();

  // If step is not yet persisted to database
  if (!stepId) {
    return (
      <div
        style={{
          padding: '8px 12px',
          background: isDarkMode ? 'rgba(217, 119, 6, 0.08)' : '#fffbe6',
          border: isDarkMode ? '1px dashed rgba(245, 158, 11, 0.35)' : '1px dashed #ffe58f',
          borderRadius: 6,
          marginTop: 8,
        }}
      >
        <Space size="small">
          <PictureOutlined style={{ color: isDarkMode ? '#f59e0b' : '#faad14' }} />
          <Text style={{ fontSize: 12, color: isDarkMode ? 'rgba(255, 255, 255, 0.75)' : undefined }} type={isDarkMode ? undefined : "secondary"}>
            กรุณาบันทึกคู่มือก่อน จึงจะสามารถอัปโหลดภาพหน้าจอประกอบขั้นตอนนี้ได้
          </Text>
        </Space>
      </div>
    );
  }

  const handleDelete = async (imageId: number) => {
    try {
      await deleteMutation.mutateAsync(imageId);
      message.success('ลบรูปภาพเรียบร้อยแล้ว');
    } catch (err: any) {
      message.error(err.response?.data?.error || 'เกิดข้อผิดพลาดในการลบรูปภาพ');
    }
  };

  const handleStartEditCaption = (img: StepImage) => {
    setEditingImageId(img.id);
    setEditingCaption(img.caption || '');
  };

  const handleSaveCaption = async (imageId: number) => {
    try {
      await updateCaptionMutation.mutateAsync({
        imageId,
        caption: editingCaption,
      });
      message.success('แก้ไขคำอธิบายภาพสำเร็จ');
      setEditingImageId(null);
    } catch (err: any) {
      message.error('เกิดข้อผิดพลาดในการบันทึกคำอธิบาย');
    }
  };

  const resetModalState = () => {
    setUploadModalVisible(false);
    setFileList([]);
    setCaptionInput('');
    if (pastePreviewUrl) {
      URL.revokeObjectURL(pastePreviewUrl);
      setPastePreviewUrl(null);
    }
  };

  const processImageFile = useCallback((file: File, sourceName = 'clipboard-screenshot.png') => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('กรุณาวางเฉพาะไฟล์รูปภาพ (JPG, PNG, WebP)!');
      return false;
    }
    const isLt15M = file.size / 1024 / 1024 < 15;
    if (!isLt15M) {
      message.error('ขนาดไฟล์ต้องไม่เกิน 15MB!');
      return false;
    }

    const namedFile = new File([file], file.name || sourceName, { type: file.type || 'image/png' });
    const uploadFile: UploadFile = {
      uid: `-paste-${Date.now()}`,
      name: namedFile.name,
      status: 'done',
      originFileObj: namedFile as any,
    };

    setFileList([uploadFile]);
    const preview = URL.createObjectURL(namedFile);
    setPastePreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return preview;
    });
    message.success(`วางรูปภาพจาก Clipboard สำเร็จ (${(namedFile.size / 1024).toFixed(0)} KB)`);
    return true;
  }, []);

  // Listen to global paste event when uploadModalVisible is open
  useEffect(() => {
    if (!uploadModalVisible) return;

    const handlePaste = (e: ClipboardEvent) => {
      // If user is currently typing in the caption text input, don't intercept unless it has image files
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      const items = e.clipboardData?.items;
      if (!items || items.length === 0) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            e.preventDefault();
            const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
            processImageFile(blob, `screenshot-${timestamp}.png`);
            return;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [uploadModalVisible, processImageFile]);

  const handleCustomUpload = async () => {
    if (fileList.length === 0) {
      message.warning('กรุณาเลือกไฟล์ภาพ หรือกด Ctrl+V เพื่อวางภาพก่อนทำการอัปโหลด');
      return;
    }

    const item = fileList[0] as any;
    const file = (item?.originFileObj || item) as File;
    if (!file || !(file instanceof Blob)) {
      message.error('ไม่พบไฟล์ที่เลือก กรุณาลองเลือกไฟล์ใหม่อีกครั้ง');
      return;
    }

    const formData = new FormData();
    formData.append('file', file, file.name || 'screenshot.png');
    if (captionInput.trim()) {
      formData.append('caption', captionInput.trim());
    }

    try {
      await uploadMutation.mutateAsync({
        stepId,
        formData,
      });
      message.success('อัปโหลดรูปภาพลง MinIO สำเร็จ');
      resetModalState();
    } catch (err: any) {
      message.error(err.response?.data?.error || 'เกิดข้อผิดพลาดในการอัปโหลดภาพ');
    }
  };

  return (
    <div style={{ marginTop: 10 }}>
      {/* Existing Images Gallery */}
      {images.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <Image.PreviewGroup>
            <Space wrap size="small">
              {images.map((img) => (
                <div
                  key={img.id}
                  style={{
                    display: 'inline-block',
                    background: isDarkMode ? '#1a1f26' : '#fafafa',
                    padding: 4,
                    borderRadius: 4,
                    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #d9d9d9',
                    boxShadow: isDarkMode ? '0 2px 6px rgba(0,0,0,0.3)' : 'none',
                    position: 'relative',
                    width: 130,
                    textAlign: 'center',
                  }}
                >
                  <Image
                    width={120}
                    height={80}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                    src={`/api/files/steps/${img.id}`}
                    alt={img.caption || img.originalFilename}
                    fallback="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='80' fill='%23ccc'><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'>Image</text></svg>"
                  />

                  {/* Caption display & inline edit */}
                  <div style={{ marginTop: 4 }}>
                    {editingImageId === img.id ? (
                      <Space.Compact style={{ width: '100%' }} size="small">
                        <Input
                          size="small"
                          value={editingCaption}
                          onChange={(e) => setEditingCaption(e.target.value)}
                          onPressEnter={() => handleSaveCaption(img.id)}
                          placeholder="คำอธิบาย..."
                        />
                        <Button
                          size="small"
                          type="primary"
                          icon={<CheckOutlined />}
                          onClick={() => handleSaveCaption(img.id)}
                          loading={updateCaptionMutation.isPending}
                        />
                        <Button
                          size="small"
                          icon={<CloseOutlined />}
                          onClick={() => setEditingImageId(null)}
                        />
                      </Space.Compact>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 2px',
                        }}
                      >
                        <Tooltip title={img.caption || 'ไม่มีคำอธิบายภาพ'}>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 11,
                              maxWidth: 85,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              textAlign: 'left',
                            }}
                          >
                            {img.caption || '(ไม่มีคำอธิบาย)'}
                          </Text>
                        </Tooltip>

                        {!readOnly && (
                          <Space size={2}>
                            <Tooltip title="แก้ไขคำอธิบายภาพ">
                              <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined style={{ fontSize: 11 }} />}
                                onClick={() => handleStartEditCaption(img)}
                                style={{ padding: '0 2px', height: 20 }}
                              />
                            </Tooltip>

                            <Popconfirm
                              title="ลบรูปภาพนี้?"
                              description="รูปจะถูกลบออกจากระบบและ MinIO อย่างถาวร"
                              onConfirm={() => handleDelete(img.id)}
                              okText="ลบ"
                              cancelText="ยกเลิก"
                              okButtonProps={{ danger: true, size: 'small' }}
                            >
                              <Tooltip title="ลบรูปภาพ">
                                <Button
                                  type="text"
                                  danger
                                  size="small"
                                  icon={<DeleteOutlined style={{ fontSize: 11 }} />}
                                  style={{ padding: '0 2px', height: 20 }}
                                />
                              </Tooltip>
                            </Popconfirm>
                          </Space>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </Space>
          </Image.PreviewGroup>
        </div>
      )}

      {/* Upload Button */}
      {!readOnly && (
        <div>
          <Button
            size="small"
            type="dashed"
            icon={<PlusOutlined />}
            style={{
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.18)' : undefined,
              color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : undefined,
            }}
            onClick={() => {
              setFileList([]);
              setCaptionInput('');
              setUploadModalVisible(true);
            }}
          >
            {images.length > 0 ? 'แนบรูปภาพเพิ่มในขั้นตอนนี้' : 'แนบภาพหน้าจอประกอบขั้นตอน (Upload Screenshot)'}
          </Button>
        </div>
      )}

      {/* Upload Modal with Drag & Drop and Clipboard Paste */}
      <Modal
        title={
          <Space>
            <PictureOutlined />
            <span>อัปโหลดภาพหน้าจอประกอบขั้นตอน</span>
            <Tag color="cyan" icon={<SnippetsOutlined />}>
              รองรับ Ctrl + V (Paste)
            </Tag>
          </Space>
        }
        open={uploadModalVisible}
        onCancel={() => {
          if (!uploadMutation.isPending) {
            resetModalState();
          }
        }}
        footer={[
          <Button
            key="cancel"
            onClick={resetModalState}
            disabled={uploadMutation.isPending}
          >
            ยกเลิก
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<InboxOutlined />}
            loading={uploadMutation.isPending}
            disabled={fileList.length === 0}
            onClick={handleCustomUpload}
          >
            {uploadMutation.isPending ? 'กำลังอัปโหลด...' : 'อัปโหลดเข้าระบบ MinIO'}
          </Button>,
        ]}
      >
        <div
          style={{
            marginBottom: 12,
            padding: '8px 12px',
            backgroundColor: isDarkMode ? 'rgba(6, 182, 212, 0.08)' : '#e6fffb',
            border: isDarkMode ? '1px solid rgba(6, 182, 212, 0.25)' : '1px solid #87e8de',
            borderRadius: 6,
            fontSize: 12,
            color: isDarkMode ? '#67e8f9' : '#006d75',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <SnippetsOutlined style={{ fontSize: 16 }} />
          <span>
            <strong>ทางลัดด่วน:</strong> สามารถกด <strong>Ctrl + V</strong> (หรือ Command + V) ในหน้านี้เพื่อวางภาพที่เพิ่งแคปหรือคัดลอกมาจาก Word / คู่มือเดิมได้ทันที
          </span>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
            คำอธิบายภาพ (Caption / จุดสังเกตในหน้าจอ):
          </Text>
          <Input
            placeholder="เช่น กดปุ่ม 'อนุมัติ' สีเขียวมุมขวาบน หรือ ใส่เลข Booking 10 หลัก"
            value={captionInput}
            onChange={(e) => setCaptionInput(e.target.value)}
            disabled={uploadMutation.isPending}
          />
        </div>

        {pastePreviewUrl && (
          <div
            style={{
              marginBottom: 12,
              padding: 8,
              textAlign: 'center',
              backgroundColor: isDarkMode ? '#141414' : '#fafafa',
              borderRadius: 6,
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #f0f0f0',
            }}
          >
            <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Tag color="success">ภาพจาก Clipboard พร้อมอัปโหลด</Tag>
              <Button
                size="small"
                type="link"
                danger
                onClick={() => {
                  setFileList([]);
                  if (pastePreviewUrl) {
                    URL.revokeObjectURL(pastePreviewUrl);
                    setPastePreviewUrl(null);
                  }
                }}
              >
                ล้างภาพนี้
              </Button>
            </div>
            <img
              src={pastePreviewUrl}
              alt="Pasted Preview"
              style={{
                maxWidth: '100%',
                maxHeight: 220,
                objectFit: 'contain',
                borderRadius: 4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            />
          </div>
        )}

        <Upload.Dragger
          name="file"
          multiple={false}
          maxCount={1}
          fileList={fileList}
          beforeUpload={(file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
              message.error('กรุณาอัปโหลดเฉพาะไฟล์รูปภาพ (JPG, PNG, WebP)!');
              return Upload.LIST_IGNORE;
            }
            const isLt15M = file.size / 1024 / 1024 < 15;
            if (!isLt15M) {
              message.error('ขนาดไฟล์ต้องไม่เกิน 15MB!');
              return Upload.LIST_IGNORE;
            }
            setFileList([file as any]);
            const preview = URL.createObjectURL(file);
            setPastePreviewUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev);
              return preview;
            });
            return false; // Prevent automatic upload, will upload via mutation
          }}
          onChange={(info) => {
            if (info.fileList && info.fileList.length > 0) {
              setFileList(info.fileList.slice(-1));
            }
          }}
          onRemove={() => {
            setFileList([]);
            if (pastePreviewUrl) {
              URL.revokeObjectURL(pastePreviewUrl);
              setPastePreviewUrl(null);
            }
          }}
          accept="image/png,image/jpeg,image/jpg,image/webp"
          style={{
            padding: '16px 0',
            backgroundColor: isDarkMode ? '#1a1d21' : '#fafafa',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : '#d9d9d9',
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: 36, color: primaryColor || '#1677ff' }} />
          </p>
          <p className="ant-upload-text" style={{ fontSize: 13, color: isDarkMode ? 'rgba(255, 255, 255, 0.88)' : undefined }}>
            ลากไฟล์ภาพหน้าจอมาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์ (หรือกด Ctrl+V)
          </p>
          <p className="ant-upload-hint" style={{ fontSize: 11, color: isDarkMode ? 'rgba(255, 255, 255, 0.45)' : '#888' }}>
            รองรับไฟล์ PNG, JPG, JPEG, WebP จาก Clipboard / Word / Snipping Tool
          </p>
        </Upload.Dragger>
      </Modal>
    </div>
  );
};
