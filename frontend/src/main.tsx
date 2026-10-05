import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import thTH from 'antd/locale/th_TH';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});

const ThemedApp: React.FC = () => {
  const { isDarkMode, primaryColor } = useTheme();

  return (
    <ConfigProvider
      locale={thTH}
      theme={{
        algorithm: isDarkMode
          ? [theme.darkAlgorithm, theme.compactAlgorithm]
          : [theme.defaultAlgorithm, theme.compactAlgorithm],
        token: {
          colorPrimary: primaryColor,
          borderRadius: 6,
          fontSize: 13,
          fontFamily: "'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          colorBorderSecondary: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          colorBorder: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
          colorBgLayout: isDarkMode ? '#141414' : '#f0f2f5',
          colorBgContainer: isDarkMode ? '#1f1f1f' : '#ffffff',
          colorBgElevated: isDarkMode ? '#262626' : '#ffffff',
          colorText: isDarkMode ? 'rgba(255, 255, 255, 0.88)' : 'rgba(0, 0, 0, 0.88)',
          colorTextSecondary: isDarkMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)',
          colorTextTertiary: isDarkMode ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
          boxShadow: isDarkMode
            ? '0 2px 8px -2px rgba(0, 0, 0, 0.6), 0 1px 4px -1px rgba(0, 0, 0, 0.5)'
            : '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
          boxShadowSecondary: isDarkMode
            ? '0 6px 16px 0 rgba(0, 0, 0, 0.65), 0 3px 6px -4px rgba(0, 0, 0, 0.5)'
            : '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12)',
          boxShadowTertiary: isDarkMode
            ? '0 12px 32px 4px rgba(0, 0, 0, 0.75), 0 8px 20px 0 rgba(0, 0, 0, 0.6)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.03), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
        },
        components: {
          Card: {
            colorBorderSecondary: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            colorBgContainer: isDarkMode ? '#1f1f1f' : '#ffffff',
          },
          Table: {
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#f0f0f0',
            headerBg: isDarkMode ? '#191919' : '#fafafa',
            rowHoverBg: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
          },
          Input: {
            colorBorder: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : '#d9d9d9',
          },
          Select: {
            colorBorder: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : '#d9d9d9',
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
