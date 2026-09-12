'use client';

import * as React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg border border-border/50 bg-card/40 flex items-center justify-center opacity-70">
        <span className="sr-only">Toggle theme</span>
      </div>
    );
  }

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  return (
    <button
      onClick={cycleTheme}
      className="relative flex items-center justify-center w-8 h-8 rounded-lg border border-border/60 bg-card/60 hover:bg-muted/60 text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
      title={`Current theme: ${theme} (Click to change)`}
      aria-label="Toggle display theme between dark, light, and system"
    >
      {theme === 'system' ? (
        <Laptop className="h-4 w-4 text-primary transition-transform duration-200" />
      ) : resolvedTheme === 'dark' ? (
        <Moon className="h-4 w-4 text-sky-400 transition-transform duration-200 hover:rotate-12" />
      ) : (
        <Sun className="h-4 w-4 text-amber-500 transition-transform duration-200 hover:rotate-45" />
      )}
    </button>
  );
}
