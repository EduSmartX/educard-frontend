import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, parseISO, eachDayOfInterval } from 'date-fns';
import { FileText, CheckCircle2, XCircle, Clock, Users, Eye, Loader2, Minus } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MonthYearPicker } from '@/components/ui/month-year-picker';
import { Combobox } from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  getTimesheetSubmissions,
  getEmployeeAttendance,
  type TimesheetSubmission,
} from '@/features/attendance/api/attendance-api';
import { useReviewTimesheet } from '@/features/attendance/hooks/mutations/use-review-timesheet';
import { TimesheetStatusBadge, AttendanceCountBadge } from '@/features/attendance/components';
import { apiClient } from '@/lib/api-client';

interface ManageableUser {
  public_id: string;
  full_name: string;
  email: string;
  role: string;
  organization_role?: { name: string; code: string };
}

export default function TimesheetApprovalsPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('SUBMITTED');
  const [selectedSubmission, setSelectedSubmission] = useState<TimesheetSubmission | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Approve/Reject state
  const [approveTarget, setApproveTarget] = useState<TimesheetSubmission | null>(null);
  const [rejectTarget, setRejectTarget] = useState<TimesheetSubmission | null>(null);
  const [rejectComments, setRejectComments] = useState('');

  // Review mutation
  const reviewMutation = useReviewTimesheet(() => {
    setApproveTarget(null);
    setRejectTarget(null);
    setRejectComments('');
  });

  // Calculate month range
  const monthStart = useMemo(() => startOfMonth(selectedMonth), [selectedMonth]);
  const monthEnd = useMemo(() => endOfMonth(selectedMonth), [selectedMonth]);
  const fromDate = useMemo(() => format(monthStart, 'yyyy-MM-dd'), [monthStart]);
  const toDate = useMemo(() => format(monthEnd, 'yyyy-MM-dd'), [monthEnd]);

  // Fetch manageable users
  const { data: usersData } = useQuery({
    queryKey: ['manageable-users', 'staff'],
    queryFn: async () => {
      const response = await apiClient.get('/users/profile/manageable-users/', {
        params: { is_staff: true },
      });
      return response.data;
    },
  });

  const manageableUsers = useMemo(() => {
    const users = usersData?.data?.users || usersData?.data || [];
    return users as ManageableUser[];
  }, [usersData]);

  // Build filters for API
  const filters = useMemo(() => {
    const params: Record<string, string> = {
      view_type: 'staff',
      from_date: fromDate,
      to_date: toDate,
    };

    if (selectedStatus && selectedStatus !== 'ALL') {
      params.submission_status = selectedStatus;
    }

    if (selectedEmployee && selectedEmployee !== 'all') {
      params.employee = selectedEmployee;
    }

    return params;
  }, [fromDate, toDate, selectedStatus, selectedEmployee]);

  // Fetch timesheet submissions
  const { data: submissionsData, isLoading } = useQuery({
    queryKey: ['timesheet-submissions', filters],
    queryFn: () => getTimesheetSubmissions(filters),
  });

  // Fetch day-wise attendance for detailed view
  const { data: attendanceData, isLoading: isLoadingAttendance } = useQuery({
    queryKey: [
      'employee-attendance',
      selectedSubmission?.employee_info?.public_id,
      selectedSubmission?.week_start_date,
      selectedSubmission?.week_end_date,
    ],
    queryFn: () => {
      if (!selectedSubmission) {
        return null;
      }

      return getEmployeeAttendance({
        from_date: selectedSubmission.week_start_date,
        to_date: selectedSubmission.week_end_date,
        user_public_id: selectedSubmission.employee_info.public_id,
      });
    },
    enabled: isDetailDialogOpen && !!selectedSubmission,
  });

  // Group and sort data by employee, then by date
  const groupedData = useMemo(() => {
    const submissions = submissionsData?.results || [];

    // Sort by employee name (primary) then by week_start_date (secondary)
    return [...submissions].sort((a, b) => {
      // Primary sort: Employee name
      const nameA = a.employee_info?.full_name || '';
      const nameB = b.employee_info?.full_name || '';
      const nameCompare = nameA.localeCompare(nameB);

      if (nameCompare !== 0) {
        return nameCompare;
      }

      // Secondary sort: Week start date (descending - newest first)
      const dateA = new Date(a.week_start_date);
      const dateB = new Date(b.week_start_date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [submissionsData]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const submissions = submissionsData?.results || [];
    const pending = submissions.filter(
      (s: TimesheetSubmission) => s.submission_status === 'SUBMITTED'
    ).length;
    const approved = submissions.filter(
      (s: TimesheetSubmission) => s.submission_status === 'APPROVED'
    ).length;
    const rejected = submissions.filter(
      (s: TimesheetSubmission) => s.submission_status === 'REJECTED'
    ).length;
    const uniqueEmployees = new Set(
      submissions.map((s: TimesheetSubmission) => s.employee_info?.public_id)
    ).size;

    return { pending, approved, rejected, uniqueEmployees, total: submissions.length };
  }, [submissionsData]);

  // Define table columns
  const columns: Column<TimesheetSubmission>[] = useMemo(
    () => [
      {
        header: 'Employee',
        accessor: (row) => (
          <div className="flex flex-col">
            <div className="text-base font-semibold text-gray-900">
              {row.employee_info?.full_name || 'N/A'}
            </div>
            <div className="text-xs text-gray-600">
              {row.employee_info?.username || row.employee_info?.email}
            </div>
            {row.employee_info?.organization_role &&
              typeof row.employee_info.organization_role === 'object' && (
                <div className="mt-0.5 text-xs font-medium text-blue-600">
                  {row.employee_info.organization_role.name}
                </div>
              )}
          </div>
        ),
        sortable: true,
        sortKey: 'employee_info.full_name',
        width: 220,
      },
      {
        header: 'Week Period',
        accessor: (row) => (
          <div className="flex flex-col">
            <div className="text-sm font-semibold text-gray-900">
              {format(new Date(row.week_start_date), 'MMM dd')} -{' '}
              {format(new Date(row.week_end_date), 'MMM dd, yyyy')}
            </div>
            <div className="mt-0.5 text-xs text-gray-500">
              (
              {Math.ceil(
                (new Date(row.week_end_date).getTime() - new Date(row.week_start_date).getTime()) /
                  (1000 * 60 * 60 * 24) +
                  1
              )}{' '}
              days)
            </div>
          </div>
        ),
        sortable: true,
        sortKey: 'week_start_date',
        width: 220,
      },
      {
        header: 'Working Days',
        accessor: (row) => (
          <span className="text-base font-bold text-gray-900">{row.total_working_days}</span>
        ),
        headerClassName: 'text-center',
        className: 'text-center',
        sortable: true,
        sortKey: 'total_working_days',
        width: 130,
      },
      {
        header: 'Present',
        accessor: (row) => <AttendanceCountBadge count={row.total_present_days} type="present" />,
        headerClassName: 'text-center',
        className: 'text-center',
        sortable: true,
        sortKey: 'total_present_days',
        width: 100,
      },
      {
        header: 'Absent',
        accessor: (row) => <AttendanceCountBadge count={row.total_absent_days} type="absent" />,
        headerClassName: 'text-center',
        className: 'text-center',
        sortable: true,
        sortKey: 'total_absent_days',
        width: 100,
      },
      {
        header: 'Leave',
        accessor: (row) => <AttendanceCountBadge count={row.total_leave_days} type="leave" />,
        headerClassName: 'text-center',
        className: 'text-center',
        sortable: true,
        sortKey: 'total_leave_days',
        width: 100,
      },
      {
        header: 'Attendance %',
        accessor: (row) => {
          const percentage =
            typeof row.attendance_percentage === 'string'
              ? parseFloat(row.attendance_percentage)
              : row.attendance_percentage;
          const colorClass =
            percentage >= 75
              ? 'text-green-600'
              : percentage >= 50
                ? 'text-yellow-600'
                : 'text-red-600';
          return (
            <span className={`text-lg font-bold ${colorClass}`}>{row.attendance_percentage}%</span>
          );
        },
        headerClassName: 'text-center',
        className: 'text-center',
        sortable: true,
        sortKey: 'attendance_percentage',
        width: 140,
      },
      {
        header: 'Submitted On',
        accessor: (row) =>
          row.submitted_at ? (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {format(new Date(row.submitted_at), 'MMM dd, yyyy')}
              </span>
              <span className="text-xs text-gray-500">
                {format(new Date(row.submitted_at), 'h:mm a')}
              </span>
            </div>
          ) : (
            '-'
          ),
        sortable: true,
        sortKey: 'submitted_at',
        width: 150,
      },
      {
        header: 'Status',
        accessor: (row) => <TimesheetStatusBadge status={row.submission_status} />,
        headerClassName: 'text-center',
        className: 'text-center',
        sortable: true,
        sortKey: 'submission_status',
        width: 140,
      },
      {
        header: 'Actions',
        accessor: (row) => (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-blue-200 bg-blue-50 px-3 text-blue-700 shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-blue-100 hover:text-blue-800 hover:shadow"
              onClick={() => {
                setSelectedSubmission(row);
                setIsDetailDialogOpen(true);
              }}
            >
              <Eye className="mr-1 h-4 w-4" />
              <span className="text-xs font-medium">View</span>
            </Button>
            {row.submission_status === 'SUBMITTED' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-green-200 bg-green-50 px-3 text-green-700 shadow-sm transition-all duration-200 hover:border-green-300 hover:bg-green-100 hover:text-green-800 hover:shadow"
                  disabled={reviewMutation.isPending}
                  onClick={() => setApproveTarget(row)}
                >
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  <span className="text-xs font-medium">Approve</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-red-200 bg-red-50 px-3 text-red-700 shadow-sm transition-all duration-200 hover:border-red-300 hover:bg-red-100 hover:text-red-800 hover:shadow"
                  disabled={reviewMutation.isPending}
                  onClick={() => {
                    setRejectComments('');
                    setRejectTarget(row);
                  }}
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  <span className="text-xs font-medium">Reject</span>
                </Button>
              </>
            )}
          </div>
        ),
        headerClassName: 'text-center',
        className: 'text-center',
        width: 320,
      },
    ],
    [reviewMutation.isPending]
  );

  // Employee options for filter
  const employeeOptions = useMemo(
    () =>
      manageableUsers.map((user) => ({
        value: user.public_id,
        label: user.full_name,
      })),
    [manageableUsers]
  );

  // Status options for filter
  const statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'SUBMITTED', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timesheet Approvals"
        description="Review and approve staff timesheet submissions"
        icon={FileText}
      />

      {/* Metrics Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-orange-900">
              Pending Approvals
            </CardTitle>
            <Clock className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-700">{metrics.pending}</div>
            <p className="mt-2 text-sm font-medium text-orange-700">
              {metrics.uniqueEmployees} employee{metrics.uniqueEmployees !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-green-900">Approved</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-700">{metrics.approved}</div>
            <p className="mt-2 text-sm font-medium text-green-700">Total approved timesheets</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-red-900">Rejected</CardTitle>
            <XCircle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-700">{metrics.rejected}</div>
            <p className="mt-2 text-sm font-medium text-red-700">Total rejected timesheets</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-semibold text-blue-900">Staff Members</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-700">{manageableUsers.length}</div>
            <p className="mt-2 text-sm font-medium text-blue-700">Total manageable staff</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Month Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Month</label>
              <MonthYearPicker
                value={selectedMonth}
                onChange={(date) => date && setSelectedMonth(date)}
              />
            </div>

            {/* Employee Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Filter by Employee</label>
              <Combobox
                options={[{ value: 'all', label: 'All Employees' }, ...employeeOptions]}
                value={selectedEmployee}
                onValueChange={setSelectedEmployee}
                placeholder="Select employee..."
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Filter by Status</label>
              <Combobox
                options={statusOptions}
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                placeholder="Select status..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Timesheet Submissions ({groupedData.length})
            </CardTitle>
            <Badge variant="outline" className="text-sm">
              {format(selectedMonth, 'MMMM yyyy')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={groupedData}
            getRowKey={(row) => row.public_id}
            isLoading={isLoading}
            emptyMessage="No timesheet submissions found for the selected period."
          />
        </CardContent>
      </Card>

      {/* Detail View Dialog */}
      <Dialog
        open={isDetailDialogOpen}
        onOpenChange={(open) => !open && setIsDetailDialogOpen(false)}
      >
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Timesheet Details</DialogTitle>
            <DialogDescription>Detailed weekly attendance report</DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                <div>
                  <p className="text-sm text-gray-600">Employee</p>
                  <p className="font-semibold">{selectedSubmission.employee_info.full_name}</p>
                  <p className="text-sm text-gray-500">{selectedSubmission.employee_info.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Week Period</p>
                  <p className="font-semibold">
                    {format(parseISO(selectedSubmission.week_start_date), 'MMM dd')} -{' '}
                    {format(parseISO(selectedSubmission.week_end_date), 'MMM dd, yyyy')}
                  </p>
                  <div className="mt-2">
                    <TimesheetStatusBadge status={selectedSubmission.submission_status} />
                  </div>
                </div>
              </div>

              {/* Summary Stats — prefer fresh stats from attendance API over stale stored values */}
              {(() => {
                const freshStats = attendanceData?.stats;
                const workingDays =
                  freshStats?.total_working_days ?? selectedSubmission.total_working_days;
                const present = freshStats?.total_present ?? selectedSubmission.total_present_days;
                const absent = freshStats?.total_absent ?? selectedSubmission.total_absent_days;
                const leave = freshStats?.total_leaves ?? selectedSubmission.total_leave_days;
                const holidays = freshStats?.total_holidays ?? selectedSubmission.total_holidays;
                const percentage =
                  freshStats?.attendance_percentage ?? selectedSubmission.attendance_percentage;

                return (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <p className="text-xs font-medium text-gray-600">Working Days</p>
                      <p className="text-2xl font-bold text-blue-600">{workingDays}</p>
                    </div>
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <p className="text-xs font-medium text-gray-600">Present</p>
                      <p className="text-2xl font-bold text-green-600">{present}</p>
                    </div>
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <p className="text-xs font-medium text-gray-600">Absent</p>
                      <p className="text-2xl font-bold text-red-600">{absent}</p>
                    </div>
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                      <p className="text-xs font-medium text-gray-600">Leave</p>
                      <p className="text-2xl font-bold text-yellow-600">{leave}</p>
                    </div>
                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                      <p className="text-xs font-medium text-gray-600">Holidays</p>
                      <p className="text-2xl font-bold text-purple-600">{holidays}</p>
                    </div>
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                      <p className="text-xs font-medium text-gray-600">Attendance %</p>
                      <p className="text-2xl font-bold text-indigo-600">{percentage}%</p>
                    </div>
                  </div>
                );
              })()}

              {/* Day-wise Details */}
              {isLoadingAttendance ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : attendanceData ? (
                <div>
                  <h4 className="mb-3 text-sm font-semibold">Daily Attendance</h4>
                  <div className="overflow-hidden rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-32">Date</TableHead>
                          <TableHead className="w-28">Day</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-24 text-center">Morning</TableHead>
                          <TableHead className="w-24 text-center">Afternoon</TableHead>
                          <TableHead>Remarks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          // Build all days in the week range
                          const start = parseISO(selectedSubmission.week_start_date);
                          const end = parseISO(selectedSubmission.week_end_date);
                          const allDays = eachDayOfInterval({ start, end });

                          // Build lookup maps
                          const recordsByDate = new Map(
                            (attendanceData.records || []).map((r) => [r.date, r])
                          );
                          const holidayDescs = attendanceData.holiday_descriptions || {};
                          const exceptions = new Map(
                            (attendanceData.calendar_exceptions || []).map((e) => [e.date, e])
                          );
                          const policy = attendanceData.working_day_policy;

                          return allDays.map((date) => {
                            const dateKey = format(date, 'yyyy-MM-dd');
                            const record = recordsByDate.get(dateKey);
                            const holidayInfo = holidayDescs[dateKey];
                            const exception = exceptions.get(dateKey);
                            const dayOfWeek = date.getDay();

                            // Determine if this is a non-working day
                            const isForceHoliday =
                              exception?.type === 'force_holiday' ||
                              exception?.type === 'FORCE_HOLIDAY';
                            const isForceWorking =
                              exception?.type === 'force_working' ||
                              exception?.type === 'FORCE_WORKING';
                            const isOfficialHoliday = holidayInfo?.type === 'official_holiday';
                            const isWeekendDay = holidayInfo?.type === 'weekend';
                            // Check weekend via policy if no holiday_descriptions entry
                            const isSundayOff = dayOfWeek === 0 && policy?.sunday_off;
                            const isSaturdayOff =
                              dayOfWeek === 6 &&
                              policy &&
                              (policy.saturday_off_pattern === 'ALL' ||
                                (policy.saturday_off_pattern === 'SECOND_ONLY' &&
                                  Math.ceil(date.getDate() / 7) === 2) ||
                                (policy.saturday_off_pattern === 'SECOND_AND_FOURTH' &&
                                  [2, 4].includes(Math.ceil(date.getDate() / 7))));
                            const isWeekend =
                              isWeekendDay || (!isForceWorking && (isSundayOff || isSaturdayOff));

                            const isHoliday =
                              isForceHoliday || isOfficialHoliday || (isWeekend && !isForceWorking);
                            const isLeave = !!record?.is_leave;
                            const morningPresent = record?.morning_present ?? false;
                            const afternoonPresent = record?.afternoon_present ?? false;
                            const hasRecord = !!record;

                            // Determine status
                            let statusText = '';
                            let statusColor = '';
                            let rowBg = '';

                            if (isForceHoliday) {
                              statusText = 'Special Holiday';
                              statusColor = 'text-purple-700 bg-purple-100 border-purple-300';
                              rowBg = 'bg-purple-50/50';
                            } else if (isOfficialHoliday) {
                              statusText = 'Holiday';
                              statusColor = 'text-purple-600 bg-purple-50';
                              rowBg = 'bg-purple-50/50';
                            } else if (isWeekend && !isForceWorking) {
                              statusText = 'Weekend';
                              statusColor = 'text-gray-500 bg-gray-100';
                              rowBg = 'bg-gray-50';
                            } else if (isLeave) {
                              statusText = record?.leave_type_name || 'Leave';
                              statusColor = 'text-yellow-700 bg-yellow-50 border-yellow-300';
                              rowBg = 'bg-yellow-50/30';
                            } else if (hasRecord && morningPresent && afternoonPresent) {
                              statusText = 'Present';
                              statusColor = 'text-green-600 bg-green-50';
                            } else if (hasRecord && (morningPresent || afternoonPresent)) {
                              statusText = 'Half Day';
                              statusColor = 'text-blue-600 bg-blue-50';
                            } else if (hasRecord) {
                              statusText = 'Absent';
                              statusColor = 'text-red-600 bg-red-50';
                            } else {
                              statusText = 'No Record';
                              statusColor = 'text-gray-400 bg-gray-50';
                              rowBg = 'bg-gray-50/50';
                            }

                            // Determine remarks
                            const remarks =
                              holidayInfo?.description ||
                              (isLeave ? record?.leave_type_name : '') ||
                              exception?.reason ||
                              (isWeekend ? (dayOfWeek === 0 ? 'Sunday' : 'Saturday') : '') ||
                              '-';

                            return (
                              <TableRow key={dateKey} className={rowBg}>
                                <TableCell className="font-medium">
                                  {format(date, 'MMM dd, yyyy')}
                                </TableCell>
                                <TableCell className="text-sm text-gray-600">
                                  {format(date, 'EEEE')}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={statusColor}>
                                    {statusText}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  {isHoliday || (!hasRecord && !isLeave) ? (
                                    <Minus className="mx-auto h-4 w-4 text-gray-300" />
                                  ) : morningPresent ? (
                                    <CheckCircle2 className="mx-auto h-5 w-5 text-green-600" />
                                  ) : (
                                    <XCircle className="mx-auto h-5 w-5 text-red-400" />
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {isHoliday || (!hasRecord && !isLeave) ? (
                                    <Minus className="mx-auto h-4 w-4 text-gray-300" />
                                  ) : afternoonPresent ? (
                                    <CheckCircle2 className="mx-auto h-5 w-5 text-green-600" />
                                  ) : (
                                    <XCircle className="mx-auto h-5 w-5 text-red-400" />
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-gray-600">{remarks}</TableCell>
                              </TableRow>
                            );
                          });
                        })()}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">No attendance data available</div>
              )}

              {/* Review Info (if reviewed) */}
              {selectedSubmission.reviewed_at && (
                <div className="rounded-lg border bg-gray-50 p-4">
                  <h4 className="mb-2 text-sm font-semibold">Review Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Reviewed By</p>
                      <p className="font-medium">
                        {selectedSubmission.reviewed_by_info?.full_name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Reviewed At</p>
                      <p className="font-medium">
                        {format(parseISO(selectedSubmission.reviewed_at), 'MMM dd, yyyy hh:mm a')}
                      </p>
                    </div>
                    {selectedSubmission.review_comments && (
                      <div className="col-span-2">
                        <p className="text-gray-600">Comments</p>
                        <p className="font-medium">{selectedSubmission.review_comments}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons when viewing a pending submission */}
              {selectedSubmission.submission_status === 'SUBMITTED' && (
                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button
                    variant="outline"
                    className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    onClick={() => {
                      setIsDetailDialogOpen(false);
                      setRejectComments('');
                      setRejectTarget(selectedSubmission);
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={() => {
                      setIsDetailDialogOpen(false);
                      setApproveTarget(selectedSubmission);
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={!!approveTarget} onOpenChange={(open) => !open && setApproveTarget(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Timesheet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve the timesheet for{' '}
              <span className="font-semibold text-gray-900">
                {approveTarget?.employee_info.full_name}
              </span>{' '}
              for the week{' '}
              <span className="font-semibold text-gray-900">
                {approveTarget &&
                  `${format(parseISO(approveTarget.week_start_date), 'MMM dd')} - ${format(parseISO(approveTarget.week_end_date), 'MMM dd, yyyy')}`}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reviewMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 text-white hover:bg-green-700"
              disabled={reviewMutation.isPending}
              onClick={() => {
                if (!approveTarget) {
                  return;
                }
                reviewMutation.mutate({
                  publicId: approveTarget.public_id,
                  data: { submission_status: 'APPROVED' },
                });
              }}
            >
              {reviewMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving…
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog with Comments */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Timesheet</DialogTitle>
            <DialogDescription>
              Rejecting timesheet for{' '}
              <span className="font-semibold text-gray-900">
                {rejectTarget?.employee_info.full_name}
              </span>{' '}
              for the week{' '}
              <span className="font-semibold text-gray-900">
                {rejectTarget &&
                  `${format(parseISO(rejectTarget.week_start_date), 'MMM dd')} - ${format(parseISO(rejectTarget.week_end_date), 'MMM dd, yyyy')}`}
              </span>
              . Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-sm font-medium text-gray-700">
              Reason for rejection <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={rejectComments}
              onChange={(e) => setRejectComments(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={3}
              className="resize-none"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              disabled={reviewMutation.isPending}
              onClick={() => setRejectTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={reviewMutation.isPending || !rejectComments.trim()}
              onClick={() => {
                if (!rejectTarget) {
                  return;
                }
                if (!rejectComments.trim()) {
                  toast.error('Comments are required when rejecting a timesheet.');
                  return;
                }
                reviewMutation.mutate({
                  publicId: rejectTarget.public_id,
                  data: {
                    submission_status: 'REJECTED',
                    review_comments: rejectComments.trim(),
                  },
                });
              }}
            >
              {reviewMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting…
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
