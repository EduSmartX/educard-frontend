import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, type LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<LucideProps>;
  path?: string;
  badge?: string | number;
  children?: SidebarItem[];
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

interface DashboardSidebarProps {
  sections: SidebarSection[];
  footer?: React.ReactNode;
  onNavigate?: () => void;
}

function SidebarNavItem({
  item,
  siblingPaths,
  onNavigate,
}: {
  item: SidebarItem;
  siblingPaths?: string[];
  onNavigate?: () => void;
}) {
  const { pathname } = useLocation();

  // Check if any child is currently active
  const isChildActive =
    item.children?.some((child) => child.path && pathname.startsWith(child.path)) ?? false;
  const [isOpen, setIsOpen] = useState(isChildActive);

  // Item with children — collapsible group
  if (item.children && item.children.length > 0) {
    return (
      <div>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
            isChildActive ? 'text-indigo-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon
              className={cn('h-5 w-5', isChildActive ? 'text-indigo-600' : 'text-gray-400')}
            />
            <span>{item.label}</span>
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-gray-400 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </button>
        {isOpen && (
          <div className="mt-1 ml-4 space-y-1 border-l border-gray-200 pl-2">
            {item.children.map((child) => (
              <SidebarNavItem
                key={child.id}
                item={child}
                siblingPaths={item
                  .children!.filter((s) => s.path && s.id !== child.id)
                  .map((s) => s.path!)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Regular leaf item with a path
  if (!item.path) {
    return null;
  }

  // Compute active state:
  // 1. The current URL must exactly equal this item's path, OR start with
  //    this item's path followed by a "/" (so /attendance/timesheet matches
  //    /attendance/timesheet/submit but NOT /attendance/timesheet/approvals
  //    when that sibling is more specific).
  // 2. No sibling path that is LONGER than this item's path should also
  //    match the current URL — if one does, that sibling is the real active
  //    item, not this one.
  //
  // Example:
  //   item.path  = /attendance/timesheet
  //   sibling    = /attendance/timesheet/approvals
  //   pathname   = /attendance/timesheet/approvals
  //   → condition 1 is TRUE  (startsWith '/attendance/timesheet/')
  //   → condition 2 is TRUE  (sibling '/attendance/timesheet/approvals' is
  //                           longer AND matches pathname)
  //   → isItemActive = TRUE && !TRUE = FALSE  ✅ Timesheet is NOT active
  const allSiblingPaths = siblingPaths ?? [];
  const isItemActive =
    (pathname === item.path || pathname.startsWith(`${item.path}/`)) &&
    !allSiblingPaths.some((sp) => sp.length > item.path!.length && pathname.startsWith(sp));

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={() =>
        cn(
          'flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
          isItemActive
            ? 'bg-indigo-50 text-indigo-600'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        )
      }
    >
      {() => (
        <>
          <div className="flex items-center gap-3">
            <item.icon
              className={cn('h-5 w-5', isItemActive ? 'text-indigo-600' : 'text-gray-400')}
            />
            <span>{item.label}</span>
          </div>
          {item.badge && (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-semibold',
                isItemActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
              )}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export function DashboardSidebar({ sections, footer, onNavigate }: DashboardSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {section.title && (
              <h3 className="mb-2 px-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <SidebarNavItem
                  key={item.id}
                  item={item}
                  siblingPaths={
                    // Collect the paths of every OTHER item in this section.
                    // This lets the active-state guard know about siblings so
                    // it can correctly decide that /attendance/timesheet should
                    // NOT be active when the URL is /attendance/timesheet/approvals.
                    section.items.filter((s) => s.path && s.id !== item.id).map((s) => s.path!)
                  }
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {footer && <div className="border-t border-gray-200 p-4">{footer}</div>}
    </div>
  );
}
