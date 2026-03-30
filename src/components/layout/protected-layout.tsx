import { Navigate, Outlet } from 'react-router-dom';
import { DashboardHeader } from './dashboard-header';
import { DashboardLayout } from './dashboard-layout';
import { useAuth } from '../../hooks/use-auth';
import { useStorageListener } from '@/hooks/use-storage-listener';
import { getSidebarConfig } from '@/lib/utils/sidebar-utils';
import { formatRole } from '@/lib/utils/auth-utils';
import { ROUTES } from '@/constants';

/**
 * Protected Layout - Wraps all authenticated pages with header and sidebar.
 * Redirects unauthenticated users and listens for cross-tab logout events.
 */
export function ProtectedLayout() {
  const { user, organization } = useAuth();

  useStorageListener();

  const accessToken = localStorage.getItem('access_token');
  if (!accessToken || !user) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50">
      <DashboardHeader
        organizationName={organization?.name}
        organizationLogo={organization?.logo}
        userName={user?.full_name || user?.username}
        username={user?.username}
        userRole={formatRole(user?.role)}
        userAvatar={user?.profile_image}
        notificationCount={3}
      />

      <DashboardLayout sidebarSections={getSidebarConfig()}>
        <Outlet />
      </DashboardLayout>
    </div>
  );
}
