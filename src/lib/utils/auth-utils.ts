/**
 * Authentication utility functions
 * Helper functions for working with user authentication and authorization
 */

import type { UserRole } from '@/hooks/use-role';
import { USER_ROLES_UPPER } from '@/constants/user-constants';

/**
 * Get the current user's role from localStorage
 * Returns uppercase role string for consistency
 */
export function getUserRole(): UserRole | null {
  try {
    const authDataStr = localStorage.getItem('auth');
    if (!authDataStr) {
      return null;
    }

    const authData = JSON.parse(authDataStr);
    const role = authData?.user?.role;
    
    if (!role) {
      return null;
    }

    // Normalize to uppercase for consistency
    return role.toUpperCase() as UserRole;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Check if the current user is an admin
 */
export function isAdminUser(): boolean {
  const role = getUserRole();
  return role === USER_ROLES_UPPER.ADMIN;
}

/**
 * Check if the current user is an employee (teacher or staff)
 */
export function isEmployeeUser(): boolean {
  const role = getUserRole();
  return role === USER_ROLES_UPPER.TEACHER || role === USER_ROLES_UPPER.STAFF;
}

/**
 * Check if the current user is a parent
 */
export function isParentUser(): boolean {
  const role = getUserRole();
  return role === USER_ROLES_UPPER.PARENT;
}

/**
 * Get the appropriate API base path based on user role
 * @param adminPath - The path for admin users
 * @param employeePath - The path for employee users
 * @param parentPath - Optional path for parent users
 */
export function getRoleBasedPath(
  adminPath: string,
  employeePath: string,
  parentPath?: string
): string {
  const role = getUserRole();
  
  if (role === USER_ROLES_UPPER.ADMIN) {
    return adminPath;
  }
  
  if (role === USER_ROLES_UPPER.TEACHER || role === USER_ROLES_UPPER.STAFF) {
    return employeePath;
  }
  
  if (role === USER_ROLES_UPPER.PARENT && parentPath) {
    return parentPath;
  }
  
  // Default to employee path if role is unknown
  return employeePath;
}
