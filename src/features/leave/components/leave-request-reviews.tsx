/**
 * Leave Request Reviews Page
 * Modern implementation for reviewing and approving/rejecting leave requests
 */
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Users, User, Check, X, Eye } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Combobox } from '@/components/ui/combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/date-utils';
import { useApproveLeaveRequest, useRejectLeaveRequest } from '../hooks';
import { LeaveRequestReviewDialog } from './leave-request-review-dialog';

type UserRole = 'staff' | 'student';

interface LeaveRequestReview {
  public_id: string;
  user_public_id: string;
  user_name: string;
  user_role: string;
  organization_role: string;
  email: string;
  supervisor_name: string;
  supervisor_public_id: string;
  leave_balance_public_id: string;
  leave_type_code: string;
  leave_name: string;
  start_date: string;
  end_date: string;
  number_of_days: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  applied_at: string;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  review_comments: string;
  can_be_cancelled: boolean;
  created_at: string;
  updated_at: string;
}

interface LeaveType {
  id: number;
  name: string;
  code: string;
  description: string;
  display_order: number;
}

interface ManageableUser {
  public_id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  role: string;
  role_display: string;
  organization_role: string;
  gender: string;
  employee_id?: string;
}

interface ClassData {
  public_id: string;
  name: string;
  class_master: {
    id: number;
    name: string;
    code: string;
    display_order: number;
  };
  is_active: boolean;
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', className: 'bg-yellow-500 text-white hover:bg-yellow-600' },
  approved: { label: 'Approved', className: 'bg-green-500 text-white hover:bg-green-600' },
  rejected: { label: 'Rejected', className: 'bg-red-500 text-white hover:bg-red-600' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-500 text-white hover:bg-gray-600' },
};

export function LeaveRequestReviews() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole>('staff');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Separate local filters from applied filters
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    status: 'pending',
    leaveType: '',
    user: '',
    fromDate: '',
    toDate: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    request: LeaveRequestReview | null;
    action: 'approve' | 'reject' | null;
  }>({
    open: false,
    request: null,
    action: null,
  });

  useEffect(() => {
    setSelectedClass('');
    setSelectedUser('');
    setAppliedFilters({
      status: 'pending',
      leaveType: '',
      user: '',
      fromDate: '',
      toDate: '',
    });
    setCurrentPage(1);
  }, [userRole]);

  // Fetch leave types
  const { data: leaveTypesData } = useQuery({
    queryKey: ['leave-types'],
    queryFn: async () => {
      const response = await api.get('/core/leave-types/');
      return response.data;
    },
  });

  const leaveTypes = (leaveTypesData?.data || []) as LeaveType[];

  // Fetch classes for student mode
  const { data: classesData, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes-list'],
    queryFn: async () => {
      const response = await api.get('/classes/admin/?page=1&page_size=100&is_active=true');
      return response.data;
    },
    enabled: userRole === 'student',
  });

  const classes = useMemo(() => {
    if (!classesData?.data) return [];
    if (Array.isArray(classesData.data)) return classesData.data as ClassData[];
    return [];
  }, [classesData]);

  // Fetch manageable users
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['manageable-users', userRole],
    queryFn: async () => {
      const response = await api.get(`/users/profile/manageable-users/?role=${userRole}`);
      return response.data;
    },
    enabled: userRole === 'staff',
  });

  const users = useMemo(() => {
    if (!usersData?.data?.users) return [];
    return usersData.data.users as ManageableUser[];
  }, [usersData]);

  // Build query params - use appliedFilters instead of local state
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {
      role: userRole,
      page: currentPage.toString(),
      page_size: pageSize.toString(),
    };

    if (userRole === 'student' && selectedClass) {
      params.class_id = selectedClass;
    }

    if (appliedFilters.status) {
      params.status = appliedFilters.status;
    }

    if (appliedFilters.leaveType) {
      params.leave_type = appliedFilters.leaveType;
    }

    if (appliedFilters.user) {
      params.user = appliedFilters.user;
    }

    if (appliedFilters.fromDate) {
      params.start_date__gte = appliedFilters.fromDate;
    }

    if (appliedFilters.toDate) {
      params.end_date__lte = appliedFilters.toDate;
    }

    return params;
  }, [userRole, selectedClass, appliedFilters, currentPage, pageSize]);

  // Fetch leave requests for review
  const {
    data: requestsData,
    isLoading: isLoadingRequests,
    refetch,
  } = useQuery({
    queryKey: ['leave-request-reviews', queryParams],
    queryFn: async () => {
      const queryString = new URLSearchParams(queryParams).toString();
      const response = await api.get(`/leave/leave-request-reviews/?${queryString}`);
      return response.data;
    },
    enabled: userRole === 'staff' || (userRole === 'student' && !!selectedClass),
    refetchOnMount: 'always',
  });

  const requests = (requestsData?.data || []) as LeaveRequestReview[];
  const pagination = requestsData?.pagination;

  // Use centralized mutation hooks
  const approveMutation = useApproveLeaveRequest();
  const rejectMutation = useRejectLeaveRequest();

  const handleApprove = (request: LeaveRequestReview) => {
    setReviewDialog({ open: true, request, action: 'approve' });
  };

  const handleReject = (request: LeaveRequestReview) => {
    setReviewDialog({ open: true, request, action: 'reject' });
  };

  const handleSubmitReview = (comments: string) => {
    if (!reviewDialog.request || !reviewDialog.action) return;

    const publicId = reviewDialog.request.public_id;

    if (reviewDialog.action === 'approve') {
      approveMutation.mutate(
        { publicId, comments },
        {
          onSuccess: () => {
            toast.success('Leave Request Approved', {
              description: 'The leave request has been approved successfully.',
            });
            refetch();
            setReviewDialog({ open: false, request: null, action: null });
          },
          onError: (error: Error) => {
            const apiError = error as unknown as { response?: { data?: { message?: string } } };
            toast.error('Failed to approve leave request', {
              description: apiError.response?.data?.message || 'An error occurred',
            });
          },
        }
      );
    } else {
      rejectMutation.mutate(
        { publicId, comments },
        {
          onSuccess: () => {
            toast.success('Leave Request Rejected', {
              description: 'The leave request has been rejected successfully.',
            });
            refetch();
            setReviewDialog({ open: false, request: null, action: null });
          },
          onError: (error: Error) => {
            const apiError = error as unknown as { response?: { data?: { message?: string } } };
            toast.error('Failed to reject leave request', {
              description: apiError.response?.data?.message || 'An error occurred',
            });
          },
        }
      );
    }
  };

  const handleResetFilters = () => {
    setSelectedStatus('pending');
    setSelectedLeaveType('');
    setSelectedUser('');
    setFromDate('');
    setToDate('');
    setAppliedFilters({
      status: 'pending',
      leaveType: '',
      user: '',
      fromDate: '',
      toDate: '',
    });
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({
      status: selectedStatus,
      leaveType: selectedLeaveType,
      user: selectedUser,
      fromDate,
      toDate,
    });
    setCurrentPage(1);
    setShowFilters(false);
  };

  const columns: Column<LeaveRequestReview>[] = [
    {
      header: 'Employee',
      accessor: (row) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/leave/dashboard/${row.user_public_id}`);
              }}
              className="text-blue-600 hover:text-blue-700 focus:outline-none focus:underline text-left w-full"
              aria-label={`View ${row.user_name}'s leave dashboard`}
            >
              <div className="flex flex-col items-start gap-0.5">
                <div className="font-medium">{row.user_name}</div>
                <div className="text-xs text-muted-foreground">{row.organization_role}</div>
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent>View {row.user_name}'s leave dashboard</TooltipContent>
        </Tooltip>
      ),
    },
    {
      header: 'Leave Type',
      accessor: (row) => (
        <div>
          <div className="font-medium">{row.leave_name}</div>
          <div className="text-xs text-muted-foreground">{row.leave_type_code}</div>
        </div>
      ),
    },
    {
      header: 'Leave Duration',
      accessor: (row) => (
        <div className="text-sm">
          <div>
            {formatDate(row.start_date)} - {formatDate(row.end_date)}
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => {
        const config = STATUS_CONFIG[row.status];
        return <Badge className={config.className}>{config.label}</Badge>;
      },
    },
    {
      header: 'Reason',
      accessor: (row) => (
        <div className="max-w-xs truncate text-sm" title={row.reason}>
          {row.reason}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleApprove(row)}
            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
            disabled={row.status !== 'pending'}
            title="Approve"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReject(row)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            disabled={row.status !== 'pending'}
            title="Reject"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReviewDialog({ open: true, request: row, action: null })}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
      width: 120,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Request Reviews"
        description="Review and approve/reject leave requests from your team"
      >
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="gap-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
          >
            <RefreshCw className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </PageHeader>

      {/* Staff/Student Toggle */}
      <div className="flex gap-2">
        <Button
          variant={userRole === 'staff' ? 'default' : 'outline'}
          onClick={() => setUserRole('staff')}
          className={cn(
            'flex-1',
            userRole === 'staff' && 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
          )}
        >
          <Users className="mr-2 h-4 w-4" />
          Staff
        </Button>
        <Button
          variant={userRole === 'student' ? 'default' : 'outline'}
          onClick={() => setUserRole('student')}
          className={cn(
            'flex-1',
            userRole === 'student' && 'bg-green-600 hover:bg-green-700 text-white shadow-md'
          )}
        >
          <User className="mr-2 h-4 w-4" />
          Students
        </Button>
      </div>

      {/* Class Selection for Students */}
      {userRole === 'student' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Class</CardTitle>
            <CardDescription>Choose a class to view student leave requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Combobox
              value={selectedClass}
              onValueChange={(value) => {
                setSelectedClass(value);
                setCurrentPage(1);
              }}
              options={classes.map((cls) => ({
                label: `${cls.class_master.name} (${cls.name})`,
                value: cls.public_id,
              }))}
              placeholder="Select a class"
              emptyText="No classes found"
              searchPlaceholder="Search classes..."
              disabled={isLoadingClasses}
            />
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Review Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Leave Type Filter */}
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All leave types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name} ({type.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* User Filter for Staff */}
              {userRole === 'staff' && (
                <div className="space-y-2">
                  <Label>Search User</Label>
                  <Combobox
                    value={selectedUser}
                    onValueChange={setSelectedUser}
                    options={users.map((user) => ({
                      label: `${user.full_name} [${user.email}]`,
                      value: user.public_id,
                      description: user.employee_id
                        ? `Employee ID: ${user.employee_id}`
                        : undefined,
                    }))}
                    placeholder="Select user"
                    emptyText="No users found"
                    searchPlaceholder="Search users..."
                    disabled={isLoadingUsers}
                  />
                </div>
              )}

              {/* From Date */}
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>

              {/* To Date */}
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </div>

            {/* Apply Filters Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleApplyFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>
            {userRole === 'staff' ? 'Staff' : 'Student'} leave requests awaiting your review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={requests}
            isLoading={isLoadingRequests}
            getRowKey={(row) => row.public_id}
            pagination={pagination}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <LeaveRequestReviewDialog
        open={reviewDialog.open}
        request={reviewDialog.request}
        action={reviewDialog.action}
        onClose={() => setReviewDialog({ open: false, request: null, action: null })}
        onSubmit={handleSubmitReview}
        isPending={approveMutation.isPending || rejectMutation.isPending}
      />
    </div>
  );
}
