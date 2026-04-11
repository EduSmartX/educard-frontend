/**
 * Employee Dashboard Page
 *
 * Real-time dashboard for teachers/staff with:
 * - Today's classes from timetable API
 * - Leave balance from leave API
 * - Pending timesheet submissions
 * - Current month attendance distribution
 * - Color-coded cards
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, AlertCircle, TrendingUp, FileText, CalendarDays } from 'lucide-react';
import { useMyTimetable } from '@/features/timetable/hooks/queries';
import { useMyLeaveBalancesSummary } from '@/features/leave/hooks/use-leave-balances';
import { useTimesheetSubmissions } from '@/features/attendance/hooks';
import { useEmployeeAttendance } from '@/features/attendance/hooks/queries/use-employee-attendance';
import { useAuth } from '@/hooks/use-auth';
import { DAY_LABELS, type TimetableEntry } from '@/features/timetable/types';

export default function EmployeeDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: timetableData, isLoading: loadingTimetable } = useMyTimetable();
  const { data: leaveData, isLoading: loadingLeave } = useMyLeaveBalancesSummary();
  const { data: timesheetData, isLoading: loadingTimesheet } = useTimesheetSubmissions({
    status: 'DRAFT,RETURNED',
  });

  // Get current month date range
  const currentMonthRange = useMemo(() => {
    const now = new Date();
    return {
      from_date: format(startOfMonth(now), 'yyyy-MM-dd'),
      to_date: format(endOfMonth(now), 'yyyy-MM-dd'),
    };
  }, []);

  // Fetch current month attendance
  const { data: attendanceData, isLoading: loadingAttendance } = useEmployeeAttendance(
    currentMonthRange,
    true
  );

  // Get today's day number (0=Mon, 6=Sun)
  const todayDayNum = useMemo(() => {
    const jsDay = new Date().getDay(); // 0=Sun, 6=Sat
    return jsDay === 0 ? 6 : jsDay - 1; // Convert to 0=Mon, 6=Sun
  }, []);

  // Calculate today's classes from timetable
  const todayClasses = useMemo((): TimetableEntry[] => {
    if (!timetableData?.days) {
      return [];
    }
    const entries =
      timetableData.days[todayDayNum] || timetableData.days[String(todayDayNum)] || [];
    return [...entries].sort((a, b) => {
      const timeA = a.start_time || '';
      const timeB = b.start_time || '';
      return timeA.localeCompare(timeB);
    });
  }, [timetableData, todayDayNum]);

  // Calculate next class
  const nextClass = useMemo((): TimetableEntry | undefined => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    return todayClasses.find((entry) => {
      const [hours, minutes] = (entry.start_time || '00:00').split(':').map(Number);
      const classTime = hours * 60 + minutes;
      return classTime > currentTime;
    });
  }, [todayClasses]);

  // Total leave balance
  const totalLeaveBalance = useMemo(() => {
    if (!leaveData?.data) {
      return 0;
    }
    return leaveData.data.reduce((sum, balance) => sum + (balance.available || 0), 0);
  }, [leaveData]);

  // Pending timesheets count
  const pendingTimesheets = useMemo(() => {
    return timesheetData?.results?.length || 0;
  }, [timesheetData]);

  // Format time helper
  const formatTime = (timeStr: string): string => {
    if (!timeStr) {
      return '';
    }
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Attendance stats for current month
  const attendanceStats = useMemo(() => {
    const stats = attendanceData?.stats || {};
    const present = stats.total_present || 0;
    const absent = stats.total_absent || 0;
    const leaves = stats.total_leaves || 0;
    const holidays = stats.total_holidays || 0;
    const total = present + absent + leaves + holidays;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, leaves, holidays, total, percentage };
  }, [attendanceData]);

  return (
    <div className="container mx-auto space-y-4 px-2 py-3 sm:space-y-6 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">Employee Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Welcome back, {user?.full_name || 'Teacher'}! Here's what's happening today.
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left Column - Stats, Schedule, Timesheets, Quick Actions */}
        <div className="space-y-4 lg:col-span-2">
          {/* Vertical Stats Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* My Classes Today - Blue */}
            <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">
                  My Classes Today
                </CardTitle>
                <Calendar className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                {loadingTimetable ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-blue-700">{todayClasses.length}</div>
                    {nextClass ? (
                      <p className="text-muted-foreground mt-1 text-xs">
                        Next: {formatTime(nextClass.start_time)} - {nextClass.subject_name}
                      </p>
                    ) : todayClasses.length > 0 ? (
                      <p className="text-muted-foreground mt-1 text-xs">All classes completed</p>
                    ) : (
                      <p className="text-muted-foreground mt-1 text-xs">No classes scheduled</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Leave Balance - Green */}
            <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-900">Leave Balance</CardTitle>
                <CalendarDays className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                {loadingLeave ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-green-700">{totalLeaveBalance}</div>
                    <p className="text-muted-foreground mt-1 text-xs">Days remaining this year</p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Pending Tasks - Orange */}
            <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-white transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-900">Pending Tasks</CardTitle>
                <Clock className="h-5 w-5 text-orange-600" />
              </CardHeader>
              <CardContent>
                {loadingTimesheet ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-orange-700">{pendingTimesheets}</div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {pendingTimesheets > 0 ? 'Timesheet submission due' : 'All caught up! ✓'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Today's Schedule */}
          <Card className="border-t-4 border-t-cyan-500 transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-900">
                <Calendar className="h-5 w-5" />
                Today's Schedule — {DAY_LABELS[todayDayNum]}
              </CardTitle>
              <CardDescription>
                {loadingTimetable
                  ? 'Loading...'
                  : todayClasses.length > 0
                    ? `${todayClasses.length} class${todayClasses.length > 1 ? 'es' : ''} scheduled`
                    : 'No classes scheduled for today'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTimetable ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : todayClasses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="mb-2 h-12 w-12 text-gray-300" />
                  <p className="text-sm text-gray-500">No classes scheduled for today</p>
                </div>
              ) : (
                <div className="max-h-72 space-y-3 overflow-y-auto pr-2">
                  {todayClasses.map((entry, idx) => {
                    const isNext = nextClass?.public_id === entry.public_id;
                    const [hours] = (entry.start_time || '00:00').split(':').map(Number);
                    const period = hours >= 12 ? 'PM' : 'AM';
                    const displayHours = hours % 12 || 12;

                    return (
                      <div
                        key={entry.public_id || idx}
                        className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                          isNext
                            ? 'border-cyan-300 bg-cyan-50'
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div
                          className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg text-white ${
                            isNext ? 'bg-cyan-600' : 'bg-gray-600'
                          }`}
                        >
                          <span className="text-xs font-medium">
                            {displayHours}:{(entry.start_time || '00:00').split(':')[1]}
                          </span>
                          <span className="text-[10px]">{period}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {entry.subject_name || entry.slot_label}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {entry.class_name}
                            {entry.room && ` • Room ${entry.room}`}
                          </p>
                          {isNext && (
                            <Badge
                              variant="secondary"
                              className="mt-1 bg-cyan-100 text-xs text-cyan-700"
                            >
                              Next Class
                            </Badge>
                          )}
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Timesheets Section */}
          {pendingTimesheets > 0 && (
            <Card className="border-t-4 border-t-amber-500 transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <FileText className="h-5 w-5" />
                  Pending Timesheet Submissions
                </CardTitle>
                <CardDescription>
                  {pendingTimesheets} timesheet{pendingTimesheets > 1 ? 's' : ''} waiting for
                  submission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-48 space-y-3 overflow-y-auto pr-2">
                  {timesheetData?.results?.map((submission) => (
                    <div
                      key={submission.public_id}
                      className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3"
                    >
                      <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Week: {new Date(submission.week_start_date).toLocaleDateString()} –{' '}
                          {new Date(submission.week_end_date).toLocaleDateString()}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Status:{' '}
                          {submission.submission_status === 'DRAFT' ? 'Not submitted' : 'Returned'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => navigate('/employee/attendance/timesheet')}
                      >
                        Submit
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="border-l-4 border-l-indigo-400 bg-gradient-to-br from-indigo-50 to-white transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm text-indigo-900">
                <TrendingUp className="h-4 w-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-indigo-200 hover:bg-indigo-50"
                onClick={() => navigate('/timetable')}
              >
                View Full Timetable
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-indigo-200 hover:bg-indigo-50"
                onClick={() => navigate('/employee/attendance/mark')}
              >
                Mark Attendance
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-indigo-200 hover:bg-indigo-50"
                onClick={() => navigate('/leave/requests/new')}
              >
                Apply for Leave
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Attendance Distribution */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4 transition-shadow hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Attendance Distribution</CardTitle>
              <p className="text-xs text-gray-600">
                Current Month • Overall: {attendanceStats.percentage}%
              </p>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {loadingAttendance ? (
                <Skeleton className="h-48 w-48 rounded-full" />
              ) : attendanceStats.total === 0 ? (
                <div className="flex h-48 items-center justify-center text-gray-400">
                  No attendance data
                </div>
              ) : (
                <>
                  {/* Donut Chart */}
                  <div className="relative mb-4 h-48 w-48">
                    <svg viewBox="0 0 100 100" className="-rotate-90 transform">
                      {(() => {
                        const { present, absent, leaves, holidays, total } = attendanceStats;
                        const circumference = 2 * Math.PI * 40;
                        let offset = 0;

                        const segments = [
                          { value: present, color: '#22c55e' },
                          { value: absent, color: '#ef4444' },
                          { value: leaves, color: '#f97316' },
                          { value: holidays, color: '#a855f7' },
                        ];

                        return segments.map((seg, idx) => {
                          if (seg.value === 0) {
                            return null;
                          }
                          const length = (seg.value / total) * circumference;
                          const currentOffset = offset;
                          offset += length;
                          return (
                            <circle
                              key={idx}
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke={seg.color}
                              strokeWidth="20"
                              strokeDasharray={`${length} ${circumference - length}`}
                              strokeDashoffset={-currentOffset}
                            />
                          );
                        });
                      })()}
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{attendanceStats.percentage}%</span>
                      <span className="text-xs text-gray-500">Present</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-sm">Present</span>
                      </div>
                      <span className="font-semibold">{attendanceStats.present}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <span className="text-sm">Absent</span>
                      </div>
                      <span className="font-semibold">{attendanceStats.absent}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-orange-500" />
                        <span className="text-sm">Leave</span>
                      </div>
                      <span className="font-semibold">{attendanceStats.leaves}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-purple-500" />
                        <span className="text-sm">Holiday</span>
                      </div>
                      <span className="font-semibold">{attendanceStats.holidays}</span>
                    </div>
                  </div>

                  {/* Stats Cards Grid */}
                  <div className="mt-4 grid w-full grid-cols-2 gap-2">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                      <p className="text-xs font-medium text-green-700">Present</p>
                      <p className="text-xl font-bold text-green-800">{attendanceStats.present}</p>
                    </div>
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                      <p className="text-xs font-medium text-red-700">Absent</p>
                      <p className="text-xl font-bold text-red-800">{attendanceStats.absent}</p>
                    </div>
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                      <p className="text-xs font-medium text-orange-700">Leaves</p>
                      <p className="text-xl font-bold text-orange-800">{attendanceStats.leaves}</p>
                    </div>
                    <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                      <p className="text-xs font-medium text-purple-700">Holidays</p>
                      <p className="text-xl font-bold text-purple-800">
                        {attendanceStats.holidays}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
