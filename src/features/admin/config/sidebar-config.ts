/**
 * Admin Sidebar Configuration
 * Navigation menu for administrators/principals
 */

import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Users,
  GraduationCap,
  BookOpen,
  School,
  CalendarCheck,
  ClipboardCheck,
  CalendarDays,
  Settings,
  Building2,
  Sliders,
  AlertTriangle,
  Briefcase,
  CheckSquare,
  Clock,
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
        path: ROUTES.ADMIN.DASHBOARD,
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
        id: 'classes',
        label: 'Classes',
        icon: School,
        path: ROUTES.CLASSES,
      },
      {
        id: 'students',
        label: 'Students',
        icon: GraduationCap,
        path: ROUTES.STUDENTS,
      },
      {
        id: 'subjects',
        label: 'Subjects',
        icon: BookOpen,
        path: ROUTES.SUBJECTS,
      },
      {
        id: 'timetable',
        label: 'Timetable',
        icon: Clock,
        path: ROUTES.TIMETABLE_SETUP,
      },
    ],
  },
  {
    title: 'ATTENDANCE',
    items: [
      {
        id: 'mark-attendance',
        label: 'Mark Attendance',
        icon: ClipboardCheck,
        path: '/attendance/mark',
      },
      {
        id: 'attendance-summary',
        label: 'View Summary',
        icon: BarChart3,
        path: '/attendance/summary',
      },
      {
        id: 'attendance-reports',
        label: 'Attendance Report',
        icon: CalendarDays,
        path: '/attendance/report',
      },
      {
        id: 'attendance-timesheet',
        label: 'Timesheet',
        icon: CalendarCheck,
        path: ROUTES.ATTENDANCE.TIMESHEET,
      },
      {
        id: 'attendance-timesheet-approvals',
        label: 'Timesheet Approvals',
        icon: CheckSquare,
        path: ROUTES.ATTENDANCE.TIMESHEET_APPROVALS,
      },
    ],
  },
  {
    title: 'LEAVE SYSTEM',
    items: [
      {
        id: 'leave-dashboard',
        label: 'Leave Dashboard',
        icon: Briefcase,
        path: ROUTES.LEAVE.DASHBOARD,
      },
      {
        id: 'leave-reviews',
        label: 'Leave Reviews',
        icon: ClipboardCheck,
        path: ROUTES.LEAVE.REVIEWS,
      },
      {
        id: 'leave-balances',
        label: 'Manage Leave Balances',
        icon: CalendarDays,
        path: ROUTES.LEAVE.BALANCES,
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
        id: 'preferences-group',
        label: 'Preferences',
        icon: Sliders,
        children: [
          {
            id: 'holidays',
            label: 'Holiday Calendar',
            icon: CalendarDays,
            path: ROUTES.HOLIDAYS,
          },
          {
            id: 'exceptional-work',
            label: 'Exceptional Work Policy',
            icon: AlertTriangle,
            path: ROUTES.EXCEPTIONAL_WORK,
          },
          {
            id: 'preferences',
            label: 'Organization Preferences',
            icon: Sliders,
            path: ROUTES.PREFERENCES,
          },
        ],
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
        path: ROUTES.PROFILE,
      },
    ],
  },
];
