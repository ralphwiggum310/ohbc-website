'use client';

import { useState, useEffect } from 'react';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved dark mode preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
      // Apply dark mode to entire document
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    // Apply dark mode to entire document
    if (newTheme) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed top-4 right-4 z-50 bg-gray-700 bg-opacity-90 text-white p-2 rounded text-sm shadow-lg hover:bg-gray-600 transition-all duration-200"
      aria-label="Toggle dark mode"
      style={{
        fontSize: '12px',
        lineHeight: '1'
      }}
    >
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
