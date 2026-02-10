/**
 * Leave Allocations Page - Unified Component
 * Handles list, create, edit, and view modes in a single component
 * Reduces code duplication and improves maintainability
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Filter,
  Edit,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Calendar,
  Info,
  X,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { leaveApi, type LeaveAllocation } from '@/lib/api/leave-api';
import { ROUTES } from '@/constants/app-config';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/ui/data-table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PageLoader } from '@/components/ui/loading-spinner';
import { parseApiError } from '@/lib/utils/error-handler';
import { LeaveAllocationForm } from '../components/leave-allocation-form';
import { createActionsColumn } from '@/components/tables/common-columns';
import { ResourceFilter, type FilterField } from '@/components/filters/resource-filter';

type PageMode = 'list' | 'create' | 'edit' | 'view';

export default function LeaveAllocationsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  // Determine page mode from URL
  const mode: PageMode = id
    ? window.location.pathname.endsWith('/edit')
      ? 'edit'
      : 'view'
    : window.location.pathname.endsWith('/create')
      ? 'create'
      : 'list';

  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    allocation: LeaveAllocation | null;
  }>({
    open: false,
    allocation: null,
  });

  // Fetch leave allocations (only for list mode)
  const { data, isLoading, error } = useQuery({
    queryKey: ['leave-allocations', appliedSearchQuery, filters],
    queryFn: () => leaveApi.getAllocations({ search: appliedSearchQuery, ...filters }),
    enabled: mode === 'list',
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (publicId: string) => leaveApi.deleteAllocation(publicId),
    onSuccess: () => {
      const allocation = deleteDialog.allocation;
      toast.success('Leave allocation deleted successfully', {
        description: allocation
          ? `${allocation.leave_type_name} policy has been removed`
          : undefined,
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
      queryClient.invalidateQueries({ queryKey: ['leave-allocations'] });
      setDeleteDialog({ open: false, allocation: null });
    },
    onError: (error: unknown) => {
      const errorMessage = parseApiError(error, 'Failed to delete leave allocation');
      toast.error('Failed to delete policy', {
        description: errorMessage,
        icon: <AlertCircle className="h-4 w-4" />,
      });
      setDeleteDialog({ open: false, allocation: null });
    },
  });

  // Navigation handlers
  const handleView = (allocation: LeaveAllocation) => {
    navigate(`${ROUTES.LEAVE.ALLOCATIONS}/${allocation.public_id}`);
  };

  const handleEdit = (allocation: LeaveAllocation) => {
    navigate(`${ROUTES.LEAVE.ALLOCATIONS}/${allocation.public_id}/edit`);
  };

  const handleDelete = (allocation: LeaveAllocation) => {
    setDeleteDialog({ open: true, allocation });
  };

  const confirmDelete = () => {
    if (deleteDialog.allocation) {
      deleteMutation.mutate(deleteDialog.allocation.public_id);
    }
  };

  const handleCreateNew = () => {
    navigate(`${ROUTES.LEAVE.ALLOCATIONS}/create`);
  };

  const handleBackToList = () => {
    navigate(ROUTES.LEAVE.ALLOCATIONS);
  };

  const handleFormSuccess = () => {
    navigate(ROUTES.LEAVE.ALLOCATIONS);
  };

  // Render form modes (create, edit, view)
  if (mode !== 'list') {
    if (mode !== 'create' && !id) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div>
              <p className="text-red-600 font-medium">Invalid allocation ID</p>
              <p className="text-sm text-gray-500 mt-2">
                The leave allocation you're looking for doesn't exist or the ID is invalid.
              </p>
            </div>
            <Button onClick={handleBackToList}>Return to Policies</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header with Breadcrumb */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBackToList} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Policies
          </Button>

          {mode === 'view' && id && (
            <Button
              onClick={() => navigate(`${ROUTES.LEAVE.ALLOCATIONS}/${id}/edit`)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Policy
            </Button>
          )}
        </div>

        {/* Form */}
        <LeaveAllocationForm
          mode={mode as 'create' | 'edit' | 'view'}
          allocationId={id}
          onSuccess={handleFormSuccess}
          onCancel={handleBackToList}
        />
      </div>
    );
  }

  // List mode below
  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <p className="text-red-600 font-medium">Error loading leave allocations</p>
            <p className="text-sm text-gray-500 mt-2">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
          </div>
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['leave-allocations'] })}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const allocations = data?.data || [];
  const activeCount = allocations.filter(
    (a: LeaveAllocation) => !a.effective_to || new Date(a.effective_to) > new Date()
  ).length;
  const leaveTypesCount = new Set(allocations.map((a: LeaveAllocation) => a.leave_type_name)).size;

  // Extract unique leave types and roles from allocations for filter options
  const leaveTypes = Array.from(
    new Set(allocations.map((a: LeaveAllocation) => a.leave_type_name))
  ).map((name) => ({ value: name, label: name }));

  const allRoles = Array.from(
    new Set(
      allocations
        .filter((a: LeaveAllocation) => !a.applies_to_all_roles && a.roles)
        .flatMap((a: LeaveAllocation) => (a.roles ? a.roles.split(',').map((r) => r.trim()) : []))
    )
  ).map((role) => ({ value: role, label: role }));

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      name: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search by name, leave type, or role...',
    },
    {
      name: 'leave_type',
      label: 'Leave Type',
      type: 'select',
      placeholder: 'All leave types',
      options: leaveTypes,
      searchable: true,
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      placeholder: 'All roles',
      options: [{ value: 'all_roles', label: 'All Roles' }, ...allRoles],
      searchable: true,
    },
  ];

  // Define table columns for DataTable
  const columns: Column<LeaveAllocation>[] = [
    {
      header: 'Leave Type',
      accessor: (row) => <div className="font-medium text-gray-900">{row.leave_type_name}</div>,
      sortable: true,
      sortKey: 'leave_type_name',
    },
    {
      header: 'Total Days',
      accessor: (row) => (
        <Badge variant="secondary" className="font-mono">
          {row.total_days} days
        </Badge>
      ),
      sortable: true,
      sortKey: 'total_days',
    },
    {
      header: 'Carry Forward',
      accessor: (row) => (
        <Badge variant="outline" className="font-mono">
          {row.max_carry_forward_days} days
        </Badge>
      ),
      sortable: true,
      sortKey: 'max_carry_forward_days',
    },
    {
      header: 'Applicable Roles',
      accessor: (row) => {
        if (row.applies_to_all_roles) {
          return (
            <Badge className="gap-1 bg-blue-600">
              <Users className="h-3 w-3" />
              All Roles
            </Badge>
          );
        }

        // Split comma-separated roles and display as individual badges
        const roles = row.roles ? row.roles.split(',').map((r: string) => r.trim()) : [];

        if (roles.length === 0) {
          return <span className="text-sm text-muted-foreground">N/A</span>;
        }

        // Show first 3 roles, rest in a popover
        const visibleRoles = roles.slice(0, 3);
        const hiddenRoles = roles.slice(3);

        return (
          <div className="flex flex-wrap gap-1.5 items-center">
            {visibleRoles.map((role: string, idx: number) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200"
              >
                {role}
              </Badge>
            ))}
            {hiddenRoles.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Badge
                    variant="outline"
                    className="text-xs font-medium cursor-pointer hover:bg-gray-100 gap-1 border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    +{hiddenRoles.length} more
                    <ChevronDown className="h-3 w-3" />
                  </Badge>
                </PopoverTrigger>
                <PopoverContent className="w-auto max-w-md p-4" align="start" sideOffset={8}>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-900 border-b pb-2">
                      All Applicable Roles ({roles.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {roles.map((role: string, idx: number) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs font-medium bg-purple-100 text-purple-700 px-2.5 py-1"
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      },
    },
    {
      header: 'Effective Period',
      accessor: (row) => (
        <div className="text-sm space-y-1">
          <div>
            {row.effective_from
              ? new Date(row.effective_from).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'N/A'}
          </div>
          {row.effective_to && (
            <div className="text-muted-foreground text-xs">
              to{' '}
              {new Date(row.effective_to).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          )}
        </div>
      ),
    },
    // Reusable Actions column
    createActionsColumn<LeaveAllocation>(
      {
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete,
      },
      {
        variant: 'buttons',
        align: 'right',
      }
    ),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Allocation Policies</h1>
          <p className="text-muted-foreground mt-1">
            Manage leave policies and entitlements for your organization
          </p>
        </div>
        <Button onClick={handleCreateNew} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Create Policy
        </Button>
      </div>

      {/* Feature Highlight Banner */}
      <div className="relative overflow-hidden rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 ring-4 ring-blue-50">
              <Info className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">✨ Smart Automation Enabled</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              Leave balances are <strong className="text-blue-700">automatically created</strong>{' '}
              for all staff and students when you add a new policy. Simply define the policy, select
              applicable roles, and the system instantly provisions leave balances—
              <span className="text-green-700 font-medium"> zero manual work required!</span>
            </p>
            <div className="flex items-center gap-2 pt-1">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">Role-based auto-assignment</span>
              <span className="text-gray-300">•</span>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">Instant balance creation</span>
              <span className="text-gray-300">•</span>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">No manual intervention</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards with Enhanced Design */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
            <div className="w-full h-full bg-green-100 rounded-full opacity-20"></div>
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Policies</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              Currently effective and active
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
            <div className="w-full h-full bg-blue-100 rounded-full opacity-20"></div>
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Leave Types</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">{leaveTypesCount}</div>
            <p className="text-xs text-muted-foreground mt-2">Different categories configured</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                {allocations.length} {allocations.length === 1 ? 'policy' : 'policies'} found
              </div>
              <Button
                variant={showFilters ? 'default' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            {/* Active filters display */}
            {Object.keys(filters).length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {Object.entries(filters).map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="gap-1">
                    <span className="capitalize">
                      {key.replace(/_/g, ' ')}: {value}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newFilters = { ...filters };
                        delete newFilters[key];
                        setFilters(newFilters);
                      }}
                      className="rounded-full p-0.5 hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilters({});
                    setShowFilters(false);
                  }}
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        {/* Filter Panel */}
        {showFilters && (
          <div className="px-6 pb-6">
            <ResourceFilter
              fields={filterFields}
              onFilter={(appliedFilters) => {
                const { search, ...otherFilters } = appliedFilters;
                setAppliedSearchQuery(search || '');
                setFilters(otherFilters);
                setShowFilters(false);
              }}
              onReset={() => {
                setAppliedSearchQuery('');
                setFilters({});
              }}
              defaultValues={{ search: appliedSearchQuery, ...filters }}
            />
          </div>
        )}

        <CardContent>
          <DataTable
            columns={columns}
            data={allocations}
            isLoading={isLoading}
            emptyMessage={
              appliedSearchQuery || Object.keys(filters).length > 0
                ? 'No policies found matching your filters'
                : 'No leave allocation policies found'
            }
            emptyAction={
              !appliedSearchQuery && Object.keys(filters).length === 0
                ? {
                    label: 'Create Your First Policy',
                    onClick: handleCreateNew,
                  }
                : undefined
            }
            getRowKey={(row) => row.public_id}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open, allocation: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Leave Allocation Policy?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the{' '}
              <span className="font-semibold">{deleteDialog.allocation?.leave_type_name}</span>{' '}
              policy? This action cannot be undone and will affect all associated leave balances.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Policy'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
