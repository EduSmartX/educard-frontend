/**
 * Leave Management Layout
 * Wraps all leave-related pages with DashboardLayout
 * Provides consistent sidebar and navigation
 */

import { Outlet } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { adminSidebarConfig } from '@/features/dashboard/admin/sidebar-config';
import { useAuth } from '@/hooks/use-auth';

export function LeaveLayout() {
  const { user, organization } = useAuth();

  return (
    <DashboardLayout
      sidebarSections={adminSidebarConfig}
      organizationName={organization?.name}
      organizationLogo={organization?.logo}
      userName={user?.full_name}
      userAvatar={user?.profile_image}
      userRole="Administrator"
    >
      <Outlet />
    </DashboardLayout>
  );
}
