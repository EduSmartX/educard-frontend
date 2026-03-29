import { Navigate, Outlet } from 'react-router-dom';
import { DashboardHeader } from './dashboard-header';
import { DashboardLayout } from './dashboard-layout';
import { useAuth } from '../../hooks/use-auth';
import { useStorageListener } from '@/hooks/use-storage-listener';
import { getSidebarConfig } from '@/lib/utils/sidebar-utils';
import { ROUTES } from '@/constants';

/**
 * Protected Layout - Renders once for all authenticated pages
 * Provides consistent header and sidebar across all dashboard pages without re-rendering
 *
 * Security:
 * - Redirects unauthenticated users to login page
 * - Listens for cross-tab logout events (password change, explicit logout)
 * - Prevents back-button navigation after logout
 */
export function ProtectedLayout() {
  const { user, organization } = useAuth();

  // Listen for cross-tab logout events & prevent back-button after logout
  useStorageListener();

  // Auth Guard: If no token, redirect to login immediately
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken || !user) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50">
      {/* Header - Rendered once at top level */}
      <DashboardHeader
        organizationName={organization?.name}
        organizationLogo={organization?.logo}
        userName={user?.full_name || user?.username}
        userRole={user?.role === 'admin' ? 'Administrator' : user?.role}
        userAvatar={user?.profile_image}
        notificationCount={3}
      />

      {/* Sidebar + Content - Rendered once, sidebar based on user role */}
      <DashboardLayout sidebarSections={getSidebarConfig()}>
        {/* Page Content - Each page renders here */}
        <Outlet />
      </DashboardLayout>
    </div>
  );
}
