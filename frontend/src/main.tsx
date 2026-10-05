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
          colorBorderSecondary: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)',
          colorBorder: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1',
          colorBgContainer: isDarkMode ? '#1a1d21' : '#ffffff',
          colorBgElevated: isDarkMode ? '#22262d' : '#ffffff',
          colorBgLayout: isDarkMode ? '#121418' : '#f5f5f5',
          boxShadowSecondary: isDarkMode
            ? '0 6px 20px rgba(0, 0, 0, 0.45)'
            : '0 2px 8px rgba(0, 0, 0, 0.05)',
          boxShadowTertiary: isDarkMode
            ? '0 4px 14px rgba(0, 0, 0, 0.4)'
            : '0 1px 3px rgba(0, 0, 0, 0.03)',
        },
        components: {
          Card: {
            colorBorderSecondary: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)',
            colorBgContainer: isDarkMode ? '#1a1d21' : '#ffffff',
          },
          Table: {
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#f0f0f0',
            headerBg: isDarkMode ? '#15171b' : '#fafafa',
            rowHoverBg: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
          },
          Input: {
            colorBorder: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#d9d9d9',
          },
          Select: {
            colorBorder: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#d9d9d9',
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
