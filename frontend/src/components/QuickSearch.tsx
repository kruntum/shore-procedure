import React, { useState } from 'react';
import { AutoComplete, Input } from 'antd';
import { SearchOutlined, CompassOutlined, TeamOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useGlobalSearch } from '../hooks/queries';

export const QuickSearch: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { data } = useGlobalSearch(searchTerm);

  const options = [];

  if (data?.ports && data.ports.length > 0) {
    options.push({
      label: <span style={{ fontWeight: 'bold', color: '#1677ff' }}><CompassOutlined /> ท่าเรือ (Ports)</span>,
      options: data.ports.map((p) => ({
        value: `port-${p.id}`,
        label: `${p.code} - ${p.name}`,
        url: `/ports/${p.id}`,
      })),
    });
  }

  if (data?.agents && data.agents.length > 0) {
    options.push({
      label: <span style={{ fontWeight: 'bold', color: '#52c41a' }}><TeamOutlined /> สายเรือ / เอเย่นต์ (Agents)</span>,
      options: data.agents.map((a) => ({
        value: `agent-${a.id}`,
        label: `${a.code} - ${a.name}`,
        url: `/?agentId=${a.id}`,
      })),
    });
  }

  if (data?.procedures && data.procedures.length > 0) {
    options.push({
      label: <span style={{ fontWeight: 'bold', color: '#722ed1' }}><BookOutlined /> คู่มือปฏิบัติงาน (Procedures)</span>,
      options: data.procedures.map((proc) => ({
        value: `proc-${proc.id}`,
        label: proc.title,
        url: `/procedures/${proc.id}`,
      })),
    });
  }

  const handleSelect = (_value: string, option: any) => {
    if (option?.url) {
      navigate(option.url);
      setSearchTerm('');
    }
  };

  return (
    <AutoComplete
      style={{ width: '100%', maxWidth: 450, ...style }}
      options={options}
      onSelect={handleSelect}
      onSearch={setSearchTerm}
      value={searchTerm}
    >
      <Input
        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
        placeholder="ค้นหาด่วน เช่น C1C2, WHL, จ่ายชอร์..."
        allowClear
      />
    </AutoComplete>
  );
};
