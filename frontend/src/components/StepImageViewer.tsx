import React from 'react';
import { Image, Space, Typography } from 'antd';
import { StepImage } from '../types';

interface StepImageViewerProps {
  images?: StepImage[];
}

export const StepImageViewer: React.FC<StepImageViewerProps> = ({ images }) => {
  if (!images || images.length === 0) return null;

  return (
    <div style={{ marginTop: 12 }}>
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
                border: '1px solid #e8e8e8',
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
              {img.caption && (
                <Typography.Text
                  type="secondary"
                  style={{
                    display: 'block',
                    fontSize: 11,
                    maxWidth: 120,
                    marginTop: 2,
                  }}
                  ellipsis={{ tooltip: img.caption }}
                >
                  {img.caption}
                </Typography.Text>
              )}
            </div>
          ))}
        </Space>
      </Image.PreviewGroup>
    </div>
  );
};
