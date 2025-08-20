'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      // Default to light theme
      setThemeState('light');
    }
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (mounted) {
      // Set flag BEFORE changing theme to prevent layer removal
      document.documentElement.setAttribute('data-theme-switching', 'true');
      window.__themeTransitioning = true; // Global flag as backup
      
      // Small delay to ensure flag is set before any effects run
      requestAnimationFrame(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Notify widgets about theme change
        window.dispatchEvent(new CustomEvent('theme-changed', { 
          detail: { theme, timestamp: Date.now() }
        }));
      });
      
      // Remove flag after theme switch is complete - increased delay
      setTimeout(() => {
        document.documentElement.removeAttribute('data-theme-switching');
        window.__themeTransitioning = false;
      }, 1000); // Increased to 1 second to be safe
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Prevent hydration mismatch - keep the same structure to avoid remounting
  if (!mounted) {
    // Return children directly to avoid remounting components
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;