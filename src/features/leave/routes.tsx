/**
 * Leave Allocation Routes Configuration
 * Add these routes to your App.tsx or router configuration
 */

// Import the pages
import LeaveAllocationsListPage from '@/features/leave/pages/leave-allocations-list-page';
import LeaveAllocationCreatePage from '@/features/leave/pages/leave-allocation-create-page';
import LeaveAllocationEditPage from '@/features/leave/pages/leave-allocation-edit-page';
import LeaveAllocationViewPage from '@/features/leave/pages/leave-allocation-view-page';

// Add these routes to your router configuration
// Example using React Router v6/v7:

export const leaveAllocationRoutes = [
  {
    path: '/admin/leave/allocations',
    element: <LeaveAllocationsListPage />,
  },
  {
    path: '/admin/leave/allocations/create',
    element: <LeaveAllocationCreatePage />,
  },
  {
    path: '/admin/leave/allocations/:id',
    element: <LeaveAllocationViewPage />,
  },
  {
    path: '/admin/leave/allocations/:id/edit',
    element: <LeaveAllocationEditPage />,
  },
];

// Ensure your ROUTES constant includes:
export const ROUTES = {
  ADMIN: {
    LEAVE: {
      ALLOCATIONS: '/admin/leave/allocations',
    },
  },
};
