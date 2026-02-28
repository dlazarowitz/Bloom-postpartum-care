import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useColorScheme } from 'react-native';
import {
  lightColors,
  darkColors,
  type ThemeColors,
} from '../utils/theme';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  /** Whether the currently resolved theme is dark */
  isDark: boolean;
  /** The user's stored preference ('light' | 'dark' | 'system') */
  mode: ThemeMode;
  /** The resolved color palette for the current theme */
  colors: ThemeColors;
  /** Toggle between light and dark (ignores system — sets an explicit preference) */
  toggleTheme: () => void;
  /** Set an explicit theme mode */
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setMode] = useState<ThemeMode>('system');

  // Resolve whether we should show dark mode
  const isDark = useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, systemColorScheme]);

  // Pick the right color palette
  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      // If currently following system, flip based on resolved value
      if (prev === 'system') {
        return isDark ? 'light' : 'dark';
      }
      return prev === 'dark' ? 'light' : 'dark';
    });
  }, [isDark]);

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ isDark, mode, colors, toggleTheme, setTheme }),
    [isDark, mode, colors, toggleTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Hook to access theme colors and dark-mode state.
 *
 * @example
 * ```tsx
 * const { colors, isDark, toggleTheme, setTheme, mode } = useTheme();
 * ```
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error('useTheme must be used within a <ThemeProvider>');
  }
  return ctx;
}
