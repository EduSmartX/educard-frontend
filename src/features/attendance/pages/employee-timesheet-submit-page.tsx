import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isAfter,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ArrowLeft, Calendar, Check, ChevronDown, ChevronUp, FileText, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ROUTES } from '@/constants/app-config';
import {
  bulkSubmitEmployeeAttendance,
  fetchOrganizationHolidays,
  getEmployeeAttendance,
} from '@/features/attendance/api/attendance-api';
import { fetchMyLeaveRequests } from '@/features/leave/api/leave-api';
import type { LeaveRequest } from '@/features/leave/types';
import { fetchCalendarExceptions } from '@/features/exceptional-work/api/calendar-exception-api';
import type { CalendarException }from '@/features/exceptional-work/types';
import { getCurrentWorkingDayPolicy } from '@/lib/api/working-day-policy-api';
import type { WorkingDayPolicy } from '@/lib/api/working-day-policy-api';
import { LeaveRequestDialog } from '@/features/attendance/components/leave-request-dialog';

type WeekRow = {
  date: string;
  morning_present: boolean;
  afternoon_present: boolean;
  remarks: string;
  locked_reason?: 'holiday' | 'leave' | 'non_working_day' | 'exception_holiday';
  holiday_description?: string;
  is_working_day: boolean;
};

// Improved attendance indicator with side-by-side morning and afternoon buttons
const AttendanceIndicator = ({ 
  morningPresent, 
  afternoonPresent, 
  disabled,
  onMorningClick,
  onAfternoonClick 
}: { 
  morningPresent: boolean; 
  afternoonPresent: boolean; 
  disabled?: boolean;
  onMorningClick?: () => void;
  onAfternoonClick?: () => void;
}) => {
  return (
    <div className="flex gap-2 justify-center">
      {/* Morning Session */}
      <Button
        variant={morningPresent ? "default" : "outline"}
        size="sm"
        className={`h-10 px-6 min-w-[120px] ${
          disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-200 border-gray-300' 
            : morningPresent 
              ? 'bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-sm' 
              : 'border-2 border-red-400 text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-500'
        }`}
        onClick={disabled ? undefined : onMorningClick}
        disabled={disabled}
      >
        <span className="text-sm font-semibold">Morning</span>
      </Button>
      
      {/* Afternoon Session */}
      <Button
        variant={afternoonPresent ? "default" : "outline"}
        size="sm"
        className={`h-10 px-6 min-w-[120px] ${
          disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-200 border-gray-300' 
            : afternoonPresent 
              ? 'bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-sm' 
              : 'border-2 border-red-400 text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-500'
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
};

export function EmployeeTimesheetSubmitPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [weeks, setWeeks] = useState<WeekBlock[]>([]);
  const [addingWeek, setAddingWeek] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [selectedDateForLeave, setSelectedDateForLeave] = useState<Date | null>(null);

  // Fetch current month attendance to get submission config
  const currentMonthStart = useMemo(() => startOfMonth(new Date()), []);
  const currentMonthEnd = useMemo(() => endOfMonth(new Date()), []);
  const fromDate = useMemo(() => format(currentMonthStart, 'yyyy-MM-dd'), [currentMonthStart]);
  const toDate = useMemo(() => format(currentMonthEnd, 'yyyy-MM-dd'), [currentMonthEnd]);

  const { data: attendanceData } = useQuery({
    queryKey: ['timesheet', 'attendance', fromDate, toDate],
    queryFn: async () => getEmployeeAttendance({ from_date: fromDate, to_date: toDate }),
  });

  const defaultPresent = attendanceData?.submission_config?.default_present ?? true;

  const submitMutation = useMutation({
    mutationFn: async (rows: WeekRow[]) => {
      return bulkSubmitEmployeeAttendance({
        attendance_records: rows.map((row) => ({
          date: row.date,
          morning_present: row.morning_present,
          afternoon_present: row.afternoon_present,
          remarks: row.remarks,
        })),
      });
    },
    onSuccess: () => {
      toast.success('Attendance submitted successfully.');
      queryClient.invalidateQueries({ queryKey: ['timesheet'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (error: unknown) => {
      const err = error as { 
        response?: { 
          data?: { 
            message?: string; 
            errors?: {
              attendance_records?: Array<{
                date?: string[];
                [key: string]: unknown;
              }>;
              [key: string]: unknown;
            }
          } 
        } 
      };
      
      // Check if there are specific validation errors
      const errors = err?.response?.data?.errors;
      if (errors?.attendance_records && Array.isArray(errors.attendance_records)) {
        // Extract date-specific errors
        const dateErrors: string[] = [];
        errors.attendance_records.forEach((recordError, index) => {
          if (recordError.date && Array.isArray(recordError.date)) {
            recordError.date.forEach((msg: string) => {
              dateErrors.push(`Record ${index + 1}: ${msg}`);
            });
          }
        });
        
        if (dateErrors.length > 0) {
          dateErrors.forEach(msg => toast.error(msg, { duration: 5000 }));
          return;
        }
      }
      
      // Fallback to general error message
      toast.error(err?.response?.data?.message || 'Failed to submit attendance.');
    },
  });

  const addWeek = async () => {
    if (!selectedDate) {
      toast.error('Please select a date to add its week.');
      return;
    }

    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekId = format(weekStart, 'yyyy-MM-dd');

    if (weeks.some((week) => week.id === weekId)) {
      toast.error('This week is already added.');
      return;
    }

    setAddingWeek(true);
    try {
      const fromDate = format(weekStart, 'yyyy-MM-dd');
      const toDate = format(weekEnd, 'yyyy-MM-dd');

      const [leaveResponse, holidayResponse, workingDayPolicy, calendarExceptions] = await Promise.all([
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
          page_size: 100 
        }).catch(() => ({ data: [] as CalendarException[] })),
      ]);

      const leaveByDate = new Set<string>();
      (leaveResponse?.data || []).forEach((leave: LeaveRequest) => {
        const start = parseISO(leave.start_date);
        const end = parseISO(leave.end_date);
        eachDayOfInterval({ start, end }).forEach((day) => {
          leaveByDate.add(format(day, 'yyyy-MM-dd'));
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
      const rows: WeekRow[] = eachDayOfInterval({ start: weekStart, end: weekEnd })
        .filter((day) => !isAfter(day, today) || isSameDay(day, today))
        .map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const holiday = holidayByDate.get(key);
          const isHoliday = !!holiday;
          const isLeave = leaveByDate.has(key);
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
            }
            // If FORCE_WORKING, don't lock it
          } else if (!workingDay) {
            lockedReason = 'non_working_day';
            description = 'Non-working day';
          }

          const isLocked = !!lockedReason;

          return {
            date: key,
            morning_present: isLocked ? false : defaultPresent,
            afternoon_present: isLocked ? false : defaultPresent,
            remarks: '',
            locked_reason: lockedReason,
            holiday_description: description,
            is_working_day: workingDay,
          };
        });

      setWeeks((prev) => [
        ...prev,
        {
          id: weekId,
          start: fromDate,
          end: toDate,
          rows,
          collapsed: false,
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
        if (week.id !== weekId) return week;
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

  const submitWeek = (week: WeekBlock) => {
    const rows = editableRowsByWeek(week);
    if (!rows.length) {
      toast.error('No editable attendance records found in this week.');
      return;
    }
    submitMutation.mutate(rows);
  };

  const toggleWeekCollapse = (weekId: string) => {
    setWeeks((prev) =>
      prev.map((week) =>
        week.id === weekId ? { ...week, collapsed: !week.collapsed } : week
      )
    );
  };

  const removeWeek = (weekId: string) => {
    setWeeks((prev) => prev.filter((week) => week.id !== weekId));
    toast.success('Week removed successfully.');
  };

  const submitAllWeeks = () => {
    const rowsMap = new Map<string, WeekRow>();
    weeks.forEach((week) => {
      editableRowsByWeek(week).forEach((row) => {
        rowsMap.set(row.date, row);
      });
    });

    const rows = Array.from(rowsMap.values());
    if (!rows.length) {
      toast.error('No editable attendance records found in selected weeks.');
      return;
    }

    submitMutation.mutate(rows);
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
      <div className="container mx-auto py-6 space-y-6">
        <PageHeader
          title="Submit New Attendance"
          actions={[
            {
              label: 'Back to Timesheet',
              variant: 'outline',
              icon: ArrowLeft,
              onClick: () => navigate(ROUTES.ATTENDANCE.TIMESHEET),
            },
          ]}
        />

      <Card className="border-2 border-slate-200">
        <CardHeader className="bg-slate-50">
          <CardTitle className="text-lg font-semibold">Select Week to Add</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center pt-6">
          <div className="w-full md:max-w-xs">
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              maxDate={new Date()}
              minDate={new Date('2020-01-01')}
              placeholder="Select any day in week"
            />
          </div>
          <Button onClick={addWeek} disabled={addingWeek} size="lg" className="bg-green-600 hover:bg-green-700">
            {addingWeek ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Add Week
          </Button>
          <div className="text-sm text-muted-foreground bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
            <span className="font-medium text-blue-700">Default:</span> {defaultPresent ? '✓ Present' : '✗ Absent'}
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
                Week: {format(parseISO(week.start), 'dd MMM yyyy')} - {format(parseISO(week.end), 'dd MMM yyyy')}
                <span className="ml-3 text-sm text-gray-600 font-normal">
                  ({week.rows.length} days)
                </span>
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeWeek(week.id)}
                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                size="default"
                onClick={() => submitWeek(week)}
                disabled={submitMutation.isPending || editableRowsByWeek(week).length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
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
                          <span className="font-semibold text-base">{format(parseISO(row.date), 'EEE, dd MMM')}</span>
                          {row.locked_reason === 'holiday' && row.holiday_description && (
                            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 font-medium w-fit">
                              <Calendar className="h-3 w-3 mr-1" />
                              Organization Holiday: {row.holiday_description}
                            </Badge>
                          )}
                          {row.locked_reason === 'exception_holiday' && row.holiday_description && (
                            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 font-medium w-fit">
                              <Calendar className="h-3 w-3 mr-1" />
                              {row.holiday_description}
                            </Badge>
                          )}
                          {row.locked_reason === 'leave' && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 font-medium w-fit">
                              <FileText className="h-3 w-3 mr-1" />
                              On Leave
                            </Badge>
                          )}
                          {row.locked_reason === 'non_working_day' && (
                            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 font-medium w-fit">
                              <Calendar className="h-3 w-3 mr-1" />
                              Non-working Day
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <AttendanceIndicator
                          morningPresent={row.morning_present}
                          afternoonPresent={row.afternoon_present}
                          disabled={!!row.locked_reason}
                          onMorningClick={() => updateRow(week.id, row.date, 'morning_present', !row.morning_present)}
                          onAfternoonClick={() => updateRow(week.id, row.date, 'afternoon_present', !row.afternoon_present)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        {!row.locked_reason ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRequestLeave(row.date)}
                                className="border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 font-medium"
                              >
                                <Calendar className="h-4 w-4 mr-1.5" />
                                <span className="text-sm">Apply Leave</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Apply for leave on this date</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
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

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            setSelectedDateForLeave(new Date());
            setLeaveDialogOpen(true);
          }}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Apply Leave
        </Button>
        <Button 
          onClick={submitAllWeeks} 
          disabled={submitMutation.isPending || weeks.length === 0}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8"
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting All Weeks...
            </>
          ) : (
            <>
              <Check className="mr-2 h-5 w-5" />
              Submit Selected Weeks
            </>
          )}
        </Button>
      </div>

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
