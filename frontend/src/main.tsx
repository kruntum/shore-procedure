import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import thTH from 'antd/locale/th_TH';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import App from './App';

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
          borderRadius: 4,
          fontSize: 13,
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
