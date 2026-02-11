/**
 * Organization Holiday Calendar Page
 * Main page for managing organization-wide holidays
 */

import { HolidayCalendar } from '@/features/holidays';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { getSidebarConfig } from '@/lib/utils/sidebar-utils';

export default function HolidayCalendarPage() {
  return (
    <DashboardLayout sidebarSections={getSidebarConfig()}>
      <div className="container mx-auto">
        <HolidayCalendar />
      </div>
    </DashboardLayout>
  );
}
