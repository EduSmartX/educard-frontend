/**
 * Hook for checking user role
 * 
 * Provides convenient boolean flags for checking the current user's role.
 * 
 * @example
 * ```tsx
 * const { isAdmin, isEmployee, isParent, role } = useRole();
 * 
 * if (isAdmin) {
 *   return <AdminDashboard />;
 * }
 * ```
 */

import { useAuth } from './use-auth';

export type UserRole = 'ADMIN' | 'TEACHER' | 'STAFF' | 'PARENT' | 'STUDENT';

export interface UseRoleReturn {
  role: UserRole | null;
  isAdmin: boolean;
  isEmployee: boolean;
  isTeacher: boolean;
  isStaff: boolean;
  isParent: boolean;
  isStudent: boolean;
  isLoading: boolean;
}

export function useRole(): UseRoleReturn {
  const { user } = useAuth();

  const role = (user?.role as UserRole) || null;

  return {
    role,
    isAdmin: role === 'ADMIN',
    isEmployee: role === 'TEACHER' || role === 'STAFF',
    isTeacher: role === 'TEACHER',
    isStaff: role === 'STAFF',
    isParent: role === 'PARENT',
    isStudent: role === 'STUDENT',
    isLoading: false,
  };
}
