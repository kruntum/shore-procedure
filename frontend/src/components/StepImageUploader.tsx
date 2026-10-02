import React, { useState } from 'react';
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
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { StepImage } from '../types';
import {
  useUploadStepImage,
  useDeleteStepImage,
  useUpdateImageCaption,
} from '../hooks/mutations';

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
  const [editingImageId, setEditingImageId] = useState<number | null>(null);
  const [editingCaption, setEditingCaption] = useState<string>('');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [captionInput, setCaptionInput] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const uploadMutation = useUploadStepImage();
  const deleteMutation = useDeleteStepImage();
  const updateCaptionMutation = useUpdateImageCaption();

  // If step is not yet persisted to database
  if (!stepId) {
    return (
      <div
        style={{
          padding: '8px 12px',
          background: '#fffbe6',
          border: '1px dashed #ffe58f',
          borderRadius: 4,
          marginTop: 8,
        }}
      >
        <Space size="small">
          <PictureOutlined style={{ color: '#faad14' }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
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

  const handleCustomUpload = async () => {
    if (fileList.length === 0) {
      message.warning('กรุณาเลือกไฟล์ภาพก่อนทำการอัปโหลด');
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
      setUploadModalVisible(false);
      setFileList([]);
      setCaptionInput('');
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
                    background: '#fafafa',
                    padding: 4,
                    borderRadius: 4,
                    border: '1px solid #d9d9d9',
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

      {/* Upload Modal with Drag & Drop */}
      <Modal
        title={
          <Space>
            <PictureOutlined />
            <span>อัปโหลดภาพหน้าจอประกอบขั้นตอน</span>
          </Space>
        }
        open={uploadModalVisible}
        onCancel={() => {
          if (!uploadMutation.isPending) {
            setUploadModalVisible(false);
            setFileList([]);
            setCaptionInput('');
          }
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => setUploadModalVisible(false)}
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
            return false; // Prevent automatic upload, will upload via mutation
          }}
          onChange={(info) => {
            if (info.fileList && info.fileList.length > 0) {
              setFileList(info.fileList.slice(-1));
            }
          }}
          onRemove={() => {
            setFileList([]);
          }}
          accept="image/png,image/jpeg,image/jpg,image/webp"
          style={{ padding: '16px 0' }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: 36, color: '#1677ff' }} />
          </p>
          <p className="ant-upload-text" style={{ fontSize: 13 }}>
            ลากไฟล์ภาพหน้าจอมาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
          </p>
          <p className="ant-upload-hint" style={{ fontSize: 11, color: '#888' }}>
            รองรับไฟล์ PNG, JPG, JPEG, WebP (ขนาดสูงสุดไม่เกิน 15MB)
          </p>
        </Upload.Dragger>
      </Modal>
    </div>
  );
};
