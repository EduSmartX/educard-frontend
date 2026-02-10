import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  ClipboardCheck,
  FileText,
  MessageSquare,
  DollarSign,
  Settings,
} from 'lucide-react';
import type { SidebarSection } from '@/components/layout/dashboard-sidebar';

export const parentSidebarConfig: SidebarSection[] = [
  {
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/dashboard/parent',
      },
      {
        id: 'calendar',
        label: 'Calendar',
        icon: Calendar,
        path: '/dashboard/parent/calendar',
      },
    ],
  },
  {
    title: 'MY CHILDREN',
    items: [
      {
        id: 'children',
        label: 'Children',
        icon: GraduationCap,
        path: '/dashboard/parent/children',
      },
      {
        id: 'attendance',
        label: 'Attendance',
        icon: ClipboardCheck,
        path: '/dashboard/parent/attendance',
      },
      {
        id: 'performance',
        label: 'Performance',
        icon: FileText,
        path: '/dashboard/parent/performance',
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
        path: '/dashboard/parent/messages',
        badge: 2,
      },
    ],
  },
  {
    title: 'FEES & PAYMENTS',
    items: [
      {
        id: 'fees',
        label: 'Fee Payments',
        icon: DollarSign,
        path: '/dashboard/parent/fees',
      },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      {
        id: 'profile',
        label: 'My Profile',
        icon: Settings,
        path: '/dashboard/parent/profile',
      },
    ],
  },
];
