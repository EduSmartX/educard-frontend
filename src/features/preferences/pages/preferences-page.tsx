import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { OrganizationPreferencesTabbed } from '../components/organization-preferences-tabbed';
import { adminSidebarConfig } from '@/features/dashboard/admin/sidebar-config';

export default function PreferencesPage() {
  return (
    <DashboardLayout sidebarSections={adminSidebarConfig}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <OrganizationPreferencesTabbed />
      </div>
    </DashboardLayout>
  );
}
