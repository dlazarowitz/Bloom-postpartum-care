/**
 * Bloom Design System
 *
 * A soft, warm color palette that feels nurturing and calming —
 * appropriate for an app supporting new parents during a vulnerable time.
 *
 * Supports both light and dark mode via lightColors / darkColors exports.
 */

export const lightColors = {
  // Primary palette — soft pinks and rose tones
  primary: '#D4869C',
  primaryLight: '#F0C4D0',
  primaryDark: '#A85D73',
  primaryBg: '#FDF2F5',

  // Secondary palette — calming sage/green
  secondary: '#7BA88E',
  secondaryLight: '#B5D4C1',
  secondaryDark: '#5A8069',
  secondaryBg: '#F0F7F2',

  // Accent — warm gold
  accent: '#D4A76A',
  accentLight: '#F0DFC4',
  accentDark: '#B08844',

  // Neutrals
  background: '#FEFBF9',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F5F2',
  border: '#E8E2DC',
  borderLight: '#F0ECE8',

  // Text
  text: '#2D2926',
  textSecondary: '#6B6560',
  textMuted: '#9E9893',
  textOnPrimary: '#FFFFFF',

  // Semantic
  success: '#6AAF7D',
  warning: '#E8B84B',
  error: '#D46B6B',
  info: '#6B9FD4',

  // Category colors
  feeding: '#D4869C',
  diapering: '#7BA88E',
  sleeping: '#8B7EC8',
  bathing: '#6B9FD4',
  clothing: '#D4A76A',
  health: '#D46B6B',
  travel: '#4AAFB8',
  nursery: '#8B7EC8',
  postpartum_mom: '#D4869C',

  // Mood colors (1-5 scale)
  mood1: '#D46B6B', // Struggling
  mood2: '#D4A76A', // Tough
  mood3: '#E8B84B', // Okay
  mood4: '#7BA88E', // Good
  mood5: '#6AAF7D', // Great
};

export const darkColors: typeof lightColors = {
  // Primary palette — slightly brighter for dark backgrounds
  primary: '#E093A9',
  primaryLight: '#C77D95',
  primaryDark: '#F0A8BD',
  primaryBg: '#2E1F27',

  // Secondary palette — brighter sage/green
  secondary: '#8DBFA0',
  secondaryLight: '#6A9B7E',
  secondaryDark: '#A8D4B8',
  secondaryBg: '#1F2E24',

  // Accent — brighter warm gold
  accent: '#E0B87A',
  accentLight: '#9E8258',
  accentDark: '#F0CC94',

  // Neutrals — deep navy tones
  background: '#1A1A2E',
  surface: '#242440',
  surfaceSecondary: '#2D2D4A',
  border: '#3D3D5C',
  borderLight: '#333356',

  // Text — warm off-whites
  text: '#F0EDE8',
  textSecondary: '#A8A4B8',
  textMuted: '#7B7890',
  textOnPrimary: '#FFFFFF',

  // Semantic — slightly brighter for visibility on dark
  success: '#7CC492',
  warning: '#F0C85C',
  error: '#E07E7E',
  info: '#7EB0E0',

  // Category colors — same as light mode
  feeding: '#D4869C',
  diapering: '#7BA88E',
  sleeping: '#8B7EC8',
  bathing: '#6B9FD4',
  clothing: '#D4A76A',
  health: '#D46B6B',
  travel: '#4AAFB8',
  nursery: '#8B7EC8',
  postpartum_mom: '#D4869C',

  // Mood colors (1-5 scale) — same as light mode
  mood1: '#D46B6B', // Struggling
  mood2: '#D4A76A', // Tough
  mood3: '#E8B84B', // Okay
  mood4: '#7BA88E', // Good
  mood5: '#6AAF7D', // Great
};

/** @deprecated Use `lightColors` or import from `useTheme()` instead. Kept for backwards compatibility. */
export const colors = lightColors;

export type ThemeColors = typeof lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  title: 28,
  hero: 34,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
};
