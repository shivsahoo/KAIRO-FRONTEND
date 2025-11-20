import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remove dark class from both html and body
    root.classList.remove('dark');
    body.classList.remove('dark');
    
    // Apply dark theme if needed
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      // Explicitly ensure light mode
      root.classList.remove('dark');
      body.classList.remove('dark');
      // Force update body background
      body.style.backgroundColor = '#FFFFFF';
      body.style.color = '#1F2937';
    }
  }, [theme]);

  // Initialize on mount
  useEffect(() => {
    const currentTheme = useThemeStore.getState().theme;
    const root = document.documentElement;
    const body = document.body;
    
    if (currentTheme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      body.style.backgroundColor = '#FFFFFF';
      body.style.color = '#1F2937';
    }
  }, []);

  return <>{children}</>;
}

