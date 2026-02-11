import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Users,
  GraduationCap,
  BookOpen,
  School,
  FileText,
  CalendarCheck,
  Settings,
  Building2,
  Sliders,
} from 'lucide-react';
import type { SidebarSection } from '@/components/layout/dashboard-sidebar';
import { ROUTES } from '@/constants/app-config';

export const adminSidebarConfig: SidebarSection[] = [
  {
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: ROUTES.DASHBOARD,
      },
      {
        id: 'calendar',
        label: 'Calendar',
        icon: Calendar,
        path: ROUTES.CALENDAR,
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        path: ROUTES.ANALYTICS,
      },
    ],
  },
  {
    title: 'MANAGE',
    items: [
      {
        id: 'teachers',
        label: 'Teachers',
        icon: Users,
        path: ROUTES.TEACHERS,
      },
      {
        id: 'students',
        label: 'Students',
        icon: GraduationCap,
        path: ROUTES.STUDENTS,
      },
      {
        id: 'classes',
        label: 'Classes',
        icon: School,
        path: ROUTES.CLASSES,
      },
      {
        id: 'subjects',
        label: 'Subjects',
        icon: BookOpen,
        path: ROUTES.SUBJECTS,
      },
    ],
  },
  {
    title: 'LEAVE SYSTEM',
    items: [
      {
        id: 'leave-requests',
        label: 'Leave Requests',
        icon: FileText,
        path: ROUTES.LEAVE.REQUESTS,
        badge: 3,
      },
      {
        id: 'leave-allocations',
        label: 'Leave Allocations',
        icon: CalendarCheck,
        path: ROUTES.LEAVE.ALLOCATIONS,
      },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      {
        id: 'preferences',
        label: 'Organization Preferences',
        icon: Sliders,
        path: ROUTES.PREFERENCES,
      },
      {
        id: 'organization',
        label: 'Organization',
        icon: Building2,
        path: ROUTES.ORGANIZATION,
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        path: ROUTES.SETTINGS,
      },
    ],
  },
];
