import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Users,
  BookOpen,
  ClipboardCheck,
  FileText,
  Settings,
  MessageSquare,
  Briefcase,
} from 'lucide-react';
import type { SidebarSection } from '@/components/layout/dashboard-sidebar';

export const staffSidebarConfig: SidebarSection[] = [
  {
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/dashboard/staff',
      },
      {
        id: 'calendar',
        label: 'My Calendar',
        icon: Calendar,
        path: '/dashboard/staff/calendar',
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
        path: '/dashboard/staff/classes',
      },
      {
        id: 'subjects',
        label: 'Subjects',
        icon: BookOpen,
        path: '/dashboard/staff/subjects',
      },
      {
        id: 'attendance',
        label: 'Attendance',
        icon: ClipboardCheck,
        path: '/dashboard/staff/attendance',
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
        path: '/leave/dashboard',
      },
      {
        id: 'leave-reviews',
        label: 'Leave Reviews',
        icon: ClipboardCheck,
        path: '/leave/reviews',
      },
      {
        id: 'my-leaves',
        label: 'My Leaves',
        icon: FileText,
        path: '/dashboard/staff/leaves',
      },
      {
        id: 'leave-requests',
        label: 'Apply Leave',
        icon: Calendar,
        path: '/leave/requests/new',
      },
      {
        id: 'leave-balances',
        label: 'Manage Leave Balances',
        icon: CalendarDays,
        path: '/leave/balances',
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
        path: '/dashboard/staff/messages',
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
        path: '/holidays',
      },
      {
        id: 'profile',
        label: 'My Profile',
        icon: Settings,
        path: '/dashboard/staff/profile',
      },
    ],
  },
];
