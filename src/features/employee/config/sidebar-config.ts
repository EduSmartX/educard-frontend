/**
 * Employee Sidebar Configuration
 * Navigation menu for teachers and staff members
 */

import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  CalendarCheck,
  Users,
  BookOpen,
  ClipboardCheck,
  FileText,
  Settings,
  MessageSquare,
  Briefcase,
} from 'lucide-react';
import type { SidebarSection } from '@/components/layout/dashboard-sidebar';
import { ROUTES } from '@/constants/app-config';

export const employeeSidebarConfig: SidebarSection[] = [
  {
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: ROUTES.EMPLOYEE.DASHBOARD,
      },
      {
        id: 'calendar',
        label: 'My Calendar',
        icon: Calendar,
        path: ROUTES.CALENDAR,
      },
    ],
  },
  {
    title: 'TEACHING',
    items: [
      {
        id: 'my-classes',
        label: 'My Classes',
        icon: Users,
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
    title: 'ATTENDANCE',
    items: [
      {
        id: 'mark-attendance',
        label: 'Mark Attendance',
        icon: ClipboardCheck,
        path: ROUTES.EMPLOYEE.ATTENDANCE.MARK,
      },
      {
        id: 'attendance-timesheet',
        label: 'My Timesheet',
        icon: CalendarCheck,
        path: ROUTES.EMPLOYEE.ATTENDANCE.TIMESHEET,
      },
      {
        id: 'submit-timesheet',
        label: 'Submit Timesheet',
        icon: FileText,
        path: ROUTES.EMPLOYEE.ATTENDANCE.SUBMIT,
      },
    ],
  },
  {
    title: 'LEAVE SYSTEM',
    items: [
      {
        id: 'leave-dashboard',
        label: 'My Leave Dashboard',
        icon: Briefcase,
        path: ROUTES.EMPLOYEE.LEAVE.DASHBOARD,
      },
      {
        id: 'apply-leave',
        label: 'Apply Leave',
        icon: Calendar,
        path: ROUTES.EMPLOYEE.LEAVE.APPLY,
      },
      {
        id: 'leave-history',
        label: 'Leave History',
        icon: FileText,
        path: ROUTES.EMPLOYEE.LEAVE.HISTORY,
      },
      {
        id: 'leave-balance',
        label: 'Leave Balance',
        icon: CalendarDays,
        path: ROUTES.EMPLOYEE.LEAVE.BALANCE,
      },
    ],
  },
  {
    title: 'COMMUNICATION',
    items: [
      {
        id: 'messages',
        label: 'Messages',
        icon: MessageSquare,
        path: '/messages',
        badge: 5,
      },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      {
        id: 'holidays',
        label: 'Holiday Calendar',
        icon: CalendarDays,
        path: ROUTES.HOLIDAYS,
      },
      {
        id: 'profile',
        label: 'My Profile',
        icon: Settings,
        path: ROUTES.PROFILE,
      },
    ],
  },
];
