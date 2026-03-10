import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { CalendarDays, Loader2 } from 'lucide-react';

import { PageHeader } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { getEmployeeAttendance, getMonthlyAttendanceSummary } from '@/features/attendance/api/attendance-api';
import apiClient from '@/lib/api';
import { EmployeeInfoCard } from '@/features/attendance/components/employee-info-card';
import { YearlyCalendarGrid } from '@/features/attendance/components/yearly-calendar-grid';
import type { ReportType, ViewType } from '../components/attendance-report-filters';
import { getCurrentAcademicYear } from '@/lib/api/academic-year-api';

type AttendanceRecord = {
  public_id: string;
  date: string;
  morning_present: boolean;
  afternoon_present: boolean;
  approval_status: string;
};

interface ManageableUser {
  public_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  full_name: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function AttendanceReportPage() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [viewType, setViewType] = useState<ViewType>('self');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [showCalendarView, setShowCalendarView] = useState(false);

  // Fetch current academic year
  const { data: academicYear } = useQuery({
    queryKey: ['current-academic-year'],
    queryFn: getCurrentAcademicYear,
  });

  // Fetch manageable users for staff view
  const { data: manageableUsersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['manageable-users', 'staff-only'],
    queryFn: async () => {
      const response = await apiClient.get('/users/profile/manageable-users/', {
        params: {
          is_staff: true,
        },
      });
      return response.data;
    },
    enabled: viewType === 'staff',
  });

  const manageableUsers = useMemo(() => {
    if (!manageableUsersData?.data) {
      return [];
    }
    
    if (Array.isArray(manageableUsersData.data.users)) {
      return manageableUsersData.data.users as ManageableUser[];
    }
    
    if (Array.isArray(manageableUsersData.data)) {
      return manageableUsersData.data as ManageableUser[];
    }
    
    return [];
  }, [manageableUsersData]);

  // Determine date range based on report type (only needed for monthly view)
  const { startDate, endDate } = useMemo(() => {
    if (reportType === 'monthly') {
      const monthStart = startOfMonth(new Date(selectedYear, selectedMonth, 1));
      const monthEnd = endOfMonth(new Date(selectedYear, selectedMonth, 1));
      return {
        startDate: format(monthStart, 'yyyy-MM-dd'),
        endDate: format(monthEnd, 'yyyy-MM-dd'),
      };
    }
    // For yearly reports, we don't need these dates since backend API handles it
    return { startDate: '', endDate: '' };
  }, [reportType, selectedYear, selectedMonth]);

  // Determine which user's data to fetch
  const targetUserId = viewType === 'staff' ? selectedUser : user?.public_id;

  // 🚀 NEW: Fetch monthly attendance summary for yearly reports (backend-calculated)
  const { data: monthlySummaryData, isLoading: loadingMonthlySummary } = useQuery({
    queryKey: ['monthly-attendance-summary', targetUserId, selectedYear],
    queryFn: () => getMonthlyAttendanceSummary({ 
      user: targetUserId!,
      year: selectedYear 
    }),
    enabled: !!targetUserId && reportType === 'yearly',
  });

  // Fetch monthly attendance data for monthly view (day-by-day detail)
  const { data: monthlyDetailData, isLoading: loadingMonthlyDetail } = useQuery({
    queryKey: ['attendance-report-monthly', targetUserId, startDate, endDate, viewType],
    queryFn: async () => {
      if (viewType === 'self') {
        return getEmployeeAttendance({ from_date: startDate, to_date: endDate });
      } else {
        // For staff view, fetch specific user's attendance
        const response = await apiClient.get('/attendance/employee-attendance/', {
          params: {
            from_date: startDate,
            to_date: endDate,
            user: targetUserId,
          },
        });
        const payload = response.data?.data || {};
        return {
          records: payload.records || [],
          stats: payload.stats || {},
          employee_id: payload.employee_id || null,
          user_info: payload.user_info || null,
          date_range: payload.date_range || { from_date: startDate, to_date: endDate },
          working_day_policy: payload.working_day_policy || null,
          calendar_exceptions: payload.calendar_exceptions || [],
          holiday_descriptions: payload.holiday_descriptions || {},
          pagination: payload.pagination || {},
        };
      }
    },
    enabled: !!targetUserId && reportType === 'monthly',
  });

  const isLoading =
    loadingMonthlySummary ||
    loadingMonthlyDetail ||
    isLoadingUsers;

  // ✅ Backend-calculated yearly data (no frontend calculation needed!)
  const yearlyData = useMemo(() => {
    if (reportType !== 'yearly' || !monthlySummaryData) {
      return null;
    }

    const monthlyStats = monthlySummaryData.monthly_data.map((month) => ({
      month: month.month_name,
      totalWorkingDays: month.total_working_days,
      present: month.total_present,
      absent: month.total_absent,
      leaves: month.total_leaves,
      holidays: month.total_holidays,
      attendancePercentage: month.attendance_percentage,
    }));

    const totals = monthlySummaryData.total_summary;

    return { monthlyStats, totals };
  }, [reportType, monthlySummaryData]);

  // For monthly calendar view, create lookup maps from the detail data
  const { attendanceByDate, leaveByDate, holidaySet, exceptionalWorkByDate } = useMemo(() => {
    if (!monthlyDetailData) {
      return {
        attendanceByDate: new Map(),
        leaveByDate: new Map(),
        holidaySet: new Set(),
        exceptionalWorkByDate: new Map(),
      };
    }

    // Build attendance map
    const attMap = new Map<string, AttendanceRecord>();
    (monthlyDetailData.records || []).forEach((record: AttendanceRecord) => {
      attMap.set(record.date, record);
    });

    // Build leave map from embedded leave records
    const lvMap = new Map();
    // Note: monthlyDetailData.records already have leaves merged, so we extract from there
    // Or if you have separate leave data, process it here

    // Build holiday set from holiday_descriptions
    const holSet = new Set<string>();
    if (monthlyDetailData.holiday_descriptions) {
      Object.keys(monthlyDetailData.holiday_descriptions).forEach(dateKey => {
        holSet.add(dateKey);
      });
    }

    // Build exceptional work map
    const excMap = new Map();
    (monthlyDetailData.calendar_exceptions || []).forEach((exception: { date: string }) => {
      excMap.set(exception.date, exception);
    });

    return {
      attendanceByDate: attMap,
      leaveByDate: lvMap,
      holidaySet: holSet,
      exceptionalWorkByDate: excMap,
    };
  }, [monthlyDetailData]);

  const loading = isLoading;

  const selectedUserData = useMemo(() => {
    if (viewType === 'self') {
      return user;
    }
    // For staff view, prefer user_info from API response (more complete data)
    if (viewType === 'staff' && monthlyDetailData?.user_info) {
      return monthlyDetailData.user_info;
    }
    return manageableUsers.find((u) => u.public_id === selectedUser);
  }, [viewType, user, manageableUsers, selectedUser, monthlyDetailData]);

  const years = useMemo(() => {
    const yearsArray = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      yearsArray.push(i);
    }
    return yearsArray;
  }, [currentYear]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Attendance Report"
        description="View yearly and monthly attendance reports with comprehensive analytics"
      />

      {/* Filter Section */}
      <Card className="shadow-sm border border-blue-200" style={{ backgroundColor: '#E3F2FD' }}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Report Type
              </label>
              <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yearly">Yearly Report</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                View
              </label>
              <Select value={viewType} onValueChange={(value) => setViewType(value as ViewType)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">Self</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Staff Selection */}
            {viewType === 'staff' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Staff
                </label>
                <Combobox
                  options={manageableUsers.map((staff) => ({
                    value: staff.public_id,
                    label: staff.full_name || `${staff.first_name} ${staff.last_name}`,
                  }))}
                  value={selectedUser}
                  onValueChange={setSelectedUser}
                  placeholder="Choose staff member"
                  searchPlaceholder="Search staff..."
                  emptyText="No staff members found"
                  disabled={isLoadingUsers}
                  className="bg-white"
                />
              </div>
            )}

            {/* Year Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Year
              </label>
              <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}-{String(year + 1).slice(-2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month Selection (only for monthly report) */}
            {reportType === 'monthly' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Month
                </label>
                <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(Number(value))}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month, index) => (
                      <SelectItem key={index} value={String(index)}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Info Card with Monthly Report - Matching Timesheet Overview Design */}
      {selectedUserData && (
        <Card className="shadow-sm border border-[#bfd591]" style={{ backgroundColor: '#C5D89D' }}>
          <CardContent className="pt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <EmployeeInfoCard
              user={selectedUserData}
              organization={'organization' in selectedUserData ? selectedUserData.organization as { name?: string } : undefined}
              organizationRole={('organization_role' in selectedUserData && selectedUserData.organization_role) ? 
                (typeof selectedUserData.organization_role === 'string' ? selectedUserData.organization_role : (selectedUserData.organization_role as {name?: string})?.name) : 
                null}
              employeeId={monthlyDetailData?.employee_id || null}
              showProfileImage={true}
            />

            {targetUserId && monthlyDetailData && reportType === 'monthly' && (
              <Card className="border-0 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <CalendarDays className="h-6 w-6 text-blue-600" />
                      Monthly Report
                    </CardTitle>
                    <Badge variant="outline" className="text-sm">
                      {format(new Date(selectedYear, selectedMonth), 'MMMM yyyy')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Attendance Summary</div>
                    <div className="text-base font-semibold mb-2">
                      {monthlyDetailData.stats?.total_working_days > 0 
                        ? `${Math.round((monthlyDetailData?.stats?.total_present / monthlyDetailData?.stats?.total_working_days) * 100)}% present`
                        : '0% present'
                      }
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
                      {monthlyDetailData.stats?.total_present > 0 && (
                        <div 
                          className="bg-green-500" 
                          style={{ width: `${(monthlyDetailData?.stats?.total_present / monthlyDetailData?.stats?.total_working_days) * 100}%` }}
                        />
                      )}
                      {monthlyDetailData.stats?.total_absent > 0 && (
                        <div 
                          className="bg-red-500" 
                          style={{ width: `${(monthlyDetailData?.stats?.total_absent / monthlyDetailData?.stats?.total_working_days) * 100}%` }}
                        />
                      )}
                      {monthlyDetailData.stats?.total_leaves > 0 && (
                        <div 
                          className="bg-orange-500" 
                          style={{ width: `${(monthlyDetailData?.stats?.total_leaves / monthlyDetailData?.stats?.total_working_days) * 100}%` }}
                        />
                      )}
                      {monthlyDetailData.stats?.total_holidays > 0 && (
                        <div 
                          className="bg-purple-500" 
                          style={{ width: `${(monthlyDetailData?.stats?.total_holidays / monthlyDetailData?.stats?.total_working_days) * 100}%` }}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-sm bg-green-500"></span>
                        Present {monthlyDetailData.stats?.total_present || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-sm bg-red-500"></span>
                        Absent {monthlyDetailData.stats?.total_absent || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-sm bg-orange-500"></span>
                        Leave {monthlyDetailData.stats?.total_leaves || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-sm bg-purple-500"></span>
                        Holiday {monthlyDetailData.stats?.total_holidays || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* View Calendar Button for Yearly Report */}
      {reportType === 'yearly' && targetUserId && monthlySummaryData && (
        <div className="flex justify-center">
          <Button
            onClick={() => setShowCalendarView(!showCalendarView)}
            variant={showCalendarView ? 'default' : 'outline'}
            className={`min-w-[200px] ${showCalendarView ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
          >
            {showCalendarView ? 'Hide Calendar View' : 'View Calendar Grid'}
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-12 flex items-center justify-center text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading attendance data...
          </CardContent>
        </Card>
      )}

      {/* Yearly Report Table */}
      {!loading && reportType === 'yearly' && yearlyData && !showCalendarView && (
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                {academicYear ? `Academic Year Attendance Report - ${academicYear.name}` : `Yearly Attendance Report - ${selectedYear}`}
              </CardTitle>
              <Badge variant="outline" className="text-base">
                {academicYear ? academicYear.name : selectedYear}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                      Month
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                      Total Working Days
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                      Total Present
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                      Total Absent
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                      Total Leaves
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyData.monthlyStats.map((month, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium text-gray-800">
                        {month.month}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-gray-700">
                        {month.totalWorkingDays}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-green-700 font-semibold">
                        {month.present}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-red-700 font-semibold">
                        {month.absent}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-blue-700 font-semibold">
                        {month.leaves}
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-green-100 font-bold">
                    <td className="border border-gray-300 px-4 py-3 text-gray-800">
                      TOTAL
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-gray-800">
                      {yearlyData.totals.total_working_days}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-green-800">
                      {yearlyData.totals.total_present}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-red-800">
                      {yearlyData.totals.total_absent}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-blue-800">
                      {yearlyData.totals.total_leaves}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Yearly Calendar Grid */}
      {!loading && reportType === 'yearly' && targetUserId && showCalendarView && (
        <YearlyCalendarGrid
          userId={targetUserId}
          year={selectedYear}
          academicYearName={academicYear?.name}
        />
      )}

      {/* Monthly Report - Calendar View */}
      {!loading && reportType === 'monthly' && monthlyDetailData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Calendar Section - Takes 2/3 width */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                  {MONTHS[selectedMonth]} {selectedYear}
                </CardTitle>
                <Badge variant="outline" className="text-base">
                  {MONTHS[selectedMonth]} {selectedYear}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const monthStart = startOfMonth(new Date(selectedYear, selectedMonth, 1));
                const monthEnd = endOfMonth(new Date(selectedYear, selectedMonth, 1));
                const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
                const leadingEmptyDays = Array.from({ length: monthStart.getDay() });

                return (
                  <>
                    {/* Week day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="text-center text-xs font-semibold text-gray-600 py-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar days grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* Leading empty cells for proper calendar alignment */}
                      {leadingEmptyDays.map((_, index) => (
                        <div key={`empty-${index}`} className="aspect-square rounded border border-transparent" />
                      ))}

                      {/* Actual days */}
                      {monthDays.map((date) => {
                        const dateKey = toDateKey(date);
                        const attendance = attendanceByDate.get(dateKey);
                        const leave = leaveByDate.get(dateKey);
                        const exception = exceptionalWorkByDate.get(dateKey);
                        const isHoliday = holidaySet.has(dateKey);
                        const isFuture = date > new Date();
                        
                        // Determine day state and styling
                        let bgColor = 'bg-white border-gray-200';
                        let textColor = 'text-gray-900';
                        let icon = null;
                        let statusLabel = '';
                        
                        // Check for force working day exception (overrides holiday/weekend)
                        if (exception?.override_type === 'FORCE_WORKING') {
                          statusLabel = 'Testing';
                          if (attendance?.morning_present && attendance?.afternoon_present) {
                            bgColor = 'bg-green-50 border-green-300';
                            textColor = 'text-green-900';
                            icon = <div className="h-5 w-5 mx-auto rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-bold">✓</div>;
                          } else if (!isFuture) {
                            bgColor = 'bg-red-50 border-red-300';
                            textColor = 'text-red-900';
                            icon = <div className="h-5 w-5 mx-auto rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-bold">✕</div>;
                          }
                        }
                        // Check for force holiday exception
                        else if (exception?.override_type === 'FORCE_HOLIDAY' || isHoliday) {
                          bgColor = 'bg-purple-50 border-purple-300';
                          textColor = 'text-purple-900';
                          icon = <div className="h-5 w-5 mx-auto rounded-full bg-purple-500 flex items-center justify-center text-white text-[10px] font-bold">H</div>;
                          statusLabel = 'Weekend';
                        }
                        // Check if it's a weekend based on working day policy
                        else if (monthlyDetailData.working_day_policy) {
                          const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
                          let isWeekend = false;

                          // Check Sunday
                          if (dayOfWeek === 0 && monthlyDetailData.working_day_policy.sunday_off) {
                            isWeekend = true;
                          }

                          // Check Saturday based on pattern
                          if (dayOfWeek === 6) {
                            const { saturday_off_pattern } = monthlyDetailData.working_day_policy;
                            if (saturday_off_pattern === 'ALL') {
                              isWeekend = true;
                            } else if (saturday_off_pattern === 'SECOND_ONLY' || saturday_off_pattern === 'SECOND_AND_FOURTH') {
                              const weekOfMonth = Math.ceil(date.getDate() / 7);
                              if (saturday_off_pattern === 'SECOND_ONLY' && weekOfMonth === 2) {
                                isWeekend = true;
                              } else if (saturday_off_pattern === 'SECOND_AND_FOURTH' && (weekOfMonth === 2 || weekOfMonth === 4)) {
                                isWeekend = true;
                              }
                            }
                          }

                          if (isWeekend) {
                            bgColor = 'bg-purple-50 border-purple-300';
                            textColor = 'text-purple-900';
                            icon = <div className="h-5 w-5 mx-auto rounded-full bg-purple-500 flex items-center justify-center text-white text-[10px] font-bold">H</div>;
                            statusLabel = 'Weekend';
                          }
                        }

                        // Check for approved leave
                        if (!icon && leave?.status === 'approved') {
                          bgColor = 'bg-orange-50 border-orange-300';
                          textColor = 'text-orange-900';
                          icon = <div className="h-5 w-5 mx-auto rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold">✕</div>;
                        }
                        // Check for pending leave
                        else if (!icon && leave?.status === 'pending') {
                          bgColor = 'bg-orange-50 border-orange-300';
                          textColor = 'text-orange-900';
                          icon = <div className="h-5 w-5 mx-auto rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold">✕</div>;
                        }
                        // Check for present
                        else if (!icon && attendance?.morning_present && attendance?.afternoon_present) {
                          bgColor = 'bg-green-50 border-green-300';
                          textColor = 'text-green-900';
                          icon = <div className="h-5 w-5 mx-auto rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] font-bold">✓</div>;
                        }
                        // Check for absent (only on past dates, not weekends/holidays)
                        else if (!icon && !isFuture && !isHoliday && bgColor === 'bg-white border-gray-200') {
                          bgColor = 'bg-red-50 border-red-300';
                          textColor = 'text-red-900';
                          icon = <div className="h-5 w-5 mx-auto rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-bold">✕</div>;
                        }
                        // Future dates - light gray
                        else if (isFuture) {
                          bgColor = 'bg-gray-50 border-gray-200';
                          textColor = 'text-gray-400';
                        }

                        return (
                          <div
                            key={dateKey}
                            className={`aspect-square rounded border p-1 flex flex-col items-center justify-between transition ${bgColor}`}
                          >
                            <div className="text-center w-full">
                              <div className="text-[7px] font-medium text-gray-500">
                                {format(date, 'EEE')}
                              </div>
                              <div className={`text-xs font-bold ${textColor}`}>
                                {format(date, 'd')}
                              </div>
                            </div>
                            <div className="flex flex-col items-center justify-center w-full flex-1">
                              {icon}
                              {statusLabel && (
                                <div className="text-[7px] text-purple-600 font-medium mt-0.5">
                                  {statusLabel}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>

          {/* Insights Panel - Takes 1/3 width with Pie Chart */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Attendance Distribution</CardTitle>
                <p className="text-xs text-gray-600">
                  Overall: {monthlyDetailData?.stats?.total_working_days > 0 
                    ? Math.round((monthlyDetailData?.stats?.total_present / monthlyDetailData?.stats?.total_working_days) * 100) 
                    : 0}%
                </p>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {/* Simple Donut Chart using stroke-dasharray */}
                <div className="relative w-48 h-48 mb-4">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {(() => {
                      const present = monthlyDetailData?.stats?.total_present || 0;
                      const absent = monthlyDetailData?.stats?.total_absent || 0;
                      const leaves = monthlyDetailData?.stats?.total_leaves || 0;
                      const total = present + absent + leaves;
                      
                      if (total === 0) {
                        return (
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            fill="none"
                            stroke="#e5e7eb" 
                            strokeWidth="20"
                          />
                        );
                      }
                      
                      const circumference = 2 * Math.PI * 40; // radius = 40
                      const presentPercent = (present / total) * 100;
                      const absentPercent = (absent / total) * 100;
                      const leavePercent = (leaves / total) * 100;
                      
                      const presentLength = (presentPercent / 100) * circumference;
                      const absentLength = (absentPercent / 100) * circumference;
                      const leaveLength = (leavePercent / 100) * circumference;
                      
                      let offset = 0;
                      
                      return (
                        <>
                          {/* Present segment */}
                          {presentPercent > 0 && (
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#22c55e"
                              strokeWidth="20"
                              strokeDasharray={`${presentLength} ${circumference - presentLength}`}
                              strokeDashoffset={-offset}
                            />
                          )}
                          
                          {/* Absent segment */}
                          {absentPercent > 0 && (() => {
                            offset += presentLength;
                            return (
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="20"
                                strokeDasharray={`${absentLength} ${circumference - absentLength}`}
                                strokeDashoffset={-offset}
                              />
                            );
                          })()}
                          
                          {/* Leave segment */}
                          {leavePercent > 0 && (() => {
                            offset += absentLength;
                            return (
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#f97316"
                                strokeWidth="20"
                                strokeDasharray={`${leaveLength} ${circumference - leaveLength}`}
                                strokeDashoffset={-offset}
                              />
                            );
                          })()}
                        </>
                      );
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {monthlyDetailData?.stats?.total_working_days > 0 
                          ? `${Math.round((monthlyDetailData?.stats?.total_present / monthlyDetailData?.stats?.total_working_days) * 100)}%`
                          : '0%'
                        }
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Present</div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-xs text-gray-700">Present</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{monthlyDetailData?.stats?.total_present}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-xs text-gray-700">Absent</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{monthlyDetailData?.stats?.total_absent}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-xs text-gray-700">Leave</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{monthlyDetailData?.stats?.total_leaves}</span>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-2 w-full mt-4">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="text-[10px] text-green-700 font-medium mb-1">Present</div>
                    <div className="text-xl font-bold text-green-900">{monthlyDetailData?.stats?.total_present}</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <div className="text-[10px] text-red-700 font-medium mb-1">Absent</div>
                    <div className="text-xl font-bold text-red-900">{monthlyDetailData?.stats?.total_absent}</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <div className="text-[10px] text-orange-700 font-medium mb-1">Leaves</div>
                    <div className="text-xl font-bold text-orange-900">{monthlyDetailData?.stats?.total_leaves}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="text-[10px] text-purple-700 font-medium mb-1">Holidays</div>
                    <div className="text-xl font-bold text-purple-900">{monthlyDetailData?.stats?.total_holidays}</div>
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
                  <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">✓</div>
                  <span className="text-gray-700">Present</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px]">✕</div>
                  <span className="text-gray-700">Absent</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-4 w-4 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px]">✕</div>
                  <span className="text-gray-700">Leave (Approved)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded bg-purple-100 border border-purple-300"></div>
                  <span className="text-gray-700">Holiday</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
