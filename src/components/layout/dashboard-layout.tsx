import { ReactNode, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardSidebar } from './dashboard-sidebar';
import type { SidebarSection } from './dashboard-sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarSections: SidebarSection[];
}

/**
 * DashboardLayout - Provides sidebar navigation for dashboard pages
 * Note: Header is rendered once in ProtectedLayout, not here
 */
export function DashboardLayout({ children, sidebarSections }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:transform-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto mt-[64px] sm:mt-[80px] lg:mt-0
        `}
      >
        <DashboardSidebar sections={sidebarSections} onNavigate={() => setIsSidebarOpen(false)} />
      </aside>

      {/* Mobile Menu Button - Top Left Corner */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 sm:top-4 sm:left-4 z-[60] text-white bg-emerald-600 hover:bg-emerald-700 lg:hidden shadow-lg rounded-lg h-9 w-9 sm:h-10 sm:w-10"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </Button>

      {/* Main Content - Responsive padding */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
