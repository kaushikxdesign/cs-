import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from './legacy/app';
import { App } from './App';
// Self-hosted so the app has no runtime font dependency on a CDN.
import '@fontsource-variable/inter';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
