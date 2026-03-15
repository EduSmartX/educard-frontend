/**
 * Employee Sidebar Configuration
 * Navigation menu for teachers and staff members
 */

import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  CalendarCheck,
  BookOpen,
  ClipboardCheck,
  FileText,
  Settings,
  Briefcase,
  AlertTriangle,
  UserCog,
  School,
  GraduationCap,
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
    title: 'MANAGE',
    items: [
      {
        id: 'teachers',
        label: 'Teachers',
        icon: UserCog,
        path: ROUTES.EMPLOYEE.TEACHERS,
      },
      {
        id: 'classes',
        label: 'Classes',
        icon: School,
        path: ROUTES.EMPLOYEE.CLASSES,
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
        label: 'Leave Dashboard',
        icon: Briefcase,
        path: ROUTES.EMPLOYEE.LEAVE.DASHBOARD,
      },
      {
        id: 'leave-reviews',
        label: 'Leave Reviews',
        icon: ClipboardCheck,
        path: ROUTES.EMPLOYEE.LEAVE.REVIEWS,
      },
      {
        id: 'manage-leave-balance',
        label: 'Manage Leave Balances',
        icon: CalendarDays,
        path: ROUTES.EMPLOYEE.LEAVE.MANAGE_BALANCE,
      },
      {
        id: 'leave-allocations',
        label: 'Leave Allocations',
        icon: CalendarCheck,
        path: ROUTES.EMPLOYEE.LEAVE.ALLOCATIONS,
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
        path: ROUTES.EMPLOYEE.HOLIDAYS,
      },
      {
        id: 'exceptional-work',
        label: 'Exceptional Work Policy',
        icon: AlertTriangle,
        path: ROUTES.EMPLOYEE.EXCEPTIONAL_WORK,
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
