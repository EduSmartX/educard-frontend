/**
 * Reusable Page Header Component
 * Provides consistent header styling across all pages with title, description, and action buttons
 * Includes smart icon mapping based on page title/context
 */

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Calendar,
  CalendarDays,
  Settings,
  Users,
  GraduationCap,
  BookOpen,
  UserCircle,
  Building2,
  ClipboardList,
  FileText,
  BarChart3,
  Shield,
  Bell,
  Briefcase,
  Home,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Icon mapper based on page title keywords
const PAGE_ICON_MAP: Record<string, LucideIcon> = {
  // Holiday & Calendar
  holiday: Calendar,
  calendar: Calendar,
  'working day': CalendarDays,
  'exceptional work': AlertTriangle,
  exception: AlertTriangle,

  // Leave Management
  'leave allocation': Briefcase,
  leave: Briefcase,
  absence: ClipboardList,

  // Organization & Settings
  'organization settings': Settings,
  'organization preferences': Settings,
  preferences: Settings,
  settings: Settings,

  // Academic
  academic: BookOpen,
  'academic year': BookOpen,
  semester: BookOpen,
  curriculum: BookOpen,

  // Users & Roles
  student: GraduationCap,
  students: GraduationCap,
  teacher: UserCircle,
  teachers: UserCircle,
  staff: Users,
  user: Users,
  users: Users,

  // Organization Structure
  class: Building2,
  classes: Building2,
  section: Building2,
  department: Building2,
  branch: Building2,

  // Reports & Analytics
  report: BarChart3,
  reports: BarChart3,
  analytics: BarChart3,
  dashboard: Home,

  // Other
  attendance: ClipboardList,
  notification: Bell,
  security: Shield,
  document: FileText,
};

/**
 * Automatically selects an icon based on the page title
 */
function getIconForTitle(title: string): LucideIcon | undefined {
  const lowerTitle = title.toLowerCase();

  // Check for exact or partial matches in the title
  for (const [keyword, icon] of Object.entries(PAGE_ICON_MAP)) {
    if (lowerTitle.includes(keyword)) {
      return icon;
    }
  }

  return undefined;
}

interface PageHeaderAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  className?: string;
  disabled?: boolean;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon; // Manual override - if not provided, will auto-detect
  actions?: PageHeaderAction[];
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon,
  actions = [],
  children,
  className,
}: PageHeaderProps) {
  // Use provided icon or auto-detect from title
  const Icon = icon || getIconForTitle(title);

  return (
    <div className={className}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Title and Description Section */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {Icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md">
                <Icon className="h-5 w-5 text-white" />
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
          </div>
          {description && <p className="text-base text-gray-600 mt-1 max-w-2xl">{description}</p>}
        </div>

        {/* Actions and Children Section - Right Side */}
        {(actions.length > 0 || children) && (
          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            {/* Render action buttons */}
            {actions.length > 0 &&
              actions.map((action, index) => {
                const ActionIcon = action.icon;
                return (
                  <Button
                    key={index}
                    onClick={action.onClick}
                    variant={action.variant || 'default'}
                    disabled={action.disabled}
                    className={cn(
                      'shadow-md hover:shadow-lg transition-all duration-200',
                      action.variant === 'default' &&
                        'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
                      action.variant === 'outline' &&
                        'border-2 border-blue-500 text-blue-600 hover:bg-blue-50',
                      action.className
                    )}
                  >
                    {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
                    {action.label}
                  </Button>
                );
              })}

            {/* Render custom children (e.g., dialog components with their own triggers) */}
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
