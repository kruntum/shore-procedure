import React, { useState } from 'react';
import { Tabs } from 'antd';
import { ProcedureVariant } from '../types';
import { SummaryBanner } from './SummaryBanner';
import { StepTimeline } from './StepTimeline';

export const VariantTabs: React.FC<{ variants?: ProcedureVariant[] }> = ({ variants }) => {
  if (!variants || variants.length === 0) {
    return <StepTimeline steps={[]} />;
  }

  const [activeKey, setActiveKey] = useState<string>(variants[0]?.id.toString() || '0');

  const items = variants.map((v) => ({
    key: v.id.toString(),
    label: (
      <span style={{ fontWeight: 500, fontSize: 13 }}>
        {v.conditionName}
      </span>
    ),
    children: (
      <div>
        <SummaryBanner variant={v} />
        <StepTimeline steps={v.steps} />
      </div>
    ),
  }));

  return (
    <Tabs
      activeKey={activeKey}
      onChange={setActiveKey}
      type="card"
      items={items}
      style={{ marginTop: 8 }}
    />
  );
};
