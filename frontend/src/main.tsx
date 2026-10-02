import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import thTH from 'antd/locale/th_TH';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={thTH}
        theme={{
          algorithm: theme.compactAlgorithm,
          token: {
            colorPrimary: '#1677ff',
            borderRadius: 6,
            fontSize: 13,
            colorBgContainer: '#ffffff',
          },
          components: {
            Table: {
              headerBg: '#f8fafc',
              headerColor: '#1e293b',
              rowHoverBg: '#f1f5f9',
            },
            Card: {
              borderRadiusLG: 8,
            },
          },
        }}
      >
        <App />
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
