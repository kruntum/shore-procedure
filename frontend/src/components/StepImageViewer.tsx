import React from 'react';
import { Image, Space, Typography } from 'antd';
import { StepImage } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface StepImageViewerProps {
  images?: StepImage[];
}

export const StepImageViewer: React.FC<StepImageViewerProps> = ({ images }) => {
  const { isDarkMode } = useTheme();

  if (!images || images.length === 0) return null;

  return (
    <Image.PreviewGroup>
      <Space wrap size={6}>
        {images.map((img) => (
          <div
            key={img.id}
            style={{
              display: 'inline-block',
              background: isDarkMode ? '#1f242c' : '#fff',
              padding: 3,
              borderRadius: 4,
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
              boxShadow: isDarkMode ? '0 2px 6px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.03)',
              textAlign: 'center',
            }}
          >
            <Image
              width={105}
              height={72}
              style={{ objectFit: 'cover', borderRadius: 3, display: 'block' }}
              src={`/api/files/steps/${img.id}`}
              alt={img.caption || img.originalFilename}
              fallback="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='105' height='72' fill='%23f1f5f9'><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='10' fill='%2394a3b8'>No Image</text></svg>"
            />
            {img.caption && (
              <Typography.Text
                type="secondary"
                style={{
                  display: 'block',
                  fontSize: 10,
                  maxWidth: 105,
                  marginTop: 2,
                  lineHeight: 1.2,
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
  );
};
