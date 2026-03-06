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
  subMonths,
} from 'date-fns';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PlusCircle,
  UserCircle2,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/constants/app-config';
import { useAuth } from '@/hooks/use-auth';
import { getEmployeeAttendance } from '@/features/attendance/api/attendance-api';
import { calculateWorkingDays, fetchMyLeaveRequests } from '@/features/leave/api/leave-api';

type AttendanceRecord = {
  public_id: string;
  date: string;
  morning_present: boolean;
  afternoon_present: boolean;
  approval_status: string;
};

type LeaveRecord = {
  start_date: string;
  end_date: string;
  status: 'approved' | 'pending' | 'rejected' | 'cancelled';
};

type DayState = 'present' | 'absent' | 'leave-approved' | 'leave-pending' | 'holiday' | 'none';

function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function getDayState(
  date: Date,
  attendanceByDate: Map<string, AttendanceRecord>,
  leaveByDate: Map<string, LeaveRecord['status']>,
  holidaySet: Set<string>
): DayState {
  const key = toDateKey(date);
  const leaveStatus = leaveByDate.get(key);

  if (holidaySet.has(key)) return 'holiday';
  if (leaveStatus === 'approved') return 'leave-approved';
  if (leaveStatus === 'pending') return 'leave-pending';

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
      return 'bg-rose-50 border-rose-200 text-rose-800';
    case 'leave-pending':
      return 'bg-orange-50 border-orange-200 text-orange-800';
    case 'holiday':
      return 'bg-amber-50 border-amber-200 text-amber-800';
    default:
      return 'bg-white border-gray-200 text-gray-700';
  }
}

export function EmployeeTimesheetPage() {
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);
  const fromDate = useMemo(() => format(monthStart, 'yyyy-MM-dd'), [monthStart]);
  const toDate = useMemo(() => format(monthEnd, 'yyyy-MM-dd'), [monthEnd]);

  const { data: attendanceData, isLoading: loadingAttendance } = useQuery({
    queryKey: ['timesheet', 'attendance', fromDate, toDate],
    queryFn: async () => getEmployeeAttendance({ from_date: fromDate, to_date: toDate }),
  });

  const { data: leavesData, isLoading: loadingLeaves } = useQuery({
    queryKey: ['timesheet', 'leaves', fromDate, toDate],
    queryFn: async () => {
      const response = await fetchMyLeaveRequests({
        start_date__lte: toDate,
        end_date__gte: fromDate,
        status__in: 'approved,pending',
        page_size: 200,
      } as never);

      return (response.data || []) as LeaveRecord[];
    },
  });

  const { data: holidaysData, isLoading: loadingHolidays } = useQuery({
    queryKey: ['timesheet', 'holidays', fromDate, toDate],
    queryFn: async () => {
      const response = await calculateWorkingDays({
        start_date: fromDate,
        end_date: toDate,
      });

      return response?.data?.holidays || [];
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
    const map = new Map<string, LeaveRecord['status']>();

    (leavesData || []).forEach((leave: LeaveRecord) => {
      const start = parseISO(leave.start_date);
      const end = parseISO(leave.end_date);
      eachDayOfInterval({ start, end }).forEach((date: Date) => {
        const key = toDateKey(date);
        if (!map.has(key) || leave.status === 'approved') {
          map.set(key, leave.status);
        }
      });
    });

    return map;
  }, [leavesData]);

  const holidaySet = useMemo(() => {
    const set = new Set<string>();
    (holidaysData || []).forEach((holiday: { date: string }) => {
      set.add(holiday.date);
    });
    return set;
  }, [holidaysData]);

  const monthDays = useMemo(() => eachDayOfInterval({ start: monthStart, end: monthEnd }), [monthStart, monthEnd]);
  const leadingEmptyDays = useMemo(() => Array.from({ length: monthStart.getDay() }), [monthStart]);

  const report = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let holiday = 0;

    monthDays.forEach((date: Date) => {
      const state = getDayState(date, attendanceByDate, leaveByDate, holidaySet);
      if (state === 'present') present += 1;
      if (state === 'absent') absent += 1;
      if (state === 'leave-approved' || state === 'leave-pending') leave += 1;
      if (state === 'holiday') holiday += 1;
    });

    return {
      submitted: attendanceData?.records?.length || 0,
      present,
      absent,
      leave,
      holiday,
    };
  }, [monthDays, attendanceByDate, leaveByDate, holidaySet, attendanceData]);

  const loading = loadingAttendance || loadingLeaves || loadingHolidays;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Timesheet"
        description="Submit your monthly employee attendance with leave and calendar context"
      />

      <Card className="shadow-sm border border-[#bfd591]" style={{ backgroundColor: '#C5D89D' }}>
        <CardContent className="pt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-0 bg-white/85 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCircle2 className="h-5 w-5 text-emerald-700" />
                Employee Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-gray-700">
              <p>
                <span className="font-semibold">Name:</span> {user?.full_name || user?.username || '-'}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {user?.email || '-'}
              </p>
              <p>
                <span className="font-semibold">Role:</span> {user?.role || '-'}
              </p>
              <p>
                <span className="font-semibold">Organization:</span> {organization?.name || '-'}
              </p>
            </CardContent>
          </Card>

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
                  {monthDays.length > 0 
                    ? `${Math.round((report.present / monthDays.length) * 100)}% present`
                    : '0% present'
                  }
                </div>
                <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
                  {report.present > 0 && (
                    <div 
                      className="bg-green-500" 
                      style={{ width: `${(report.present / monthDays.length) * 100}%` }}
                    />
                  )}
                  {report.absent > 0 && (
                    <div 
                      className="bg-red-500" 
                      style={{ width: `${(report.absent / monthDays.length) * 100}%` }}
                    />
                  )}
                  {report.leave > 0 && (
                    <div 
                      className="bg-blue-500" 
                      style={{ width: `${(report.leave / monthDays.length) * 100}%` }}
                    />
                  )}
                  {report.holiday > 0 && (
                    <div 
                      className="bg-purple-500" 
                      style={{ width: `${(report.holiday / monthDays.length) * 100}%` }}
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
                    <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
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
                  const state = getDayState(date, attendanceByDate, leaveByDate, holidaySet);

                  const renderIcon = () => {
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
                    if (state === 'leave-approved') {
                      return (
                        <div className="h-5 w-5 rounded-full bg-rose-500 flex items-center justify-center">
                          <X className="h-3 w-3 text-white stroke-[2.5]" />
                        </div>
                      );
                    }
                    if (state === 'leave-pending') {
                      return (
                        <div className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center">
                          <X className="h-3 w-3 text-white stroke-[2.5]" />
                        </div>
                      );
                    }
                    return null;
                  };

                  return (
                    <div
                      key={dateKey}
                      className={`aspect-square rounded border p-1 flex flex-col items-center justify-between transition ${stateStyles(state)}`}
                    >
                      <div className="text-center w-full">
                        <div className="text-[7px] font-medium text-gray-500">
                          {format(date, 'MMM')}
                        </div>
                        <div className="text-xs font-bold">
                          {format(date, 'd')}
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        {renderIcon()}
                      </div>
                    </div>
                  );
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
                    {monthDays.length > 0 
                      ? `${Math.round((report.present / monthDays.length) * 100)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${monthDays.length > 0 ? (report.present / monthDays.length) * 100 : 0}%` }}
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

                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <X className="h-2.5 w-2.5 text-white" />
                    </div>
                    <span className="text-[10px] text-blue-700 font-medium">Leaves</span>
                  </div>
                  <div className="text-xl font-bold text-blue-900">{report.leave}</div>
                </div>

                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <span className="text-[10px] text-amber-700 font-medium block mb-1">Holidays</span>
                  <div className="text-xl font-bold text-amber-900">{report.holiday}</div>
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
                <div className="h-4 w-4 rounded-full bg-rose-500 flex items-center justify-center">
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
                <div className="w-4 h-4 rounded bg-amber-100 border border-amber-300"></div>
                <span className="text-gray-700">Holiday</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
