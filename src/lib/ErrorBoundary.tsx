import React from 'react';

/**
 * The last survivor of the legacy quarantine. It writes the failure into the
 * static `#cx42-error` block in index.html rather than rendering a fallback,
 * because the whole point is to surface a render crash with its component
 * stack in an environment that has no devtools open.
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const el = document.getElementById('cx42-error');
    if (el) {
      el.style.display = 'block';
      el.textContent =
        'REACT RENDER ERROR\n\n' +
        error.message +
        '\n\n' +
        (error.stack ?? '') +
        '\n\nComponent stack:\n' +
        (info?.componentStack ?? '');
    }
  }

  render() {
    return this.state.error ? null : this.props.children;
  }
}
