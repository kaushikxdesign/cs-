import React from 'react';
import { HashRouter } from '@/router';
import { AppProvider } from '@/state/AppContext';
import { AppRoutes } from '@/routes';
import { DesignSystemPage } from '@/features/design-system/DesignSystemPage';
import { ThemeProvider } from '@/lib/theme';

function currentPath() {
  return window.location.hash.slice(1).split('?')[0] || '/dashboard';
}

/**
 * The design-system gallery renders outside the shell so components can be
 * reviewed without screen chrome around them.
 */
export function App() {
  const [path, setPath] = React.useState(currentPath);

  React.useEffect(() => {
    const onChange = () => setPath(currentPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  if (path === '/design-system')
    return (
      <ThemeProvider>
        <DesignSystemPage />
      </ThemeProvider>
    );

  return (
    <ThemeProvider>
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
    </ThemeProvider>
  );
}
