'use client';

import { useTheme as useNextTheme } from 'next-themes';

export function useTheme() {
  const { theme, setTheme: setNextTheme, resolvedTheme } = useNextTheme();

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setNextTheme(newTheme);
  };

  const toggleTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return {
    theme: resolvedTheme as 'light' | 'dark',
    setTheme,
    toggleTheme,
  };
} 