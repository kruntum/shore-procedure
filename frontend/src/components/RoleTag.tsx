import React from 'react';
import { Tag } from 'antd';
import {
  UserOutlined,
  BankOutlined,
  CompassOutlined,
  DollarCircleOutlined,
  CarOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
} from '@ant-design/icons';

export interface RoleConfig {
  label: string;
  icon: React.ReactNode;
  emoji: string;
  color: string;
  bgHex: string;
  borderHex: string;
  textHex: string;
}

export const DEFAULT_ROLES = [
  'พนักงานหน้างาน / ชิปปิ้ง',
  'เจ้าหน้าที่ท่าเรือ',
  'เจ้าหน้าที่สายเรือ / เอเย่นต์',
  'พนักงานออฟฟิศ / การเงิน',
  'คนขับรถ / ขนส่ง',
  'เจ้าหน้าที่ศุลกากร',
];

export function getRoleMeta(roleName?: string): RoleConfig {
  const r = (roleName || '').trim();

  if (r.includes('ท่าเรือ') || r.includes('หน้าท่า')) {
    return {
      label: r,
      icon: <BankOutlined />,
      emoji: '🏢',
      color: 'volcano',
      bgHex: '#fff2e8',
      borderHex: '#ffbb96',
      textHex: '#d4380d',
    };
  }
  if (r.includes('สายเรือ') || r.includes('เอเย่นต์')) {
    return {
      label: r,
      icon: <CompassOutlined />,
      emoji: '🚢',
      color: 'cyan',
      bgHex: '#e6fffb',
      borderHex: '#87e8de',
      textHex: '#08979c',
    };
  }
  if (r.includes('การเงิน') || r.includes('ออฟฟิศ') || r.includes('บัญชี')) {
    return {
      label: r,
      icon: <DollarCircleOutlined />,
      emoji: '💼',
      color: 'purple',
      bgHex: '#f9f0ff',
      borderHex: '#d3adf7',
      textHex: '#722ed1',
    };
  }
  if (r.includes('รถ') || r.includes('ขนส่ง')) {
    return {
      label: r,
      icon: <CarOutlined />,
      emoji: '🚚',
      color: 'gold',
      bgHex: '#fffbe6',
      borderHex: '#ffe58f',
      textHex: '#d48806',
    };
  }
  if (r.includes('ศุลกากร')) {
    return {
      label: r,
      icon: <SafetyCertificateOutlined />,
      emoji: '🏛️',
      color: 'magenta',
      bgHex: '#fff0f6',
      borderHex: '#ffadd2',
      textHex: '#c41d7f',
    };
  }

  // Default / Shipping staff
  return {
    label: r || 'พนักงานหน้างาน',
    icon: <UserOutlined />,
    emoji: '👤',
    color: 'blue',
    bgHex: '#e6f4ff',
    borderHex: '#91caff',
    textHex: '#0958d9',
  };
}

interface RoleTagProps {
  role?: string;
  style?: React.CSSProperties;
  bordered?: boolean;
}

export const RoleTag: React.FC<RoleTagProps> = ({ role, style, bordered = true }) => {
  if (!role) return null;
  const meta = getRoleMeta(role);

  return (
    <Tag
      color={meta.color}
      bordered={bordered}
      icon={meta.icon}
      style={{
        margin: 0,
        fontWeight: 500,
        fontSize: '11px',
        padding: '0 6px',
        height: 20,
        lineHeight: '18px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        borderRadius: 4,
        ...style,
      }}
    >
      {role}
    </Tag>
  );
};
