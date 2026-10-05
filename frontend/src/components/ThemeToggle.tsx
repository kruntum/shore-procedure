import React from 'react';
import { Button, Tooltip, Popover, Space, Typography } from 'antd';
import { BgColorsOutlined, CheckOutlined } from '@ant-design/icons';
import { useTheme, THEME_COLOR_PRESETS } from '../contexts/ThemeContext';

const { Text } = Typography;

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode, primaryColor, setPrimaryColor } = useTheme();

  const colorPickerContent = (
    <div style={{ padding: 4 }}>
      <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
        เลือกโทนสีระบบ (Theme Color)
      </Text>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {THEME_COLOR_PRESETS.map((preset) => {
          const isSelected = primaryColor.toLowerCase() === preset.color.toLowerCase();
          return (
            <div
              key={preset.key}
              onClick={() => setPrimaryColor(preset.color)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 6px',
                borderRadius: 4,
                border: isSelected ? `1.5px solid ${preset.color}` : '1px solid #e2e8f0',
                background: isSelected ? (isDarkMode ? '#262626' : '#f0f5ff') : 'transparent',
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: preset.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isSelected && <CheckOutlined style={{ color: '#fff', fontSize: 9 }} />}
              </div>
              <span style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{preset.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Space size={4}>
      <Tooltip title={isDarkMode ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด (Dark Mode)'}>
        <Button
          type="text"
          size="small"
          onClick={toggleDarkMode}
          style={{
            fontSize: 14,
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isDarkMode ? '🌙' : '☀️'}
        </Button>
      </Tooltip>

      <Popover content={colorPickerContent} trigger="click" placement="bottomRight">
        <Tooltip title="ปรับแต่งสีธีม">
          <Button
            type="text"
            size="small"
            icon={<BgColorsOutlined style={{ color: primaryColor, fontSize: 14 }} />}
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </Tooltip>
      </Popover>
    </Space>
  );
};
