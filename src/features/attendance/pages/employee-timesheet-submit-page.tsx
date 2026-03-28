import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  PlusCircle,
  RotateCcw,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ROUTES } from '@/constants/app-config';
import { TimesheetStatus } from '@/constants/attendance';
import { TimesheetStatusBadge } from '@/features/attendance/components';
import { useSubmitTimesheet, useReturnTimesheetToDraft } from '@/features/attendance/hooks';
import {
  fetchOrganizationHolidays,
  getEmployeeAttendance,
  checkTimesheetStatus,
} from '@/features/attendance/api/attendance-api';
import { fetchMyLeaveRequests } from '@/features/leave/api/leave-api';
import type { LeaveRequest } from '@/features/leave/types';
import { fetchCalendarExceptions } from '@/features/exceptional-work/api/calendar-exception-api';
import type { CalendarException } from '@/features/exceptional-work/types';
import { getCurrentWorkingDayPolicy } from '@/lib/api/working-day-policy-api';
import { LeaveRequestDialog } from '@/features/attendance/components/leave-request-dialog';

type WeekRow = {
  date: string;
  morning_present: boolean;
  afternoon_present: boolean;
  remarks: string;
  locked_reason?:
    | 'holiday'
    | 'leave'
    | 'non_working_day'
    | 'exception_holiday'
    | 'exception_working';
  holiday_description?: string;
  is_working_day: boolean;
  leave_type_name?: string | null;
  leave_status?: string | null;
  exception_type?: string | null;
  exception_reason?: string | null;
};

// Improved attendance indicator with side-by-side morning and afternoon buttons
const AttendanceIndicator = ({
  morningPresent,
  afternoonPresent,
  disabled,
  onMorningClick,
  onAfternoonClick,
}: {
  morningPresent: boolean;
  afternoonPresent: boolean;
  disabled?: boolean;
  onMorningClick?: () => void;
  onAfternoonClick?: () => void;
}) => {
  return (
    <div className="flex justify-center gap-2">
      {/* Morning Session */}
      <Button
        variant={morningPresent ? 'default' : 'outline'}
        size="sm"
        className={`h-10 min-w-[120px] px-6 ${
          morningPresent
            ? `border-green-600 bg-green-600 text-white shadow-sm ${disabled ? 'cursor-not-allowed opacity-75' : 'hover:bg-green-700'}`
            : `border-2 border-red-400 bg-red-50 text-red-700 ${disabled ? 'cursor-not-allowed opacity-75' : 'hover:border-red-500 hover:bg-red-100'}`
        }`}
        onClick={disabled ? undefined : onMorningClick}
        disabled={disabled}
      >
        <span className="text-sm font-semibold">Morning</span>
      </Button>

      {/* Afternoon Session */}
      <Button
        variant={afternoonPresent ? 'default' : 'outline'}
        size="sm"
        className={`h-10 min-w-[120px] px-6 ${
          afternoonPresent
            ? `border-green-600 bg-green-600 text-white shadow-sm ${disabled ? 'cursor-not-allowed opacity-75' : 'hover:bg-green-700'}`
            : `border-2 border-red-400 bg-red-50 text-red-700 ${disabled ? 'cursor-not-allowed opacity-75' : 'hover:border-red-500 hover:bg-red-100'}`
        }`}
        onClick={disabled ? undefined : onAfternoonClick}
        disabled={disabled}
      >
        <span className="text-sm font-semibold">Afternoon</span>
      </Button>
    </div>
  );
};

type WeekBlock = {
  id: string;
  start: string;
  end: string;
  rows: WeekRow[];
  collapsed: boolean;
  submissionStatus?: keyof typeof TimesheetStatus | null;
  submissionStatusLabel?: string | null;
  reviewComments?: string | null; // Added to show rejection reason
};

export function EmployeeTimesheetSubmitPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [weeks, setWeeks] = useState<WeekBlock[]>([]);
  const [addingWeek, setAddingWeek] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [selectedDateForLeave, setSelectedDateForLeave] = useState<Date | null>(null);

  // Detect if we're on the employee route to use the correct paths
  const isEmployeeRoute = location.pathname.startsWith('/employee');
  const timesheetRoute = isEmployeeRoute
    ? ROUTES.EMPLOYEE.ATTENDANCE.TIMESHEET
    : ROUTES.ATTENDANCE.TIMESHEET;

  // Fetch current month attendance to get submission config
  const currentMonthStart = useMemo(() => startOfMonth(new Date()), []);
  const currentMonthEnd = useMemo(() => endOfMonth(new Date()), []);
  const fromDate = useMemo(() => format(currentMonthStart, 'yyyy-MM-dd'), [currentMonthStart]);
  const toDate = useMemo(() => format(currentMonthEnd, 'yyyy-MM-dd'), [currentMonthEnd]);

  const { data: attendanceData } = useQuery({
    queryKey: ['timesheet', 'attendance', fromDate, toDate],
    queryFn: () => getEmployeeAttendance({ from_date: fromDate, to_date: toDate }),
  });

  const defaultPresent = attendanceData?.submission_config?.default_present ?? true;

  // Submit timesheet mutation - extracted to custom hook with enhanced error handling
  const submitMutation = useSubmitTimesheet({
    onSuccessCallback: () => {
      // Redirect to timesheet page after successful submission
      setTimeout(() => {
        navigate(timesheetRoute);
      }, 1000);
    },
  });

  // Return to draft mutation
  const returnToDraftMutation = useReturnTimesheetToDraft(() => {
    toast.success('Timesheet returned to draft. You can now edit and resubmit.');
    queryClient.invalidateQueries({ queryKey: ['timesheet'] });
    queryClient.invalidateQueries({ queryKey: ['attendance'] });
  });

  const addWeek = async () => {
    if (!selectedDate) {
      toast.error('Please select a date to add its week.');
      return;
    }

    // Week starts on Sunday (0) and ends on Saturday (6)
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
    const weekId = format(weekStart, 'yyyy-MM-dd');

    if (weeks.some((week) => week.id === weekId)) {
      toast.error('This week is already added.');
      return;
    }

    setAddingWeek(true);
    try {
      const fromDate = format(weekStart, 'yyyy-MM-dd');
      const toDate = format(weekEnd, 'yyyy-MM-dd');

      const [
        leaveResponse,
        holidayResponse,
        workingDayPolicy,
        calendarExceptions,
        submissionStatus,
      ] = await Promise.all([
        fetchMyLeaveRequests({
          start_date__lte: toDate,
          end_date__gte: fromDate,
          status__in: 'approved,pending',
          page_size: 100,
        }),
        fetchOrganizationHolidays({ from_date: fromDate, to_date: toDate }),
        getCurrentWorkingDayPolicy().catch(() => null),
        fetchCalendarExceptions({
          from_date: fromDate,
          to_date: toDate,
          page_size: 100,
        }).catch(() => ({ data: [] as CalendarException[] })),
        checkTimesheetStatus({
          week_start_date: fromDate,
          week_end_date: toDate,
        }).catch(() => ({ submission: null })),
      ]);

      const leaveByDate = new Map<string, { leave_name: string; status: string }>();
      (leaveResponse?.data || []).forEach((leave: LeaveRequest) => {
        const start = parseISO(leave.start_date);
        const end = parseISO(leave.end_date);
        eachDayOfInterval({ start, end }).forEach((day) => {
          leaveByDate.set(format(day, 'yyyy-MM-dd'), {
            leave_name: leave.leave_type_name || leave.leave_name || 'Leave',
            status: leave.status,
          });
        });
      });

      const holidayByDate = new Map<
        string,
        { start_date: string; end_date: string; description: string; holiday_type: string }
      >();
      (holidayResponse?.holidays || []).forEach((holiday) => {
        const start = parseISO(holiday.start_date);
        const end = parseISO(holiday.end_date);
        // Add each day in the holiday range to the map
        eachDayOfInterval({ start, end }).forEach((day) => {
          const key = format(day, 'yyyy-MM-dd');
          holidayByDate.set(key, {
            start_date: holiday.start_date,
            end_date: holiday.end_date,
            description: holiday.description,
            holiday_type: holiday.holiday_type,
          });
        });
      });

      // Create calendar exception map (only for exceptions applicable to all classes)
      const exceptionByDate = new Map<string, CalendarException>();
      (calendarExceptions?.data || []).forEach((exception) => {
        if (exception.is_applicable_to_all_classes) {
          exceptionByDate.set(exception.date, exception);
        }
      });

      // Helper function to determine if a day is a working day
      const isWorkingDay = (day: Date): boolean => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const exception = exceptionByDate.get(dayKey);

        // If there's an exception, respect it
        if (exception) {
          return exception.override_type === 'FORCE_WORKING';
        }

        // Otherwise, check working day policy
        const dayOfWeek = getDay(day); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

        if (!workingDayPolicy) {
          // Default: Monday to Friday
          return dayOfWeek >= 1 && dayOfWeek <= 5;
        }

        // Check Sunday
        if (dayOfWeek === 0) {
          return !workingDayPolicy.sunday_off; // If sunday_off is true, it's NOT a working day
        }

        // Check Saturday
        if (dayOfWeek === 6) {
          const pattern = workingDayPolicy.saturday_off_pattern;

          // If pattern is NONE, all Saturdays are working days
          if (pattern === 'NONE') {
            return true;
          }

          // If pattern is ALL, all Saturdays are off
          if (pattern === 'ALL') {
            return false;
          }

          // For FIRST_AND_THIRD or SECOND_AND_FOURTH, calculate which Saturday of the month this is
          const dayOfMonth = day.getDate();
          const saturdayOfMonth = Math.ceil(dayOfMonth / 7); // 1st, 2nd, 3rd, 4th, or 5th Saturday

          if (pattern === 'FIRST_AND_THIRD') {
            return saturdayOfMonth !== 1 && saturdayOfMonth !== 3;
          }

          if (pattern === 'SECOND_AND_FOURTH') {
            return saturdayOfMonth !== 2 && saturdayOfMonth !== 4;
          }

          // Default for unknown patterns: Saturday is working
          return true;
        }

        // Monday to Friday are working days by default
        return true;
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for comparison

      // IMPORTANT: Always fetch actual attendance records for this week.
      // This covers both submitted timesheets AND daily attendance that was
      // recorded but not yet submitted as a timesheet.
      const submittedAttendanceMap = new Map<
        string,
        { morning_present: boolean; afternoon_present: boolean; remarks: string }
      >();

      try {
        const attendanceResponse = await getEmployeeAttendance({
          from_date: fromDate,
          to_date: toDate,
        });

        // Build a map of date -> attendance record for quick lookup
        (attendanceResponse?.records || []).forEach((record) => {
          submittedAttendanceMap.set(record.date, {
            morning_present: record.morning_present,
            afternoon_present: record.afternoon_present,
            remarks: record.remarks || '',
          });
        });
      } catch (error) {
        console.error('Error fetching attendance records:', error);
        toast.warning('Could not load existing attendance records');
      }

      const rows: WeekRow[] = eachDayOfInterval({ start: weekStart, end: weekEnd })
        .filter((day) => {
          // Only include dates up to today (exclude future dates)
          return day <= today;
        })
        .map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const holiday = holidayByDate.get(key);
          const isHoliday = !!holiday;
          const leaveInfo = leaveByDate.get(key);
          const isLeave = !!leaveInfo;
          const exception = exceptionByDate.get(key);
          const workingDay = isWorkingDay(day);

          // Determine locked reason
          let lockedReason: WeekRow['locked_reason'] = undefined;
          let description = holiday?.description;

          if (isHoliday) {
            lockedReason = 'holiday';
          } else if (isLeave) {
            lockedReason = 'leave';
          } else if (exception) {
            if (exception.override_type === 'FORCE_HOLIDAY') {
              lockedReason = 'exception_holiday';
              description = `Exception: ${exception.reason}`;
            } else if (exception.override_type === 'FORCE_WORKING') {
              lockedReason = 'exception_working';
            }
          } else if (!workingDay) {
            lockedReason = 'non_working_day';
            description = 'Non-working day';
          }

          const isLocked = !!lockedReason && lockedReason !== 'exception_working';

          // IMPORTANT: Use actual submitted attendance data if available
          // Otherwise fall back to default values for new weeks
          const submittedData = submittedAttendanceMap.get(key);

          return {
            date: key,
            morning_present: submittedData
              ? submittedData.morning_present
              : isLocked
                ? false
                : defaultPresent,
            afternoon_present: submittedData
              ? submittedData.afternoon_present
              : isLocked
                ? false
                : defaultPresent,
            remarks: submittedData ? submittedData.remarks : '',
            locked_reason: lockedReason,
            holiday_description: description,
            is_working_day: workingDay,
            leave_type_name: leaveInfo?.leave_name,
            leave_status: leaveInfo?.status,
            exception_type: exception?.override_type,
            exception_reason: exception?.reason,
          };
        });

      const submission = submissionStatus?.submission;

      setWeeks((prev) => [
        ...prev,
        {
          id: weekId,
          start: fromDate,
          end: toDate,
          rows,
          collapsed: false,
          submissionStatus: submission?.submission_status || null,
          submissionStatusLabel: submission?.status_display || null,
          reviewComments: submission?.review_comments || null, // Include rejection reason
        },
      ]);
    } catch (error) {
      console.error('Error loading week data:', error);
      toast.error('Unable to load leave/holiday data for selected week.');
    } finally {
      setAddingWeek(false);
    }
  };

  const updateRow = (
    weekId: string,
    date: string,
    field: 'morning_present' | 'afternoon_present',
    value: boolean
  ) => {
    setWeeks((prev) =>
      prev.map((week) => {
        if (week.id !== weekId) {
          return week;
        }
        return {
          ...week,
          rows: week.rows.map((row) =>
            row.date === date
              ? {
                  ...row,
                  [field]: value,
                }
              : row
          ),
        };
      })
    );
  };

  const editableRowsByWeek = (week: WeekBlock) => week.rows.filter((row) => !row.locked_reason);

  const submitWeek = async (week: WeekBlock) => {
    const rows = editableRowsByWeek(week);
    if (!rows.length) {
      toast.error('No editable attendance records found in this week.');
      return;
    }

    try {
      // Submit attendance records with timesheet submission in single transaction
      await submitMutation.mutateAsync({
        records: rows.map((row) => ({
          date: row.date,
          morning_present: row.morning_present,
          afternoon_present: row.afternoon_present,
          remarks: row.remarks,
        })),
        week_start_date: week.start,
        week_end_date: week.end,
      });
    } catch {
      // Error already handled by mutation
    }
  };

  const toggleWeekCollapse = (weekId: string) => {
    setWeeks((prev) =>
      prev.map((week) => (week.id === weekId ? { ...week, collapsed: !week.collapsed } : week))
    );
  };

  const removeWeek = (weekId: string) => {
    setWeeks((prev) => prev.filter((week) => week.id !== weekId));
    toast.success('Week removed successfully.');
  };

  const returnToDraft = async (week: WeekBlock) => {
    if (
      !confirm(
        'This will delete all attendance records and timesheet submission for this week. Are you sure?'
      )
    ) {
      return;
    }

    try {
      await returnToDraftMutation.mutateAsync({
        week_start_date: week.start,
        week_end_date: week.end,
      });

      // Remove week from view after successful return to draft
      removeWeek(week.id);
    } catch {
      // Error already handled by mutation
    }
  };

  const handleRequestLeave = (date: string) => {
    setSelectedDateForLeave(parseISO(date));
    setLeaveDialogOpen(true);
  };

  const handleLeaveSuccess = () => {
    // Reload weeks after leave request is successful
    toast.info('Please reload weeks to see updated leave information');
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto space-y-6 py-6">
        <PageHeader
          title="Submit New Attendance"
          actions={[
            {
              label: 'Back to Timesheet',
              variant: 'outline',
              icon: ArrowLeft,
              onClick: () => navigate(timesheetRoute),
            },
          ]}
        />

        <Card className="border-2 border-slate-200">
          <CardHeader className="bg-slate-50">
            <CardTitle className="text-lg font-semibold">Select Week to Add</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center">
            <div className="w-full md:max-w-xs">
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                maxDate={new Date()}
                minDate={new Date('2020-01-01')}
                placeholder="Select any day in week"
              />
            </div>
            <Button
              onClick={addWeek}
              disabled={addingWeek}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              {addingWeek ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
              )}
              Add Week
            </Button>
            <div className="text-muted-foreground rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm">
              <span className="font-medium text-blue-700">Default:</span>{' '}
              {defaultPresent ? '✓ Present' : '✗ Absent'}
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
              <span className="font-medium">Note:</span> Only dates up to today are shown
            </div>
          </CardContent>
        </Card>

        {weeks.map((week) => (
          <Card key={week.id} className="border-2">
            <CardHeader className="flex-row items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleWeekCollapse(week.id)}
                  className="p-2"
                >
                  {week.collapsed ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronUp className="h-5 w-5" />
                  )}
                </Button>
                <CardTitle className="text-base font-semibold">
                  Week: {format(parseISO(week.start), 'dd MMM yyyy')} -{' '}
                  {format(parseISO(week.end), 'dd MMM yyyy')}
                  <span className="ml-3 text-sm font-normal text-gray-600">
                    ({week.rows.length} days)
                  </span>
                  {week.submissionStatus && week.submissionStatusLabel && (
                    <TimesheetStatusBadge status={week.submissionStatus} className="ml-3" />
                  )}
                </CardTitle>
                {/* Show rejection reason prominently */}
                {week.submissionStatus === TimesheetStatus.REJECTED && week.reviewComments && (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="mb-1 flex items-center text-sm font-semibold text-red-800">
                      <XCircle className="mr-2 h-4 w-4" />
                      Rejection Reason:
                    </p>
                    <p className="text-sm text-red-700">{week.reviewComments}</p>
                    <p className="mt-2 text-xs text-red-600 italic">
                      Please review the reason, make necessary changes, and resubmit your timesheet.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeWeek(week.id)}
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {week.submissionStatus === TimesheetStatus.SUBMITTED && (
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => returnToDraft(week)}
                    className="border-orange-300 font-semibold text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Return to Draft
                  </Button>
                )}
                <Button
                  size="default"
                  onClick={() => submitWeek(week)}
                  disabled={
                    submitMutation.isPending ||
                    editableRowsByWeek(week).length === 0 ||
                    week.submissionStatus === TimesheetStatus.SUBMITTED ||
                    week.submissionStatus === TimesheetStatus.APPROVED
                  }
                  className={`px-6 font-semibold ${
                    week.submissionStatus === TimesheetStatus.SUBMITTED ||
                    week.submissionStatus === TimesheetStatus.APPROVED
                      ? 'cursor-not-allowed bg-gray-400'
                      : week.submissionStatus === TimesheetStatus.RETURNED
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : week.submissionStatus === TimesheetStatus.REJECTED
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : week.submissionStatus === TimesheetStatus.SUBMITTED ? (
                    'Already Submitted'
                  ) : week.submissionStatus === TimesheetStatus.APPROVED ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Approved
                    </>
                  ) : week.submissionStatus === TimesheetStatus.RETURNED ? (
                    'Resubmit Week'
                  ) : week.submissionStatus === TimesheetStatus.REJECTED ? (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Resubmit After Fix
                    </>
                  ) : (
                    'Submit Week'
                  )}
                </Button>
              </div>
            </CardHeader>
            {!week.collapsed && (
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-100">
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="text-center font-semibold">Attendance Status</TableHead>
                      <TableHead className="text-center font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {week.rows.map((row) => {
                      const rowBgClass = row.locked_reason ? 'bg-gray-50' : '';

                      return (
                        <TableRow key={row.date} className={rowBgClass}>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="text-base font-semibold">
                                {format(parseISO(row.date), 'EEE, dd MMM')}
                              </span>
                              {row.locked_reason === 'holiday' && row.holiday_description && (
                                <Badge
                                  variant="outline"
                                  className="w-fit border-purple-300 bg-purple-100 font-medium text-purple-700"
                                >
                                  <Calendar className="mr-1 h-3 w-3" />
                                  Organization Holiday: {row.holiday_description}
                                </Badge>
                              )}
                              {row.locked_reason === 'exception_holiday' &&
                                row.holiday_description && (
                                  <Badge
                                    variant="outline"
                                    className="w-fit border-orange-300 bg-orange-100 font-medium text-orange-700"
                                  >
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {row.holiday_description}
                                  </Badge>
                                )}
                              {row.locked_reason === 'exception_working' &&
                                row.exception_reason && (
                                  <Badge
                                    variant="outline"
                                    className="w-fit border-green-300 bg-green-100 font-medium text-green-700"
                                  >
                                    <Calendar className="mr-1 h-3 w-3" />
                                    Exceptional Working Day: {row.exception_reason}
                                  </Badge>
                                )}
                              {row.locked_reason === 'leave' && (
                                <Badge
                                  variant="outline"
                                  className="w-fit border-blue-300 bg-blue-100 font-medium text-blue-700"
                                >
                                  <FileText className="mr-1 h-3 w-3" />
                                  On Leave
                                </Badge>
                              )}
                              {row.locked_reason === 'non_working_day' && (
                                <Badge
                                  variant="outline"
                                  className="w-fit border-gray-300 bg-gray-100 font-medium text-gray-700"
                                >
                                  <Calendar className="mr-1 h-3 w-3" />
                                  Non-working Day
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <AttendanceIndicator
                              morningPresent={
                                row.locked_reason === 'leave' ? false : row.morning_present
                              }
                              afternoonPresent={
                                row.locked_reason === 'leave' ? false : row.afternoon_present
                              }
                              disabled={
                                // If status is SUBMITTED or APPROVED, lock everything
                                week.submissionStatus === TimesheetStatus.SUBMITTED ||
                                week.submissionStatus === TimesheetStatus.APPROVED
                                  ? true
                                  : // Otherwise (DRAFT, REJECTED, RETURNED), only lock holidays/leaves/non-working days
                                    !!row.locked_reason && row.locked_reason !== 'exception_working'
                              }
                              onMorningClick={() =>
                                updateRow(
                                  week.id,
                                  row.date,
                                  'morning_present',
                                  !row.morning_present
                                )
                              }
                              onAfternoonClick={() =>
                                updateRow(
                                  week.id,
                                  row.date,
                                  'afternoon_present',
                                  !row.afternoon_present
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            {row.locked_reason === 'leave' &&
                            row.leave_type_name &&
                            row.leave_status ? (
                              <div className="flex flex-col items-center gap-1">
                                <Badge
                                  variant="outline"
                                  className={`font-medium ${
                                    row.leave_status === 'approved'
                                      ? 'border-green-300 bg-green-100 text-green-700'
                                      : 'border-orange-300 bg-orange-100 text-orange-700'
                                  }`}
                                >
                                  {row.leave_type_name}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`text-xs font-medium ${
                                    row.leave_status === 'approved'
                                      ? 'border-green-200 bg-green-50 text-green-600'
                                      : 'border-orange-200 bg-orange-50 text-orange-600'
                                  }`}
                                >
                                  {row.leave_status.charAt(0).toUpperCase() +
                                    row.leave_status.slice(1)}
                                </Badge>
                              </div>
                            ) : row.locked_reason === 'exception_working' &&
                              row.exception_reason ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className="cursor-help border-green-300 bg-green-100 font-medium text-green-700"
                                  >
                                    <Calendar className="mr-1 h-3 w-3" />
                                    Exceptional Day
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-semibold">{row.exception_type}</p>
                                  <p>{row.exception_reason}</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : !row.locked_reason || row.locked_reason === 'exception_working' ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRequestLeave(row.date)}
                                    className="border-blue-400 bg-blue-50 font-medium text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                                  >
                                    <Calendar className="mr-1.5 h-4 w-4" />
                                    <span className="text-sm">Apply Leave</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Apply for leave on this date</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            )}
          </Card>
        ))}

        {/* Leave Request Dialog */}
        <LeaveRequestDialog
          open={leaveDialogOpen}
          onOpenChange={setLeaveDialogOpen}
          selectedDate={selectedDateForLeave}
          onSuccess={handleLeaveSuccess}
        />
      </div>
    </TooltipProvider>
  );
}
