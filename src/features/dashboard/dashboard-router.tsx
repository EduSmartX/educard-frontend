import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { PageLoader } from '@/components/ui/loading-spinner';
import { ROUTES } from '@/constants/app-config';

// Lazy load dashboard pages
const AdminDashboardPage = lazy(() => import('./admin/admin-dashboard-page'));
// TODO: Add these when created
// const StaffDashboardPage = lazy(() => import('./staff/staff-dashboard-page'));
// const ParentDashboardPage = lazy(() => import('./parent/parent-dashboard-page'));

/**
 * Dashboard Router - Routes users to appropriate dashboard based on their role
 * URL: /dashboard (same for all roles)
 */
export default function DashboardRouter() {
  // Get user from localStorage
  const getUserRole = (): string | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.role?.toLowerCase();
      } catch {
        return null;
      }
    }
    return null;
  };

  const role = getUserRole();

  // If no role, redirect to login
  if (!role) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  }

  // Render appropriate dashboard based on role
  return (
    <Suspense fallback={<PageLoader />}>
      {role === 'admin' && <AdminDashboardPage />}
      {role === 'teacher' && <AdminDashboardPage />} {/* TODO: Replace with StaffDashboardPage */}
      {role === 'staff' && <AdminDashboardPage />} {/* TODO: Replace with StaffDashboardPage */}
      {role === 'parent' && <AdminDashboardPage />} {/* TODO: Replace with ParentDashboardPage */}
      {/* Fallback for unknown roles */}
      {!['admin', 'teacher', 'staff', 'parent'].includes(role) && (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Unknown Role</h1>
            <p className="mt-2 text-muted-foreground">
              Your role "{role}" is not recognized. Please contact support.
            </p>
            <a href={ROUTES.AUTH.LOGIN} className="mt-4 inline-block text-primary hover:underline">
              Back to Login
            </a>
          </div>
        </div>
      )}
    </Suspense>
  );
}
