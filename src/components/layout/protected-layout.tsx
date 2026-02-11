import { Outlet } from 'react-router-dom';
import { DashboardHeader } from './dashboard-header';
import { DashboardLayout } from './dashboard-layout';
import { useAuth } from '../../hooks/use-auth';
import { getSidebarConfig } from '@/lib/utils/sidebar-utils';

/**
 * Protected Layout - Renders once for all authenticated pages
 * Provides consistent header and sidebar across all dashboard pages without re-rendering
 */
export function ProtectedLayout() {
  const { user, organization } = useAuth();

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
