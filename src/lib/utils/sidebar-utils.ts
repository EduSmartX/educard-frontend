/**
 * Utility to get sidebar configuration based on user role
 */

import { adminSidebarConfig } from '@/features/dashboard/admin/sidebar-config';
import { staffSidebarConfig } from '@/features/dashboard/staff/sidebar-config';
import { getStoredUserRole } from '@/lib/utils/storage';
// import { parentSidebarConfig } from '@/features/dashboard/parent/sidebar-config';

export function getSidebarConfig() {
  const role = getStoredUserRole();
  if (!role) {
    return adminSidebarConfig; // Default fallback
  }

  switch (role) {
    case 'admin':
      return adminSidebarConfig;
    case 'teacher':
    case 'staff':
      return staffSidebarConfig;
    case 'parent':
      // return parentSidebarConfig;
      return adminSidebarConfig; // Fallback until parent sidebar is created
    default:
      return adminSidebarConfig;
  }
}
