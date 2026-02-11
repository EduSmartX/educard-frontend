import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { OrganizationPreferencesTabbed } from '../components/organization-preferences-tabbed';
import { adminSidebarConfig } from '@/features/dashboard/admin/sidebar-config';

export default function PreferencesPage() {
  return (
    <DashboardLayout sidebarSections={adminSidebarConfig}>
      <div className="container mx-auto">
        <OrganizationPreferencesTabbed />
      </div>
    </DashboardLayout>
  );
}
