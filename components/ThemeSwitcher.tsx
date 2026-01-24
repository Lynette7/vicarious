'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { themes } from '@/lib/themes';

export default function ThemeSwitcher() {
  const { theme, themeId, mode, setTheme, toggleMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex items-center gap-2">
      {/* Dark/Light Mode Toggle */}
      <button
        onClick={toggleMode}
        className="p-2.5 rounded-lg transition-all hover:scale-105"
        style={{
          backgroundColor: theme.colors.cardBg,
          border: `1px solid ${theme.colors.cardBorder}`,
          boxShadow: theme.effects.shadow,
        }}
        aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
      >
        {mode === 'dark' ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={theme.colors.accent}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={theme.colors.primary}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Theme Switcher */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 sm:px-4 rounded-lg transition-all hover:scale-105"
        style={{
          backgroundColor: theme.colors.cardBg,
          border: `1px solid ${theme.colors.cardBorder}`,
          color: theme.colors.textPrimary,
          boxShadow: theme.effects.shadow,
        }}
        aria-label="Change theme"
      >
        <span className="text-lg sm:text-xl">{theme.preview}</span>
        <span className="text-sm font-medium hidden sm:inline">{theme.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div
            className="absolute right-0 top-full mt-2 w-64 sm:w-72 rounded-xl overflow-hidden z-50"
            style={{
              backgroundColor: theme.colors.cardBg,
              border: `1px solid ${theme.colors.cardBorder}`,
              boxShadow: theme.effects.shadowLg,
            }}
          >
            <div 
              className="px-4 py-3 border-b"
              style={{ 
                borderColor: theme.colors.cardBorder,
                backgroundColor: theme.colors.bgSecondary,
              }}
            >
              <h3 
                className="font-semibold text-sm"
                style={{ 
                  color: theme.colors.textPrimary,
                  fontFamily: theme.fonts.heading,
                }}
              >
                Choose Theme
              </h3>
            </div>
            
            <div className="p-2">
              {Object.values(themes).map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: themeId === t.id ? theme.colors.primaryLight : 'transparent',
                    border: themeId === t.id ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
                  }}
                >
                  <div 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl sm:text-2xl"
                    style={{
                      background: t[mode].colors.bgGradient,
                      border: `2px solid ${t[mode].colors.cardBorder}`,
                    }}
                  >
                    {t.preview}
                  </div>
                  <div className="flex-1 text-left">
                    <div 
                      className="font-semibold text-sm sm:text-base"
                      style={{ 
                        color: theme.colors.textPrimary,
                        fontFamily: theme.fonts.heading,
                      }}
                    >
                      {t.name}
                    </div>
                    <div 
                      className="text-xs"
                      style={{ color: theme.colors.textMuted }}
                    >
                      {t.description}
                    </div>
                  </div>
                  {themeId === t.id && (
                    <div 
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Mode Toggle Section */}
            <div 
              className="px-4 py-3 border-t"
              style={{ borderColor: theme.colors.cardBorder }}
            >
              <div className="flex items-center justify-between">
                <span 
                  className="text-sm font-medium"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Appearance
                </span>
                <div 
                  className="flex p-1 rounded-lg"
                  style={{ backgroundColor: theme.colors.bgTertiary }}
                >
                  <button
                    onClick={() => toggleMode()}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      mode === 'light' ? 'shadow-sm' : ''
                    }`}
                    style={{
                      backgroundColor: mode === 'light' ? theme.colors.cardBg : 'transparent',
                      color: mode === 'light' ? theme.colors.primary : theme.colors.textMuted,
                    }}
                  >
                    ☀️ Light
                  </button>
                  <button
                    onClick={() => toggleMode()}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      mode === 'dark' ? 'shadow-sm' : ''
                    }`}
                    style={{
                      backgroundColor: mode === 'dark' ? theme.colors.cardBg : 'transparent',
                      color: mode === 'dark' ? theme.colors.accent : theme.colors.textMuted,
                    }}
                  >
                    🌙 Dark
                  </button>
                </div>
              </div>
            </div>

            {/* Theme preview colors */}
            <div 
              className="px-4 py-3 border-t"
              style={{ borderColor: theme.colors.cardBorder }}
            >
              <div className="flex gap-2 justify-center">
                <div 
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                  style={{ backgroundColor: theme.colors.primary }}
                  title="Primary"
                />
                <div 
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                  style={{ backgroundColor: theme.colors.accent }}
                  title="Accent"
                />
                <div 
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border"
                  style={{ 
                    backgroundColor: theme.colors.bgPrimary,
                    borderColor: theme.colors.cardBorder,
                  }}
                  title="Background"
                />
                <div 
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                  style={{ backgroundColor: theme.colors.textPrimary }}
                  title="Text"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
