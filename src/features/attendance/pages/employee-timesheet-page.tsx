import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isBefore,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
} from 'date-fns';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PlusCircle,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ROUTES } from '@/constants/app-config';
import { useAuth } from '@/hooks/use-auth';
import { getEmployeeAttendance, fetchOrganizationHolidays } from '@/features/attendance/api/attendance-api';
import { EmployeeInfoCard } from '@/features/attendance/components/employee-info-card';
import { SingleDayAttendanceDialog } from '@/features/attendance/components/single-day-attendance-dialog';

type AttendanceRecord = {
  public_id: string;
  date: string;
  morning_present: boolean;
  afternoon_present: boolean;
  approval_status: string;
  is_leave?: boolean;
  leave_public_id?: string | null;
  leave_type_name?: string | null;
  leave_status?: string | null;
  is_exception?: boolean;
  exception_type?: string | null;
  exception_reason?: string | null;
};

type LeaveRecord = {
  start_date: string;
  end_date: string;
  leave_name: string;
  status: 'approved' | 'pending' | 'rejected' | 'cancelled';
};

type DayState = 'present' | 'absent' | 'leave-approved' | 'leave-pending' | 'holiday' | 'none';

function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function getDayState(
  date: Date,
  attendanceByDate: Map<string, AttendanceRecord>,
  leaveByDate: Map<string, { status: LeaveRecord['status']; leave_name: string }>,
  holidaySet: Set<string>,
  workingDayPolicy: { sunday_off: boolean; saturday_off_pattern: string } | null,
  exceptions: Map<string, { type: string; reason: string }>
): DayState {
  const key = toDateKey(date);
  const leaveInfo = leaveByDate.get(key);
  const exception = exceptions.get(key);

  // Check for force working day exception (overrides holiday/weekend)
  if (exception?.type === 'FORCE_WORKING') {
    const attendance = attendanceByDate.get(key);
    if (attendance) {
      return attendance.morning_present && attendance.afternoon_present ? 'present' : 'absent';
    }
    if (isBefore(date, new Date()) && !isSameDay(date, new Date())) {
      return 'absent';
    }
    return 'none';
  }

  // Check for force holiday exception
  if (exception?.type === 'FORCE_HOLIDAY') {
    return 'holiday';
  }

  // Check official holidays
  if (holidaySet.has(key)) {
    return 'holiday';
  }

  // Check if it's a weekend based on working day policy
  if (workingDayPolicy) {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    // Check Sunday
    if (dayOfWeek === 0 && workingDayPolicy.sunday_off) {
      return 'holiday';
    }

    // Check Saturday based on pattern
    if (dayOfWeek === 6) {
      const { saturday_off_pattern } = workingDayPolicy;
      if (saturday_off_pattern === 'ALL') {
        return 'holiday';
      } else if (saturday_off_pattern === 'SECOND_ONLY' || saturday_off_pattern === 'SECOND_AND_FOURTH') {
        const weekOfMonth = Math.ceil(date.getDate() / 7);
        if (saturday_off_pattern === 'SECOND_ONLY' && weekOfMonth === 2) {
          return 'holiday';
        } else if (saturday_off_pattern === 'SECOND_AND_FOURTH' && (weekOfMonth === 2 || weekOfMonth === 4)) {
          return 'holiday';
        }
      }
    }
  }

  if (leaveInfo?.status === 'approved') {
    return 'leave-approved';
  }
  if (leaveInfo?.status === 'pending') {
    return 'leave-pending';
  }

  const attendance = attendanceByDate.get(key);
  if (attendance) {
    return attendance.morning_present && attendance.afternoon_present ? 'present' : 'absent';
  }

  if (isBefore(date, new Date()) && !isSameDay(date, new Date())) {
    return 'absent';
  }

  return 'none';
}

function stateStyles(state: DayState) {
  switch (state) {
    case 'present':
      return 'bg-green-50 border-green-200 text-green-800';
    case 'absent':
      return 'bg-red-50 border-red-200 text-red-800';
    case 'leave-approved':
      return 'bg-orange-50 border-orange-200 text-orange-800';
    case 'leave-pending':
      return 'bg-orange-50 border-orange-200 text-orange-800';
    case 'holiday':
      return 'bg-purple-50 border-purple-200 text-purple-800';
    default:
      return 'bg-white border-gray-200 text-gray-700';
  }
}

export function EmployeeTimesheetPage() {
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);
  
  // Calculate date range to include full weeks (Sunday to Saturday)
  const calendarStart = useMemo(() => startOfWeek(monthStart, { weekStartsOn: 0 }), [monthStart]);
  const calendarEnd = useMemo(() => endOfWeek(monthEnd, { weekStartsOn: 0 }), [monthEnd]);
  
  const fromDate = useMemo(() => format(calendarStart, 'yyyy-MM-dd'), [calendarStart]);
  const toDate = useMemo(() => format(calendarEnd, 'yyyy-MM-dd'), [calendarEnd]);

  const { data: attendanceData, isLoading: loadingAttendance } = useQuery({
    queryKey: ['timesheet', 'attendance', fromDate, toDate],
    queryFn: () => getEmployeeAttendance({ from_date: fromDate, to_date: toDate }),
  });

  const { data: holidaysData, isLoading: loadingHolidays } = useQuery({
    queryKey: ['timesheet', 'holidays', fromDate, toDate],
    queryFn: async () => {
      const response = await fetchOrganizationHolidays({
        from_date: fromDate,
        to_date: toDate,
      });

      return response?.holidays || [];
    },
  });

  const attendanceByDate = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    (attendanceData?.records || []).forEach((record: AttendanceRecord) => {
      map.set(record.date, record);
    });
    return map;
  }, [attendanceData]);

  const leaveByDate = useMemo(() => {
    const map = new Map<string, { status: 'approved' | 'pending' | 'rejected' | 'cancelled'; leave_name: string }>();

    // Use leave data from attendance records
    (attendanceData?.records || []).forEach((record: AttendanceRecord) => {
      if (record.is_leave && record.leave_type_name) {
        const status = (record.leave_status || 'approved') as 'approved' | 'pending' | 'rejected' | 'cancelled';
        map.set(record.date, { 
          status, 
          leave_name: record.leave_type_name 
        });
      }
    });

    return map;
  }, [attendanceData]);

  const holidaySet = useMemo(() => {
    const set = new Set<string>();
    (holidaysData || []).forEach((holiday: { start_date: string; end_date: string }) => {
      const start = parseISO(holiday.start_date);
      const end = parseISO(holiday.end_date);
      eachDayOfInterval({ start, end }).forEach((date: Date) => {
        set.add(toDateKey(date));
      });
    });
    return set;
  }, [holidaysData]);

  const exceptionsMap = useMemo(() => {
    const map = new Map<string, { type: string; reason: string }>();
    (attendanceData?.calendar_exceptions || []).forEach((exception: { date: string; type: string; reason: string }) => {
      map.set(exception.date, { type: exception.type, reason: exception.reason });
    });
    return map;
  }, [attendanceData]);

  const monthDays = useMemo(() => eachDayOfInterval({ start: monthStart, end: monthEnd }), [monthStart, monthEnd]);
  const leadingEmptyDays = useMemo(() => Array.from({ length: monthStart.getDay() }), [monthStart]);

  // Use stats from backend
  const report = useMemo(() => {
    const stats = attendanceData?.stats || {};
    return {
      submitted: attendanceData?.records?.length || 0,
      present: stats.total_present || 0,
      absent: stats.total_absent || 0,
      halfDays: stats.total_half_days || 0,
      leave: stats.total_leaves || 0,
      holiday: stats.total_holidays || 0,
      totalWorkingDays: stats.total_working_days || 0,
    };
  }, [attendanceData]);

  const loading = loadingAttendance || loadingHolidays;

  const handleDateClick = (date: Date, state: DayState) => {
    const dateKey = toDateKey(date);
    const attendanceRecord = attendanceByDate.get(dateKey);
    
    // Check if attendance is already submitted or approved - don't allow editing
    if (attendanceRecord) {
      const status = attendanceRecord.approval_status?.toLowerCase();
      
      if (status === 'approved') {
        toast.info('Cannot Edit Approved Attendance', {
          description: 'This date has already been approved and cannot be modified.',
        });
        return;
      }
      
      if (status === 'submitted' || status === 'pending') {
        toast.info('Cannot Edit Submitted Attendance', {
          description: 'This date has been submitted for approval. Wait for approval or return to draft.',
        });
        return;
      }
    }
    
    // Only allow clicking on past dates and non-holiday dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0);
    
    // Don't allow clicking future dates or holidays/weekends
    if (clickedDate > today || state === 'holiday') {
      return;
    }
    
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Timesheet"
        description="Submit your monthly employee attendance with leave and calendar context"
      />

      <Card className="shadow-sm border border-[#bfd591]" style={{ backgroundColor: '#C5D89D' }}>
        <CardContent className="pt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <EmployeeInfoCard
            user={user || {}}
            organization={organization || undefined}
            organizationRole={user?.role}
            employeeId={attendanceData?.employee_id || undefined}
            showProfileImage={true}
          />

          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <CalendarDays className="h-6 w-6 text-blue-600" />
                  Monthly Report
                </CardTitle>
                <Badge variant="outline" className="text-sm">
                  {format(currentDate, 'MMMM yyyy')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Attendance Summary</div>
                <div className="text-base font-semibold mb-2">
                  {report.totalWorkingDays > 0 
                    ? `${Math.round((report.present / report.totalWorkingDays) * 100)}% present`
                    : '0% present'
                  }
                </div>
                <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
                  {report.present > 0 && (
                    <div 
                      className="bg-green-500" 
                      style={{ width: `${(report.present / report.totalWorkingDays) * 100}%` }}
                    />
                  )}
                  {report.absent > 0 && (
                    <div 
                      className="bg-red-500" 
                      style={{ width: `${(report.absent / report.totalWorkingDays) * 100}%` }}
                    />
                  )}
                  {report.leave > 0 && (
                    <div 
                      className="bg-orange-500" 
                      style={{ width: `${(report.leave / report.totalWorkingDays) * 100}%` }}
                    />
                  )}
                  {report.holiday > 0 && (
                    <div 
                      className="bg-purple-500" 
                      style={{ width: `${(report.holiday / report.totalWorkingDays) * 100}%` }}
                    />
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-green-500"></span>
                    Present {report.present}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-red-500"></span>
                    Absent {report.absent}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-orange-500"></span>
                    Leave {report.leave}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-purple-500"></span>
                    Holiday {report.holiday}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar Section - Takes 2/3 width */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentDate((d) => subMonths(d, 1))}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <div className="font-semibold text-base">{format(currentDate, 'MMMM yyyy')}</div>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate((d) => addMonths(d, 1))}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
              </div>
              <Button size="sm" onClick={() => navigate(ROUTES.ATTENDANCE.TIMESHEET_SUBMIT)}>
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Submit
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            {loading ? (
            <div className="py-10 flex items-center justify-center text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading timesheet...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-semibold text-gray-500">
                <div>S</div>
                <div>M</div>
                <div>T</div>
                <div>W</div>
                <div>T</div>
                <div>F</div>
                <div>S</div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {leadingEmptyDays.map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square rounded border border-transparent" />
                ))}

                {monthDays.map((date) => {
                  const dateKey = toDateKey(date);
                  const state = getDayState(
                    date, 
                    attendanceByDate, 
                    leaveByDate, 
                    holidaySet, 
                    attendanceData?.working_day_policy || null,
                    exceptionsMap
                  );
                  const leaveInfo = leaveByDate.get(dateKey);
                  const holidayInfo = attendanceData?.holiday_descriptions?.[dateKey];

                  const renderIcon = () => {
                    const dateKey = toDateKey(date);
                    const record = attendanceByDate.get(dateKey);
                    
                    // Check if we have an attendance record with half-day data
                    if (record && (record.morning_present !== undefined && record.afternoon_present !== undefined)) {
                      const morningPresent = record.morning_present;
                      const afternoonPresent = record.afternoon_present;
                      
                      // Full day present
                      if (morningPresent && afternoonPresent) {
                        return (
                          <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white stroke-[2.5]" />
                          </div>
                        );
                      }
                      
                      // Full day absent
                      if (!morningPresent && !afternoonPresent) {
                        return (
                          <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                            <X className="h-3 w-3 text-white stroke-[2.5]" />
                          </div>
                        );
                      }
                      
                      // Half day - split circle (2 parts: top and bottom)
                      return (
                        <div className="relative h-6 w-6">
                          <svg viewBox="0 0 24 24" className="w-full h-full" style={{ transform: 'rotate(0deg)' }}>
                            {/* Bottom half (afternoon) - draw first so it's behind */}
                            <path
                              d="M 2 12 A 10 10 0 0 0 22 12 Z"
                              fill={afternoonPresent ? '#22c55e' : '#ef4444'}
                              stroke="white"
                              strokeWidth="0.5"
                            />
                            {/* Top half (morning) */}
                            <path
                              d="M 2 12 A 10 10 0 0 1 22 12 Z"
                              fill={morningPresent ? '#22c55e' : '#ef4444'}
                              stroke="white"
                              strokeWidth="0.5"
                            />
                          </svg>
                        </div>
                      );
                    }
                    
                    // Fallback to state-based rendering for non-attendance days
                    if (state === 'present') {
                      return (
                        <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white stroke-[2.5]" />
                        </div>
                      );
                    }
                    if (state === 'absent') {
                      return (
                        <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                          <X className="h-3 w-3 text-white stroke-[2.5]" />
                        </div>
                      );
                    }
                    if (state === 'holiday') {
                      // Create a short label for display
                      let shortLabel = 'Holiday';
                      if (holidayInfo) {
                        if (holidayInfo.type === 'weekend') {
                          shortLabel = 'Weekend';
                        } else if (holidayInfo.type === 'official_holiday') {
                          // Use the holiday name, truncated if needed
                          shortLabel = holidayInfo.name.length > 12 
                            ? `${holidayInfo.name.substring(0, 10)}..` 
                            : holidayInfo.name;
                        } else if (holidayInfo.type === 'force_holiday') {
                          shortLabel = 'Special';
                        }
                      }
                      
                      return (
                        <div className="flex flex-col items-center gap-0.5 w-full">
                          <div className="h-5 w-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                            H
                          </div>
                          <span className="text-[7px] text-purple-700 font-semibold text-center leading-tight w-full px-0.5 break-words">
                            {shortLabel}
                          </span>
                        </div>
                      );
                    }
                    if (state === 'leave-approved' || state === 'leave-pending') {
                      return (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center">
                            <X className="h-3 w-3 text-white stroke-[2.5]" />
                          </div>
                          {leaveInfo?.leave_name && (
                            <span className="text-[8px] text-orange-700 font-medium text-center leading-tight">
                              {leaveInfo.leave_name}
                            </span>
                          )}
                        </div>
                      );
                    }
                    return null;
                  };

                  const attendanceRecord = attendanceByDate.get(dateKey);
                  const approvalStatus = attendanceRecord?.approval_status?.toLowerCase();
                  const isSubmittedOrApproved = approvalStatus === 'approved' || 
                                                approvalStatus === 'submitted' || 
                                                approvalStatus === 'pending';

                  const isClickable = (() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const checkDate = new Date(date);
                    checkDate.setHours(0, 0, 0, 0);
                    // Don't allow clicking if: future date, holiday, or already submitted/approved
                    return checkDate <= today && state !== 'holiday' && !isSubmittedOrApproved;
                  })();

                  const dayContent = (
                    <button
                      type="button"
                      key={dateKey}
                      onClick={() => isClickable && handleDateClick(date, state)}
                      disabled={!isClickable}
                      className={`aspect-square rounded border p-1 flex flex-col items-center justify-between transition ${stateStyles(state)} ${
                        isClickable ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 hover:border-blue-400' : 'cursor-default'
                      }`}
                    >
                      <div className="text-center w-full">
                        <div className="text-[7px] font-medium text-gray-500">
                          {format(date, 'MMM')}
                        </div>
                        <div className="text-xs font-bold">
                          {format(date, 'd')}
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center w-full flex-1">
                        {renderIcon()}
                      </div>
                    </button>
                  );

                  // Wrap holiday days with tooltip
                  if (state === 'holiday' && holidayInfo) {
                    return (
                      <TooltipProvider key={dateKey}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {dayContent}
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <p className="font-semibold">{holidayInfo.name}</p>
                              <p className="text-xs text-gray-600">{holidayInfo.description}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  }

                  return dayContent;
                })}
              </div>
            </>
          )}
          </CardContent>
        </Card>

        {/* Insights Panel - Takes 1/3 width */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Attendance Rate</span>
                  <span className="font-bold text-green-700">
                    {report.totalWorkingDays > 0 
                      ? `${Math.round((report.present / report.totalWorkingDays) * 100)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${report.totalWorkingDays > 0 ? (report.present / report.totalWorkingDays) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                    <span className="text-[10px] text-green-700 font-medium">Present</span>
                  </div>
                  <div className="text-xl font-bold text-green-900">{report.present}</div>
                </div>

                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                      <X className="h-2.5 w-2.5 text-white" />
                    </div>
                    <span className="text-[10px] text-red-700 font-medium">Absent</span>
                  </div>
                  <div className="text-xl font-bold text-red-900">{report.absent}</div>
                </div>

                {report.halfDays > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="relative h-4 w-4">
                        <svg viewBox="0 0 16 16" className="w-full h-full">
                          {/* Top half - green */}
                          <path d="M 0 8 A 8 8 0 0 1 16 8 Z" fill="#22c55e" stroke="white" strokeWidth="0.5" />
                          {/* Bottom half - red */}
                          <path d="M 0 8 A 8 8 0 0 0 16 8 Z" fill="#ef4444" stroke="white" strokeWidth="0.5" />
                        </svg>
                      </div>
                      <span className="text-[10px] text-yellow-700 font-medium">Half Days</span>
                    </div>
                    <div className="text-xl font-bold text-yellow-900">{report.halfDays}</div>
                  </div>
                )}

                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-4 w-4 rounded-full bg-orange-500 flex items-center justify-center">
                      <X className="h-2.5 w-2.5 text-white" />
                    </div>
                    <span className="text-[10px] text-orange-700 font-medium">Leaves</span>
                  </div>
                  <div className="text-xl font-bold text-orange-900">{report.leave}</div>
                </div>

                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-4 w-4 rounded-full bg-purple-500 flex items-center justify-center">
                      <X className="h-2.5 w-2.5 text-white" />
                    </div>
                    <span className="text-[10px] text-purple-700 font-medium">Holidays</span>
                  </div>
                  <div className="text-xl font-bold text-purple-900">{report.holiday}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
                <span className="text-gray-700">Present</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                  <X className="h-2.5 w-2.5 text-white" />
                </div>
                <span className="text-gray-700">Absent</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="h-4 w-4 rounded-full bg-orange-500 flex items-center justify-center">
                  <X className="h-2.5 w-2.5 text-white" />
                </div>
                <span className="text-gray-700">Leave (Approved)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="h-4 w-4 rounded-full bg-orange-500 flex items-center justify-center">
                  <X className="h-2.5 w-2.5 text-white" />
                </div>
                <span className="text-gray-700">Leave (Pending)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-4 h-4 rounded bg-purple-100 border border-purple-300"></div>
                <span className="text-gray-700">Holiday</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Single Day Attendance Dialog */}
      {selectedDate && (
        <SingleDayAttendanceDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          date={selectedDate}
        />
      )}
    </div>
  );
}
