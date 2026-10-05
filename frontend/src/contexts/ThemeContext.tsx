import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemeColorOption {
  key: string;
  name: string;
  color: string;
}

export const THEME_COLOR_PRESETS: ThemeColorOption[] = [
  { key: 'blue', name: 'Asiathai Blue', color: '#1677ff' },
  { key: 'ocean', name: 'Ocean Navy', color: '#0284c7' },
  { key: 'emerald', name: 'Emerald Green', color: '#059669' },
  { key: 'purple', name: 'Royal Purple', color: '#7c3aed' },
  { key: 'amber', name: 'Warm Amber', color: '#d97706' },
  { key: 'volcano', name: 'Volcano Red', color: '#e11d48' },
];

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
  primaryColor: '#1677ff',
  setPrimaryColor: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('freight_dark_mode') === 'true';
  });

  const [primaryColor, setPrimaryColorState] = useState<string>(() => {
    return localStorage.getItem('freight_theme_color') || '#1677ff';
  });

  useEffect(() => {
    localStorage.setItem('freight_dark_mode', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#141414';
      document.body.style.color = '#e2e8f0';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f5f5f5';
      document.body.style.color = 'inherit';
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
    localStorage.setItem('freight_theme_color', color);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
