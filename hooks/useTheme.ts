
import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

export const useTheme = (): [Theme, () => void] => {
  const getInitialTheme = (): Theme => {
    // Force 'dark' as the initial theme to meet the "default in Dark Mode theme" requirement.
    // This means any previously user-selected 'light' theme in localStorage
    // will be overridden on a fresh app load, ensuring dark mode is always the starting default.
    return 'dark';
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const applyTheme = useCallback((newTheme: Theme) => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove(newTheme === 'dark' ? 'light' : 'dark');
      root.classList.add(newTheme);
      localStorage.setItem('theme', newTheme);
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      return newTheme;
    });
  };

  return [theme, toggleTheme];
};
