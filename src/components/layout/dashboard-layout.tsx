import { ReactNode } from 'react';
import { DashboardSidebar } from './dashboard-sidebar';
import type { SidebarSection } from './dashboard-sidebar';
import { DashboardHeader } from './dashboard-header';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarSections: SidebarSection[];
  organizationName?: string;
  organizationLogo?: string;
  userName?: string;
  userAvatar?: string;
  userRole?: string;
  notificationCount?: number;
  logo?: ReactNode; // Keeping for backward compatibility
}

export function DashboardLayout({
  children,
  sidebarSections,
  organizationName,
  organizationLogo,
  userName,
  userAvatar,
  userRole,
  notificationCount,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Full width at top */}
      <DashboardHeader
        organizationName={organizationName}
        organizationLogo={organizationLogo}
        userName={userName}
        userAvatar={userAvatar}
        userRole={userRole}
        notificationCount={notificationCount}
      />

      {/* Content Area with Sidebar */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Fixed height with own scrollbar */}
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <DashboardSidebar sections={sidebarSections} />
        </aside>

        {/* Main Content - Fixed height with own scrollbar */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
