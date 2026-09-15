import React from 'react';
import { Route, Routes, useLocation, useNavigate } from '@/router';
import { useApp } from '@/state/AppContext';
import { AppShell } from '@/layout/AppShell';
import { pageTitle } from '@/layout/nav';
import { EmptyState } from '@/design-system';
import { FileQuestion } from 'lucide-react';
import {
  ActionsPage, AssistantPanel, ConnectorsAdmin, Customer360,
  DrivePage, ExecutiveDashboard, GoalDetail, HealthPortfolio,
  ManagerDashboard, MyWork, PortalPreview, ProfileSettings,
} from '@/legacy/app';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { AdminPage } from '@/features/admin/AdminPage';
import { InboxPage } from '@/features/inbox/InboxPage';
import { CustomersPage } from '@/features/customers/CustomersPage';
import { RisksPage } from '@/features/pipeline/RisksPage';
import { ExpansionPage } from '@/features/pipeline/ExpansionPage';
import { RenewalsPage } from '@/features/pipeline/RenewalsPage';

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
 * Screens not yet rebuilt still paint their own headers and rely on Tailwind
 * v3 border defaults, so each is wrapped in .cx-legacy with the page padding
 * the old shell used to provide. Rebuilt screens render bare and own their
 * full height — which is what the three-pane inbox needs.
 */
function Legacy({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="cx-legacy p-6">{children}</div>
    </div>
  );
}

function ShellRoutes() {
  const { pathname } = useLocation();
  return (
    <AppShell assistant={<AssistantPanel />}>
      <div className="flex min-h-0 flex-1 flex-col" data-page={pageTitle(pathname)}>
          <Routes>
            <Route path="/" element={<RedirectToDashboard />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/work" element={<Legacy><MyWork /></Legacy>} />
            {/* Registered here for the first time: the MVP defined TicketsPage
                and linked to /tickets from the queue, but never declared the
                route, so every ticket row landed on the 404. */}
            <Route path="/tickets" element={<InboxPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:customerId" element={<Legacy><Customer360 /></Legacy>} />
            <Route path="/health" element={<Legacy><HealthPortfolio /></Legacy>} />
            <Route path="/renewals" element={<RenewalsPage />} />
            <Route path="/risks" element={<RisksPage />} />
            <Route path="/expansion" element={<ExpansionPage />} />
            <Route path="/profile" element={<Legacy><ProfileSettings /></Legacy>} />
            <Route path="/actions" element={<Legacy><ActionsPage /></Legacy>} />
            <Route path="/drive" element={<Legacy><DrivePage /></Legacy>} />
            <Route path="/qbrs" element={<Legacy><DrivePage /></Legacy>} />
            <Route path="/goals/:goalId" element={<Legacy><GoalDetail /></Legacy>} />
            <Route path="/manager" element={<Legacy><ManagerDashboard /></Legacy>} />
            <Route path="/executive" element={<Legacy><ExecutiveDashboard /></Legacy>} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/connectors" element={<Legacy><ConnectorsAdmin /></Legacy>} />
            <Route path="*" element={<Legacy><NotFound /></Legacy>} />
          </Routes>
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
