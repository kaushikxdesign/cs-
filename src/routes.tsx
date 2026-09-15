import React from 'react';
import { Route, Routes, useLocation, useNavigate } from '@/router';
import { useApp } from '@/state/AppContext';
import { AppShell } from '@/layout/AppShell';
import { pageTitle } from '@/layout/nav';
import { EmptyState } from '@/design-system';
import { FileQuestion } from 'lucide-react';
import {
  ActionsPage, AdminPage, AssistantPanel, ConnectorsAdmin, Customer360, CustomersList,
  Dashboard, DrivePage, ExecutiveDashboard, Expansion, GoalDetail, HealthPortfolio,
  ManagerDashboard, MyWork, PortalPreview, ProfileSettings, Renewals, Risks, TicketsPage,
} from '@/legacy/app';

function RedirectToDashboard() {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate('/dashboard');
  }, [navigate]);
  return null;
}

function NotFound() {
  return (
    <EmptyState
      icon={<FileQuestion className="size-6" strokeWidth={1.5} />}
      title="Page not found"
      description="That route does not exist. Check the link, or use ⌘K to jump somewhere."
    />
  );
}

/**
 * Screens still come from the legacy module; the shell and the route table no
 * longer do. Each screen drops off this import list as it is rebuilt.
 */
function ShellRoutes() {
  const { pathname } = useLocation();
  return (
    <AppShell assistant={<AssistantPanel />}>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Screens not yet rebuilt still paint their own headers and
            Tailwind v3 classes, so they stay wrapped in .cx-legacy. */}
        <div className="cx-legacy p-6" data-page={pageTitle(pathname)}>
          <Routes>
            <Route path="/" element={<RedirectToDashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/work" element={<MyWork />} />
            {/* Registered here for the first time: the MVP defined TicketsPage
                and linked to /tickets from the queue, but never declared the
                route, so every ticket row landed on the 404. */}
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/customers" element={<CustomersList />} />
            <Route path="/customers/:customerId" element={<Customer360 />} />
            <Route path="/health" element={<HealthPortfolio />} />
            <Route path="/renewals" element={<Renewals />} />
            <Route path="/risks" element={<Risks />} />
            <Route path="/expansion" element={<Expansion />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/actions" element={<ActionsPage />} />
            <Route path="/drive" element={<DrivePage />} />
            <Route path="/qbrs" element={<DrivePage />} />
            <Route path="/goals/:goalId" element={<GoalDetail />} />
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/executive" element={<ExecutiveDashboard />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/connectors" element={<ConnectorsAdmin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </AppShell>
  );
}

export function AppRoutes() {
  const { pathname } = useLocation();

  // Portal preview is customer-facing: it renders without any of the shell.
  if (pathname.startsWith('/portal-preview')) {
    return (
      <div className="cx-legacy">
        <Routes>
          <Route path="/portal-preview/:customerId" element={<PortalPreview />} />
        </Routes>
      </div>
    );
  }

  return <ShellRoutes />;
}

/** Kept so the shell can read state without the legacy App wrapper. */
export function useActiveRole() {
  return useApp().state.activeRole;
}
