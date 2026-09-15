import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// ============================================================
// CUSTOM HASH ROUTER — no external dependency
//
// Ported verbatim from the MVP. Its matching rules differ from
// react-router v6 in three ways the app depends on, so it is kept
// rather than swapped: routes match only on equal segment count and
// the first declared match wins (v6 ranks by specificity), NavLink
// marks active by raw prefix with a /dashboard special case, and the
// query lives inside the hash and is exposed as a parsed object.
// ============================================================

export type Params = Record<string, string>;
export type Query = Record<string, string>;

interface RouterValue {
  path: string;
  query: Query;
  navigate: (to: string) => void;
}

const RouterCtx = createContext<RouterValue>({ path: '/dashboard', query: {}, navigate: () => {} });
const ParamsCtx = createContext<Params>({});

function matchPath(pattern: string, path: string): Params | null {
  const pp = pattern.split('/').filter(Boolean);
  const lp = path.split('/').filter(Boolean);
  if(pp.length !== lp.length) return null;
  const params: Params = {};
  for(let i = 0; i < pp.length; i++) {
    if(pp[i].startsWith(':')) params[pp[i].slice(1)] = decodeURIComponent(lp[i] || '');
    else if(pp[i] !== lp[i]) return null;
  }
  return params;
}

function parseQuery(qs: string): Query {
  const out: Query = {};
  (qs || '').replace(/^\?/, '').split('&').filter(Boolean).forEach(pair => {
    const i = pair.indexOf('=');
    if (i === -1) out[decodeURIComponent(pair)] = '';
    else out[decodeURIComponent(pair.slice(0, i))] = decodeURIComponent(pair.slice(i + 1));
  });
  return out;
}

function HashRouter({ children }: { children: React.ReactNode }) {
  const getPath  = () => { const h = window.location.hash.slice(1).split('?')[0]; return h || '/dashboard'; };
  const getQuery = () => { const h = window.location.hash.slice(1); const i = h.indexOf('?'); return i === -1 ? {} : parseQuery(h.slice(i)); };
  const [path, setPath] = useState(getPath);
  const [query, setQuery] = useState(getQuery);
  useEffect(() => {
    const handler = () => { setPath(getPath()); setQuery(getQuery()); };
    window.addEventListener('hashchange', handler);
    if(!window.location.hash || window.location.hash === '#') window.location.hash = '/dashboard';
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  const navigate = useCallback((to) => { window.location.hash = to; }, []);
  return React.createElement(RouterCtx.Provider, { value: { path, query, navigate } }, children);
}

function Routes({ children }: { children: React.ReactNode }) {
  const { path } = useContext(RouterCtx);
  const routes = ([] as React.ReactElement[]).concat(children as never).filter(Boolean);
  for(const route of routes) {
    if(!route || !route.props) continue;
    const pattern = route.props.path;
    if(pattern === '*') return React.createElement(ParamsCtx.Provider, { value: {} }, route.props.element);
    const params = matchPath(pattern, path);
    if(params !== null) return React.createElement(ParamsCtx.Provider, { value: params }, route.props.element);
  }
  return null;
}

function Route(_props: { path: string; element: React.ReactNode }) { return null; }

function Link({ to, children, className, onClick }: { to: string; children?: React.ReactNode; className?: string; onClick?: React.MouseEventHandler }) {
  return React.createElement('a', { href: '#' + to, className, onClick }, children);
}

function NavLink({ to, children, className }: { to: string; children?: React.ReactNode; className?: string | ((s: { isActive: boolean }) => string) }) {
  const { path } = useContext(RouterCtx);
  const isActive = path === to || (to !== '/dashboard' && path.startsWith(to));
  const cls = typeof className === 'function' ? className({ isActive }) : className;
  return React.createElement('a', { href: '#' + to, className: cls }, children);
}

function useNavigate() { return useContext(RouterCtx).navigate; }
function useLocation() { const { path, query } = useContext(RouterCtx); return { pathname: path, query: query || {} }; }
function useParams() { return useContext(ParamsCtx); }

// ============================================================

export {
  HashRouter,
  Link,
  NavLink,
  ParamsCtx,
  Route,
  RouterCtx,
  Routes,
  matchPath,
  parseQuery,
  useLocation,
  useNavigate,
  useParams,
};
