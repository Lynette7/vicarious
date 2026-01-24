// Theme definitions for Around the World in Books

export type ColorMode = 'light' | 'dark';

export interface GlobeConfig {
  // Globe textures
  globeImageUrl: string;
  bumpImageUrl: string;
  backgroundImageUrl: string;
  
  // Globe colors
  atmosphereColor: string;
  atmosphereAltitude: number;
  showAtmosphere: boolean;
  
  // Country polygon colors
  countryDefaultColor: string;
  countrySelectedColor: string;
  countryBorderColor: string;
  countryHoverGlow: string;
  
  // Ring glow effect
  ringColor: string;
  
  // Background gradient for globe container
  containerBg: string;
}

export interface ColorScheme {
  // Primary colors
  primary: string;
  primaryHover: string;
  primaryLight: string;
  accent: string;
  accentHover: string;
  
  // Background
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgGradient: string;
  
  // Globe
  globeBg: string;
  globeAtmosphere: string;
  
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;
  
  // UI Elements
  cardBg: string;
  cardBorder: string;
  modalBg: string;
  inputBg: string;
  inputBorder: string;
  
  // Passport specific
  passportCover: string;
  passportAccent: string;
  passportText: string;
  stampBorder: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  preview: string;
  fonts: {
    heading: string;
    body: string;
    accent: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  effects: {
    shadow: string;
    shadowLg: string;
    glow: string;
  };
  light: {
    colors: ColorScheme;
    globe: GlobeConfig;
  };
  dark: {
    colors: ColorScheme;
    globe: GlobeConfig;
  };
}

// Helper to get the active color scheme
export interface ActiveTheme extends Omit<Theme, 'light' | 'dark'> {
  colors: ColorScheme;
  globe: GlobeConfig;
  mode: ColorMode;
}

export const themes: Record<string, Theme> = {
  // Default Modern Theme - Vibrant & Futuristic
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Vibrant futuristic design with neon accents',
    preview: '🌐',
    fonts: {
      heading: '"Space Grotesk", "Inter", system-ui, sans-serif',
      body: '"Inter", system-ui, sans-serif',
      accent: '"Orbitron", "Inter", system-ui, sans-serif',
    },
    borderRadius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
    },
    effects: {
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      shadowLg: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      glow: '0 0 30px rgba(6, 182, 212, 0.5), 0 0 60px rgba(139, 92, 246, 0.3)',
    },
    light: {
      colors: {
        primary: '#0891b2',
        primaryHover: '#0e7490',
        primaryLight: '#cffafe',
        accent: '#8b5cf6',
        accentHover: '#7c3aed',
        
        bgPrimary: '#f0fdfa',
        bgSecondary: '#ecfeff',
        bgTertiary: '#e0f2fe',
        bgGradient: 'linear-gradient(135deg, #ecfeff 0%, #f0fdfa 25%, #faf5ff 50%, #fdf4ff 75%, #ecfeff 100%)',
        
        globeBg: 'linear-gradient(to bottom, #0f172a, #020617, #000000)',
        globeAtmosphere: '#06b6d4',
        
        textPrimary: '#0f172a',
        textSecondary: '#334155',
        textMuted: '#64748b',
        textOnPrimary: '#ffffff',
        
        cardBg: 'rgba(255, 255, 255, 0.8)',
        cardBorder: 'rgba(6, 182, 212, 0.2)',
        modalBg: 'rgba(255, 255, 255, 0.95)',
        inputBg: 'rgba(255, 255, 255, 0.9)',
        inputBorder: 'rgba(6, 182, 212, 0.3)',
        
        passportCover: 'linear-gradient(135deg, #0891b2 0%, #6366f1 50%, #8b5cf6 100%)',
        passportAccent: '#fbbf24',
        passportText: '#ffffff',
        stampBorder: '#06b6d4',
      },
      globe: {
        globeImageUrl: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
        bumpImageUrl: '//unpkg.com/three-globe/example/img/earth-topology.png',
        backgroundImageUrl: '//unpkg.com/three-globe/example/img/night-sky.png',
        atmosphereColor: '#06b6d4',
        atmosphereAltitude: 0.3,
        showAtmosphere: true,
        countryDefaultColor: '#64748b',
        countrySelectedColor: '#06b6d4',
        countryBorderColor: 'rgba(6, 182, 212, 0.4)',
        countryHoverGlow: '#8b5cf6',
        ringColor: '#06b6d4',
        containerBg: 'linear-gradient(135deg, #0c4a6e 0%, #0f172a 50%, #1e1b4b 100%)',
      },
    },
    dark: {
      colors: {
        primary: '#22d3ee',
        primaryHover: '#06b6d4',
        primaryLight: '#164e63',
        accent: '#a78bfa',
        accentHover: '#8b5cf6',
        
        bgPrimary: '#020617',
        bgSecondary: '#0f172a',
        bgTertiary: '#1e293b',
        bgGradient: 'linear-gradient(135deg, #020617 0%, #0f172a 25%, #1e1b4b 50%, #0f172a 75%, #020617 100%)',
        
        globeBg: 'linear-gradient(to bottom, #000000, #020617, #000000)',
        globeAtmosphere: '#22d3ee',
        
        textPrimary: '#f0fdfa',
        textSecondary: '#a5f3fc',
        textMuted: '#67e8f9',
        textOnPrimary: '#020617',
        
        cardBg: 'rgba(15, 23, 42, 0.8)',
        cardBorder: 'rgba(34, 211, 238, 0.2)',
        modalBg: 'rgba(15, 23, 42, 0.95)',
        inputBg: 'rgba(2, 6, 23, 0.8)',
        inputBorder: 'rgba(34, 211, 238, 0.3)',
        
        passportCover: 'linear-gradient(135deg, #0891b2 0%, #6366f1 50%, #8b5cf6 100%)',
        passportAccent: '#fbbf24',
        passportText: '#f0fdfa',
        stampBorder: '#22d3ee',
      },
      globe: {
        globeImageUrl: '//unpkg.com/three-globe/example/img/earth-night.jpg',
        bumpImageUrl: '//unpkg.com/three-globe/example/img/earth-topology.png',
        backgroundImageUrl: '//unpkg.com/three-globe/example/img/night-sky.png',
        atmosphereColor: '#22d3ee',
        atmosphereAltitude: 0.3,
        showAtmosphere: true,
        countryDefaultColor: '#475569',
        countrySelectedColor: '#22d3ee',
        countryBorderColor: 'rgba(34, 211, 238, 0.3)',
        countryHoverGlow: '#a78bfa',
        ringColor: '#22d3ee',
        containerBg: 'linear-gradient(135deg, #020617 0%, #0f172a 30%, #1e1b4b 50%, #0f172a 70%, #020617 100%)',
      },
    },
  },

  // Renaissance Theme
  renaissance: {
    id: 'renaissance',
    name: 'Renaissance',
    description: 'Classical elegance inspired by the golden age of art',
    preview: '🎨',
    fonts: {
      heading: '"Playfair Display", Georgia, serif',
      body: '"Crimson Text", Georgia, serif',
      accent: '"Cinzel", "Times New Roman", serif',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
    },
    effects: {
      shadow: '0 2px 4px rgba(44, 24, 16, 0.15), 0 1px 2px rgba(44, 24, 16, 0.1)',
      shadowLg: '0 10px 25px rgba(44, 24, 16, 0.2), 0 6px 10px rgba(44, 24, 16, 0.15)',
      glow: '0 0 30px rgba(218, 165, 32, 0.4)',
    },
    light: {
      colors: {
        primary: '#8b4513',
        primaryHover: '#a0522d',
        primaryLight: '#fef3e2',
        accent: '#daa520',
        accentHover: '#b8860b',
        
        bgPrimary: '#faf6f1',
        bgSecondary: '#f5ebe0',
        bgTertiary: '#eddfcc',
        bgGradient: 'linear-gradient(135deg, #faf6f1 0%, #f5ebe0 50%, #eddfcc 100%)',
        
        globeBg: 'linear-gradient(to bottom, #2c1810, #1a0f0a, #0d0705)',
        globeAtmosphere: '#daa520',
        
        textPrimary: '#2c1810',
        textSecondary: '#5c4033',
        textMuted: '#8b7355',
        textOnPrimary: '#faf6f1',
        
        cardBg: '#fffbf5',
        cardBorder: '#d4c4b0',
        modalBg: '#fffbf5',
        inputBg: '#fffef9',
        inputBorder: '#c9b896',
        
        passportCover: 'linear-gradient(135deg, #5c1a1a 0%, #722f37 50%, #8b0000 100%)',
        passportAccent: '#daa520',
        passportText: '#faf6f1',
        stampBorder: '#8b4513',
      },
      globe: {
        globeImageUrl: '//unpkg.com/three-globe/example/img/earth-water.png',
        bumpImageUrl: '//unpkg.com/three-globe/example/img/earth-topology.png',
        backgroundImageUrl: '',
        atmosphereColor: '#daa520',
        atmosphereAltitude: 0.2,
        showAtmosphere: true,
        countryDefaultColor: '#d4a574',
        countrySelectedColor: '#daa520',
        countryBorderColor: 'rgba(139, 69, 19, 0.6)',
        countryHoverGlow: '#daa520',
        ringColor: '#daa520',
        containerBg: 'radial-gradient(ellipse at center, #e8dcc8 0%, #d4c4b0 50%, #c9b896 100%)',
      },
    },
    dark: {
      colors: {
        primary: '#cd853f',
        primaryHover: '#daa520',
        primaryLight: '#3d2914',
        accent: '#ffd700',
        accentHover: '#daa520',
        
        bgPrimary: '#1a0f0a',
        bgSecondary: '#2c1810',
        bgTertiary: '#3d2914',
        bgGradient: 'linear-gradient(135deg, #1a0f0a 0%, #2c1810 50%, #1a0f0a 100%)',
        
        globeBg: 'linear-gradient(to bottom, #0d0705, #1a0f0a, #0d0705)',
        globeAtmosphere: '#ffd700',
        
        textPrimary: '#f5ebe0',
        textSecondary: '#d4c4b0',
        textMuted: '#8b7355',
        textOnPrimary: '#1a0f0a',
        
        cardBg: '#2c1810',
        cardBorder: '#5c4033',
        modalBg: '#2c1810',
        inputBg: '#1a0f0a',
        inputBorder: '#5c4033',
        
        passportCover: 'linear-gradient(135deg, #3d0c0c 0%, #5c1a1a 50%, #722f37 100%)',
        passportAccent: '#ffd700',
        passportText: '#f5ebe0',
        stampBorder: '#cd853f',
      },
      globe: {
        globeImageUrl: '//unpkg.com/three-globe/example/img/earth-water.png',
        bumpImageUrl: '//unpkg.com/three-globe/example/img/earth-topology.png',
        backgroundImageUrl: '',
        atmosphereColor: '#ffd700',
        atmosphereAltitude: 0.2,
        showAtmosphere: true,
        countryDefaultColor: '#8b7355',
        countrySelectedColor: '#ffd700',
        countryBorderColor: 'rgba(205, 133, 63, 0.5)',
        countryHoverGlow: '#ffd700',
        ringColor: '#ffd700',
        containerBg: 'radial-gradient(ellipse at center, #3d2914 0%, #1a0f0a 50%, #0d0705 100%)',
      },
    },
  },

  // Library Theme - Scholarly & Academic
  library: {
    id: 'library',
    name: 'Library',
    description: 'Scholarly elegance of a classic reading room',
    preview: '📚',
    fonts: {
      heading: '"Libre Baskerville", Georgia, serif',
      body: '"Merriweather", Georgia, serif',
      accent: '"EB Garamond", Georgia, serif',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.625rem',
    },
    effects: {
      shadow: '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      shadowLg: '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)',
      glow: '0 0 30px rgba(184, 134, 11, 0.3)',
    },
    light: {
      colors: {
        primary: '#2d5a4a',
        primaryHover: '#1e4035',
        primaryLight: '#e8f0ed',
        accent: '#b8860b',
        accentHover: '#996f09',
        
        bgPrimary: '#faf8f5',
        bgSecondary: '#f5f0e8',
        bgTertiary: '#ebe4d6',
        bgGradient: 'linear-gradient(180deg, #faf8f5 0%, #f5f0e8 50%, #ebe4d6 100%)',
        
        globeBg: 'linear-gradient(to bottom, #1a2f28, #0f1f1a, #050a08)',
        globeAtmosphere: '#b8860b',
        
        textPrimary: '#1a2a24',
        textSecondary: '#3d5249',
        textMuted: '#6b7f75',
        textOnPrimary: '#faf8f5',
        
        cardBg: '#fffef9',
        cardBorder: '#d4cbb8',
        modalBg: '#fffef9',
        inputBg: '#fffef9',
        inputBorder: '#c9bea6',
        
        passportCover: 'linear-gradient(135deg, #2d5a4a 0%, #1e4035 50%, #800020 100%)',
        passportAccent: '#b8860b',
        passportText: '#faf8f5',
        stampBorder: '#2d5a4a',
      },
      globe: {
        globeImageUrl: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
        bumpImageUrl: '//unpkg.com/three-globe/example/img/earth-topology.png',
        backgroundImageUrl: '',
        atmosphereColor: '#b8860b',
        atmosphereAltitude: 0.2,
        showAtmosphere: true,
        countryDefaultColor: '#8fbc8f',
        countrySelectedColor: '#b8860b',
        countryBorderColor: 'rgba(45, 90, 74, 0.5)',
        countryHoverGlow: '#b8860b',
        ringColor: '#b8860b',
        containerBg: 'radial-gradient(ellipse at center, #3d5a4a 0%, #1e4035 50%, #0f1f1a 100%)',
      },
    },
    dark: {
      colors: {
        primary: '#4a8b73',
        primaryHover: '#5a9f85',
        primaryLight: '#1a3a2f',
        accent: '#d4a84b',
        accentHover: '#e0b85c',
        
        bgPrimary: '#0f1a16',
        bgSecondary: '#1a2a24',
        bgTertiary: '#253530',
        bgGradient: 'linear-gradient(180deg, #0f1a16 0%, #1a2a24 50%, #0f1a16 100%)',
        
        globeBg: 'linear-gradient(to bottom, #050a08, #0f1a16, #050a08)',
        globeAtmosphere: '#d4a84b',
        
        textPrimary: '#e8f0ed',
        textSecondary: '#b8ccc3',
        textMuted: '#7a9a8d',
        textOnPrimary: '#0f1a16',
        
        cardBg: '#1a2a24',
        cardBorder: '#3d5249',
        modalBg: '#1a2a24',
        inputBg: '#0f1a16',
        inputBorder: '#3d5249',
        
        passportCover: 'linear-gradient(135deg, #2d5a4a 0%, #1e4035 50%, #660018 100%)',
        passportAccent: '#d4a84b',
        passportText: '#e8f0ed',
        stampBorder: '#4a8b73',
      },
      globe: {
        globeImageUrl: '//unpkg.com/three-globe/example/img/earth-dark.jpg',
        bumpImageUrl: '//unpkg.com/three-globe/example/img/earth-topology.png',
        backgroundImageUrl: '//unpkg.com/three-globe/example/img/night-sky.png',
        atmosphereColor: '#d4a84b',
        atmosphereAltitude: 0.2,
        showAtmosphere: true,
        countryDefaultColor: '#5a7a6a',
        countrySelectedColor: '#d4a84b',
        countryBorderColor: 'rgba(74, 139, 115, 0.4)',
        countryHoverGlow: '#d4a84b',
        ringColor: '#d4a84b',
        containerBg: 'radial-gradient(ellipse at center, #253530 0%, #1a2a24 50%, #0f1a16 100%)',
      },
    },
  },
};

export const DEFAULT_THEME = 'modern';
export const DEFAULT_MODE: ColorMode = 'dark';

export function getTheme(themeId: string): Theme {
  return themes[themeId] || themes[DEFAULT_THEME];
}

export function getActiveTheme(themeId: string, mode: ColorMode): ActiveTheme {
  const theme = getTheme(themeId);
  const modeConfig = theme[mode];
  
  return {
    id: theme.id,
    name: theme.name,
    description: theme.description,
    preview: theme.preview,
    fonts: theme.fonts,
    borderRadius: theme.borderRadius,
    effects: theme.effects,
    colors: modeConfig.colors,
    globe: modeConfig.globe,
    mode,
  };
}

export function getAllThemes(): Theme[] {
  return Object.values(themes);
}
