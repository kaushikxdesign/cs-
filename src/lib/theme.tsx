import React from 'react';

export type Theme = 'light' | 'dark';

const KEY = 'sia.theme';

function read(): Theme {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Private windows and blocked site data both throw here; fall through.
  }
  return 'light';
}

const ThemeCtx = React.createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: 'light',
  setTheme: () => {},
});

/**
 * The root is always stamped with an explicit data-theme. The app does not
 * follow prefers-color-scheme: a viewer on a dark OS gets the light product
 * unless they choose otherwise here.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(read);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = React.useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(KEY, t);
    } catch {
      // Preference just won't persist; the session still switches.
    }
  }, []);

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return React.useContext(ThemeCtx);
}
