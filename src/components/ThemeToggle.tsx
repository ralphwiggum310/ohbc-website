'use client';

import { useEffect, useState, useContext } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { ThemeContext, ThemeContextType } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const context = useContext<ThemeContextType | undefined>(ThemeContext);
  const { theme, toggleTheme } = context || {};
  const [mounted, setMounted] = useState(false);
  
  // Ensure component is mounted before rendering to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render the button after mounting to avoid hydration issues
  if (!mounted || !theme || !toggleTheme) {
    return (
      <button 
        aria-label="Toggle theme"
        className="p-2 rounded-full text-white hover:bg-opacity-20 hover:bg-white transition-colors"
        disabled
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="p-2 rounded-full text-white hover:bg-opacity-20 hover:bg-white transition-colors"
    >
      {theme === 'dark' ? (
        <FiSun className="w-5 h-5" />
      ) : (
        <FiMoon className="w-5 h-5" />
      )}
    </button>
  );
}
