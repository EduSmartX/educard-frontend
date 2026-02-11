/**
 * Utility to get sidebar configuration based on user role
 */

import { adminSidebarConfig } from '@/features/dashboard/admin/sidebar-config';
import { staffSidebarConfig } from '@/features/dashboard/staff/sidebar-config';
// import { parentSidebarConfig } from '@/features/dashboard/parent/sidebar-config';

export function getSidebarConfig() {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return adminSidebarConfig; // Default fallback
  }

  try {
    const user = JSON.parse(userStr);
    const role = user.role?.toLowerCase();

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
  } catch {
    return adminSidebarConfig;
  }
}
