import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './constants/app-config';

// Lazy load pages for better performance
import { lazy, Suspense } from 'react';
import { PageLoader } from './components/ui/loading-spinner';

// Auth pages
const LoginPage = lazy(() => import('./features/auth/pages/login-page'));
const SignupPage = lazy(() => import('./features/auth/pages/signup-page'));
const RegistrationSuccessPage = lazy(
  () => import('./features/auth/pages/registration-success-page')
);
const ForgotPasswordPage = lazy(() => import('./features/auth/pages/forgot-password-page'));
const OrganizationNotApprovedPage = lazy(
  () => import('./features/auth/pages/organization-not-approved-page')
);

// Dashboard router - Routes to appropriate dashboard based on user role
const DashboardRouter = lazy(() => import('./features/dashboard/dashboard-router'));

// Student pages
const StudentsListPage = lazy(() => import('./features/students/pages/students-list-page'));

// Leave management - Unified page with layout
const LeaveLayout = lazy(() =>
  import('./features/leave/layouts/leave-layout').then((m) => ({ default: m.LeaveLayout }))
);
const LeaveAllocationsPage = lazy(() => import('./features/leave/pages/leave-allocations-page'));

function App() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path={ROUTES.AUTH.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.AUTH.SIGNUP} element={<SignupPage />} />
          <Route path={ROUTES.AUTH.REGISTRATION_SUCCESS} element={<RegistrationSuccessPage />} />
          <Route path={ROUTES.AUTH.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route
            path={ROUTES.AUTH.ORGANIZATION_NOT_APPROVED}
            element={<OrganizationNotApprovedPage />}
          />

          {/* Protected Routes - Dashboard (role-based routing) */}
          <Route path={ROUTES.DASHBOARD} element={<DashboardRouter />} />

          {/* Protected Routes - Students */}
          <Route path={ROUTES.STUDENTS} element={<StudentsListPage />} />

          {/* Protected Routes - Leave Management (with nested layout) */}
          <Route element={<LeaveLayout />}>
            <Route path={ROUTES.LEAVE.ALLOCATIONS} element={<LeaveAllocationsPage />} />
            <Route path={`${ROUTES.LEAVE.ALLOCATIONS}/create`} element={<LeaveAllocationsPage />} />
            <Route path={`${ROUTES.LEAVE.ALLOCATIONS}/:id`} element={<LeaveAllocationsPage />} />
            <Route
              path={`${ROUTES.LEAVE.ALLOCATIONS}/:id/edit`}
              element={<LeaveAllocationsPage />}
            />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

          {/* 404 - Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

// Simple 404 component
function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
        <a href={ROUTES.DASHBOARD} className="mt-4 inline-block text-primary hover:underline">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

export default App;
