'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  ActiveTheme, 
  ColorMode, 
  getActiveTheme, 
  DEFAULT_THEME, 
  DEFAULT_MODE, 
  themes 
} from '@/lib/themes';

interface ThemeContextType {
  theme: ActiveTheme;
  themeId: string;
  mode: ColorMode;
  setTheme: (themeId: string) => void;
  setMode: (mode: ColorMode) => void;
  toggleMode: () => void;
  availableThemes: { id: string; name: string; preview: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'around-the-world-theme';
const MODE_STORAGE_KEY = 'around-the-world-mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<string>(DEFAULT_THEME);
  const [mode, setModeState] = useState<ColorMode>(DEFAULT_MODE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY) as ColorMode | null;
    
    if (savedTheme && themes[savedTheme]) {
      setThemeId(savedTheme);
    }
    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      setModeState(savedMode);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
      localStorage.setItem(MODE_STORAGE_KEY, mode);
      applyThemeToDocument(getActiveTheme(themeId, mode));
    }
  }, [themeId, mode, mounted]);

  const setTheme = (newThemeId: string) => {
    if (themes[newThemeId]) {
      setThemeId(newThemeId);
    }
  };

  const setMode = (newMode: ColorMode) => {
    setModeState(newMode);
  };

  const toggleMode = () => {
    setModeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const theme = getActiveTheme(themeId, mode);
  const availableThemes = Object.values(themes).map(t => ({
    id: t.id,
    name: t.name,
    preview: t.preview,
  }));

  return (
    <ThemeContext.Provider value={{ theme, themeId, mode, setTheme, setMode, toggleMode, availableThemes }}>
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

// Apply theme CSS variables to document
function applyThemeToDocument(theme: ActiveTheme) {
  const root = document.documentElement;
  
  // Colors
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-primary-hover', theme.colors.primaryHover);
  root.style.setProperty('--color-primary-light', theme.colors.primaryLight);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-accent-hover', theme.colors.accentHover);
  
  root.style.setProperty('--bg-primary', theme.colors.bgPrimary);
  root.style.setProperty('--bg-secondary', theme.colors.bgSecondary);
  root.style.setProperty('--bg-tertiary', theme.colors.bgTertiary);
  root.style.setProperty('--bg-gradient', theme.colors.bgGradient);
  
  root.style.setProperty('--globe-bg', theme.colors.globeBg);
  root.style.setProperty('--globe-atmosphere', theme.colors.globeAtmosphere);
  
  root.style.setProperty('--text-primary', theme.colors.textPrimary);
  root.style.setProperty('--text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--text-muted', theme.colors.textMuted);
  root.style.setProperty('--text-on-primary', theme.colors.textOnPrimary);
  
  root.style.setProperty('--card-bg', theme.colors.cardBg);
  root.style.setProperty('--card-border', theme.colors.cardBorder);
  root.style.setProperty('--modal-bg', theme.colors.modalBg);
  root.style.setProperty('--input-bg', theme.colors.inputBg);
  root.style.setProperty('--input-border', theme.colors.inputBorder);
  
  root.style.setProperty('--passport-cover', theme.colors.passportCover);
  root.style.setProperty('--passport-accent', theme.colors.passportAccent);
  root.style.setProperty('--passport-text', theme.colors.passportText);
  root.style.setProperty('--stamp-border', theme.colors.stampBorder);
  
  // Fonts
  root.style.setProperty('--font-heading', theme.fonts.heading);
  root.style.setProperty('--font-body', theme.fonts.body);
  root.style.setProperty('--font-accent', theme.fonts.accent);
  
  // Border radius
  root.style.setProperty('--radius-sm', theme.borderRadius.sm);
  root.style.setProperty('--radius-md', theme.borderRadius.md);
  root.style.setProperty('--radius-lg', theme.borderRadius.lg);
  root.style.setProperty('--radius-xl', theme.borderRadius.xl);
  
  // Effects
  root.style.setProperty('--shadow', theme.effects.shadow);
  root.style.setProperty('--shadow-lg', theme.effects.shadowLg);
  root.style.setProperty('--glow', theme.effects.glow);
  
  // Set theme and mode data attributes for additional CSS targeting
  root.setAttribute('data-theme', theme.id);
  root.setAttribute('data-mode', theme.mode);
}
