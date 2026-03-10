import { format, parseISO } from 'date-fns';
import { CheckCircle2, XCircle, Eye } from 'lucide-react';
import type { Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { TimesheetSubmission } from '@/features/attendance/api/attendance-api';
import { TimesheetStatusBadge } from './timesheet-status-badge';
import { AttendanceCountBadge } from './attendance-count-badge';
import { canReviewTimesheet } from '@/features/attendance/utils';
import { TimesheetReviewAction, type TimesheetReviewActionValue } from '@/constants/attendance';

interface TimesheetTableColumnsProps {
  isAdmin: boolean;
  isReviewPending: boolean;
  onViewDetails: (submission: TimesheetSubmission) => void;
  onReview?: (submission: TimesheetSubmission, action: TimesheetReviewActionValue) => void;
  showEmployeeColumn?: boolean; // Only show in Staff tab
}

export function getTimesheetTableColumns({
  isAdmin,
  isReviewPending,
  onViewDetails,
  onReview,
  showEmployeeColumn = false,
}: TimesheetTableColumnsProps): Column<TimesheetSubmission>[] {
  const columns: Column<TimesheetSubmission>[] = [];

  // Employee column - only for Staff tab
  if (showEmployeeColumn) {
    columns.push({
      header: 'Employee',
      accessor: (row) => (
        <div className="text-sm">
          <div className="font-medium">{row.employee_info.first_name} {row.employee_info.last_name}</div>
          <div className="text-gray-500 text-xs">{row.employee_info.email}</div>
        </div>
      ),
      sortable: true,
      sortKey: 'employee_info.first_name',
      width: 250,
      minWidth: 200,
      maxWidth: 350,
    });
  }

  // Week Period
  columns.push({
    header: 'Week Period',
    accessor: (row) => (
      <div className="text-sm font-medium">
        {format(parseISO(row.week_start_date), 'MMM dd')} - {format(parseISO(row.week_end_date), 'MMM dd, yyyy')}
      </div>
    ),
    sortable: true,
    sortKey: 'week_start_date',
    width: 200,
    minWidth: 180,
    maxWidth: 250,
  });

  // Working Days
  columns.push({
    header: 'Working Days',
    accessor: (row) => (
      <span className="font-semibold">{row.total_working_days}</span>
    ),
    headerClassName: 'text-center',
    className: 'text-center',
    sortable: true,
    sortKey: 'total_working_days',
    width: 120,
    minWidth: 100,
    maxWidth: 150,
  });

  // Present
  columns.push({
    header: 'Present',
    accessor: (row) => (
      <AttendanceCountBadge count={row.total_present_days} type="present" />
    ),
    headerClassName: 'text-center',
    className: 'text-center',
    sortable: true,
    sortKey: 'total_present_days',
    width: 100,
    minWidth: 80,
    maxWidth: 120,
  });

  // Absent
  columns.push({
    header: 'Absent',
    accessor: (row) => (
      <AttendanceCountBadge count={row.total_absent_days} type="absent" />
    ),
    headerClassName: 'text-center',
    className: 'text-center',
    sortable: true,
    sortKey: 'total_absent_days',
    width: 100,
    minWidth: 80,
    maxWidth: 120,
  });

  // Leave
  columns.push({
    header: 'Leave',
    accessor: (row) => (
      <AttendanceCountBadge count={row.total_leave_days} type="leave" />
    ),
    headerClassName: 'text-center',
    className: 'text-center',
    sortable: true,
    sortKey: 'total_leave_days',
    width: 100,
    minWidth: 80,
    maxWidth: 120,
  });

  // Attendance %
  columns.push({
    header: 'Attendance %',
    accessor: (row) => (
      <span className="font-semibold text-purple-600">{row.attendance_percentage}%</span>
    ),
    headerClassName: 'text-center',
    className: 'text-center',
    sortable: true,
    sortKey: 'attendance_percentage',
    width: 130,
    minWidth: 110,
    maxWidth: 150,
  });

  // Submitted On
  columns.push({
    header: 'Submitted On',
    accessor: (row) => (
      row.submitted_at ? format(parseISO(row.submitted_at), 'MMM dd, yyyy') : '-'
    ),
    sortable: true,
    sortKey: 'submitted_at',
    width: 140,
    minWidth: 120,
    maxWidth: 180,
  });

  // Status
  columns.push({
    header: 'Status',
    accessor: (row) => (
      <TimesheetStatusBadge status={row.submission_status} />
    ),
    headerClassName: 'text-center',
    className: 'text-center',
    sortable: true,
    sortKey: 'submission_status',
    width: 140,
    minWidth: 120,
    maxWidth: 180,
  });

  // Actions
  columns.push({
    header: 'Actions',
    accessor: (row) => (
      <TooltipProvider>
        <div className="flex items-center justify-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onViewDetails(row)}
                className="h-8 w-8"
              >
                <Eye className="w-4 h-4" />
                <span className="sr-only">View Details</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Details</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Show Approve/Reject buttons for Admin when status allows review */}
          {isAdmin && canReviewTimesheet(row.submission_status) && onReview && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className="h-8 w-8 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => onReview(row, TimesheetReviewAction.APPROVED)}
                    disabled={isReviewPending}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="sr-only">Approve</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Approve</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => onReview(row, TimesheetReviewAction.REJECTED)}
                    disabled={isReviewPending}
                  >
                    <XCircle className="w-4 h-4" />
                    <span className="sr-only">Reject</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reject</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </TooltipProvider>
    ),
    headerClassName: 'text-right',
    className: 'text-right',
    width: 180,
    minWidth: 140,
    maxWidth: 220,
  });

  return columns;
}
