import { Outlet } from 'react-router-dom';
import { DashboardHeader } from './dashboard-header';
import { useAuth } from '../../hooks/use-auth';

/**
 * Protected Layout - Renders once for all authenticated pages
 * Provides consistent header across all dashboard pages without re-rendering
 */
export function ProtectedLayout() {
  const { user, organization } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Rendered once at top level */}
      <DashboardHeader
        organizationName={organization?.name}
        organizationLogo={organization?.logo}
        userName={user?.full_name || user?.username}
        userRole={user?.role === 'admin' ? 'Administrator' : user?.role}
        userAvatar={user?.profile_image}
        notificationCount={3}
      />

      {/* Page Content - Each page renders here */}
      <Outlet />
    </div>
  );
}
