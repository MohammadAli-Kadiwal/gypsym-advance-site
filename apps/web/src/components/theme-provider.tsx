'use client';

import * as React from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'gypsym_theme';

export function ThemeProvider({
  children,
  defaultTheme = 'light',
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<'dark' | 'light'>('dark');

  // Sync state on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved) {
        setThemeState(saved);
      } else {
        const brandSettings = localStorage.getItem('gypsym_branding_settings');
        if (brandSettings) {
          const parsed = JSON.parse(brandSettings);
          if (parsed.defaultTheme) {
            setThemeState(parsed.defaultTheme);
          }
        }
      }
    } catch {
      // Ignore localStorage access errors
    }
  }, []);

  // Update DOM and resolved theme
  React.useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let active: 'dark' | 'light';
      if (theme === 'system') {
        active = mediaQuery.matches ? 'dark' : 'light';
      } else {
        active = theme;
      }

      setResolvedTheme(active);
      root.classList.remove('light', 'dark');
      root.classList.add(active);
      root.style.colorScheme = active;

      try {
        localStorage.setItem(STORAGE_KEY, theme);
        document.cookie = `${STORAGE_KEY}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
      } catch {
        // Ignore storage exceptions
      }
    };

    applyTheme();

    if (theme === 'system') {
      const handler = () => applyTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    return undefined;
  }, [theme]);

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Script injected into <head> to prevent theme flash (FOUC) before hydration.
 */
export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}');
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var defaultSetting = 'dark';
    try {
      var brandRaw = localStorage.getItem('gypsym_branding_settings');
      if (brandRaw) {
        var parsed = JSON.parse(brandRaw);
        if (parsed.defaultTheme) {
          defaultSetting = parsed.defaultTheme;
        }
      }
    } catch(err) {}

    var active = 'dark';
    if (stored === 'light') {
      active = 'light';
    } else if (stored === 'dark') {
      active = 'dark';
    } else if (stored === 'system') {
      active = systemDark ? 'dark' : 'light';
    } else if (defaultSetting === 'light') {
      active = 'light';
    } else if (defaultSetting === 'system') {
      active = systemDark ? 'dark' : 'light';
    } else {
      active = 'dark'; // Gypsym Cosmic Obsidian Default
    }
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(active);
    document.documentElement.style.colorScheme = active;
  } catch (e) {}
})();
`;
