import React from 'react';
import { App as LegacyApp } from './legacy/app';
import { DesignSystemPage } from './features/design-system/DesignSystemPage';

function currentPath() {
  return window.location.hash.slice(1).split('?')[0] || '/dashboard';
}

/**
 * The design-system gallery renders outside the app shell so the components
 * can be reviewed without any screen chrome around them. It is intercepted
 * here rather than registered in the legacy route table, which keeps the
 * quarantined module untouched.
 */
export function App() {
  const [path, setPath] = React.useState(currentPath);

  React.useEffect(() => {
    const onChange = () => setPath(currentPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  if (path === '/design-system') return <DesignSystemPage />;
  return <LegacyApp />;
}
