'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark';

export type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize with a safe default that works for SSR
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Set initial theme
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        setTheme(initialTheme);
        
        // Set mounted flag
        setMounted(true);
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
          if (!savedTheme) { // Only change if user hasn't set a preference
            const newTheme = mediaQuery.matches ? 'dark' : 'light';
            setTheme(newTheme);
          }
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } catch (error) {
        // Fallback if localStorage or matchMedia fails
        setTheme('light');
        setMounted(true);
      }
    }
  }, []);

  // Apply theme class to document element
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    try {
      const root = window.document.documentElement;
      
      // Remove all theme classes first
      root.classList.remove('light', 'dark');
      if (document.body) {
        document.body.classList.remove('light', 'dark');
      }
      
      // Apply new theme
      if (theme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        if (document.body) {
          document.body.classList.add('dark');
        }
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        if (document.body) {
          document.body.classList.remove('dark');
        }
        localStorage.setItem('theme', 'light');
      }
    } catch (error) {
      // Silently fail if DOM manipulation fails
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Don't render children until we've determined the theme to prevent hydration mismatch
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
