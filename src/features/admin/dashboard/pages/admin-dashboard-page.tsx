/**
 * Admin Dashboard Page
 *
 * Clean, attractive dashboard with:
 * - Welcome greeting
 * - Attendance Statistics (live counts from API)
 * - Quick Actions: Teachers, Classes, Subjects, Students
 * - Setup: Organization Preferences, Leave Allocations
 * - Notifications: Pending Leave Requests, Timesheet Submissions
 */

import { useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  BookOpen,
  School,
  Sliders,
  CalendarCheck,
  Bell,
  ClipboardCheck,
  ArrowRight,
  Plus,
  Settings,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { ROUTES } from '@/constants/app-config';
import { useQuery } from '@tanstack/react-query';
import { useTeachers } from '@/features/teachers/hooks/use-teachers';
import { useStudents } from '@/features/students/hooks/use-students';
import { useClasses } from '@/features/classes/hooks/use-classes';
import { getDashboardAttendanceStats } from '@/features/attendance/api/attendance-api';

/* -------------------------------------------------------------------------- */
/*  Stat Card                                                                  */
/* -------------------------------------------------------------------------- */

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | undefined;
  isLoading: boolean;
  color: string;
  bgColor: string;
  path: string;
}

function StatCard({ icon: Icon, label, value, isLoading, color, bgColor, path }: StatCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="group cursor-pointer border border-gray-100 shadow-sm transition-all duration-200 hover:border-gray-200 hover:shadow-md"
      onClick={() => navigate(path)}
    >
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className={`rounded-xl p-3 ${bgColor} shrink-0`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-500">{label}</p>
            {isLoading ? (
              <Loader2 className="mt-1 h-5 w-5 animate-spin text-gray-300" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{value ?? '-'}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Action Card                                                                */
/* -------------------------------------------------------------------------- */

interface ActionCardProps {
  icon: React.ElementType;
  label: string;
  description: string;
  path: string;
  color: string;
  bgColor: string;
}

function ActionCard({ icon: Icon, label, description, path, color, bgColor }: ActionCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="group cursor-pointer border border-gray-100 shadow-sm transition-all duration-200 hover:border-gray-200 hover:shadow-md"
      onClick={() => navigate(path)}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={`rounded-xl p-3 ${bgColor} shrink-0`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-teal-700">
              {label}
            </h3>
            <p className="mt-0.5 text-sm text-gray-500">{description}</p>
          </div>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-teal-500" />
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Notification Card                                                          */
/* -------------------------------------------------------------------------- */

interface NotificationCardProps {
  icon: React.ElementType;
  label: string;
  description: string;
  path: string;
  badgeColor: string;
}

function NotificationCard({
  icon: Icon,
  label,
  description,
  path,
  badgeColor,
}: NotificationCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="group flex cursor-pointer items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-all duration-200 hover:border-gray-200 hover:shadow-sm"
      onClick={() => navigate(path)}
    >
      <div className={`rounded-full p-2.5 ${badgeColor}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-900 transition-colors group-hover:text-teal-700">
          {label}
        </p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-teal-500" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Dashboard Page                                                             */
/* -------------------------------------------------------------------------- */

export default function AdminDashboardPage() {
  const { user, organization } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.full_name?.split(' ')[0] || 'Admin';

  // Fetch counts (page_size=1 to minimise payload — we only need pagination.count)
  const { data: teachersData, isLoading: loadingTeachers } = useTeachers({
    page_size: 1,
    is_deleted: false,
  });
  const { data: studentsData, isLoading: loadingStudents } = useStudents({ page_size: 1 });
  const { data: classesData, isLoading: loadingClasses } = useClasses({ page_size: 1 });

  // Today's attendance stats
  const { data: attendanceStats, isLoading: loadingAttendance } = useQuery({
    queryKey: ['dashboard', 'attendance-stats'],
    queryFn: getDashboardAttendanceStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });

  const totalTeachers = teachersData?.pagination?.count;
  const totalStudents = studentsData?.pagination?.count;
  const totalClasses = classesData?.pagination?.count;

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-3 py-4 sm:space-y-8 sm:p-6">
      {/* Welcome Header */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 p-4 text-white sm:p-6 md:p-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">Welcome back, {firstName}! 👋</h1>
        <p className="mt-1 text-xs text-teal-100 sm:mt-1.5 sm:text-sm md:text-base">
          {organization?.name ? `Managing ${organization.name}` : "Here's your school overview"}
        </p>
      </div>

      {/* Attendance Statistics */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-900">Statistics</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            icon={Users}
            label="Total Teachers"
            value={totalTeachers}
            isLoading={loadingTeachers}
            color="text-blue-600"
            bgColor="bg-blue-50"
            path={ROUTES.TEACHERS}
          />
          <StatCard
            icon={GraduationCap}
            label="Total Students"
            value={totalStudents}
            isLoading={loadingStudents}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
            path={ROUTES.STUDENTS}
          />
          <StatCard
            icon={School}
            label="Total Classes"
            value={totalClasses}
            isLoading={loadingClasses}
            color="text-violet-600"
            bgColor="bg-violet-50"
            path={ROUTES.CLASSES}
          />
        </div>

        {/* Today's Attendance — below the totals */}
        <div className="mt-4">
          <p className="mb-3 text-sm font-medium text-gray-500">Today's Attendance</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Student Attendance */}
            <Card
              className="group cursor-pointer border border-gray-100 shadow-sm transition-all duration-200 hover:border-gray-200 hover:shadow-md"
              onClick={() => navigate(ROUTES.ATTENDANCE.STUDENTS)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 rounded-xl bg-green-50 p-3">
                      <GraduationCap className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Student Attendance</p>
                      {loadingAttendance ? (
                        <Loader2 className="mt-1 h-5 w-5 animate-spin text-gray-300" />
                      ) : (attendanceStats?.students?.marked ?? 0) > 0 ? (
                        <p className="text-xl font-bold text-gray-900">
                          {attendanceStats?.students?.present ?? 0}
                          <span className="text-sm font-normal text-gray-400">
                            {' '}
                            / {attendanceStats?.students?.total_registered ?? 0}
                          </span>
                        </p>
                      ) : (
                        <p className="mt-0.5 text-sm text-gray-400">Not marked yet</p>
                      )}
                    </div>
                  </div>
                  {!loadingAttendance && (attendanceStats?.students?.marked ?? 0) > 0 && (
                    <div className="text-right">
                      <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                        {attendanceStats?.students?.attendance_percentage ?? 0}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Employee Attendance */}
            <Card
              className="group cursor-pointer border border-gray-100 shadow-sm transition-all duration-200 hover:border-gray-200 hover:shadow-md"
              onClick={() => navigate(ROUTES.ATTENDANCE.STAFF)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 rounded-xl bg-cyan-50 p-3">
                      <Users className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Employee Attendance</p>
                      {loadingAttendance ? (
                        <Loader2 className="mt-1 h-5 w-5 animate-spin text-gray-300" />
                      ) : (attendanceStats?.employees?.marked ?? 0) > 0 ? (
                        <p className="text-xl font-bold text-gray-900">
                          {attendanceStats?.employees?.present ?? 0}
                          <span className="text-sm font-normal text-gray-400">
                            {' '}
                            / {attendanceStats?.employees?.total_registered ?? 0}
                          </span>
                        </p>
                      ) : (
                        <p className="mt-0.5 text-sm text-gray-400">Not marked yet</p>
                      )}
                    </div>
                  </div>
                  {!loadingAttendance && (attendanceStats?.employees?.marked ?? 0) > 0 && (
                    <div className="text-right">
                      <span className="inline-flex items-center rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">
                        {attendanceStats?.employees?.attendance_percentage ?? 0}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Actions — Manage */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ActionCard
            icon={Users}
            label="Teachers"
            description="Add and manage teaching staff"
            path={ROUTES.TEACHERS}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <ActionCard
            icon={School}
            label="Classes"
            description="Create and organize classes"
            path={ROUTES.CLASSES}
            color="text-violet-600"
            bgColor="bg-violet-50"
          />
          <ActionCard
            icon={GraduationCap}
            label="Students"
            description="Enroll and manage students"
            path={ROUTES.STUDENTS}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <ActionCard
            icon={BookOpen}
            label="Subjects"
            description="Configure curriculum subjects"
            path={ROUTES.SUBJECTS}
            color="text-amber-600"
            bgColor="bg-amber-50"
          />
        </div>
      </section>

      {/* Setup */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-900">Setup</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ActionCard
            icon={Sliders}
            label="Organization Preferences"
            description="Configure school settings and policies"
            path={ROUTES.PREFERENCES}
            color="text-slate-600"
            bgColor="bg-slate-50"
          />
          <ActionCard
            icon={CalendarCheck}
            label="Leave Allocations"
            description="Set up leave types and quotas"
            path={ROUTES.LEAVE.ALLOCATIONS}
            color="text-teal-600"
            bgColor="bg-teal-50"
          />
        </div>
      </section>

      {/* Notifications */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-teal-600" />
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        </div>
        <div className="space-y-3">
          <NotificationCard
            icon={ClipboardCheck}
            label="Leave Requests"
            description="Review and approve pending leave applications"
            path={ROUTES.LEAVE.REVIEWS}
            badgeColor="bg-orange-500"
          />
          <NotificationCard
            icon={ClipboardCheck}
            label="Timesheet Submissions"
            description="Review and approve submitted employee timesheets"
            path={ROUTES.ATTENDANCE.TIMESHEET_APPROVALS}
            badgeColor="bg-blue-500"
          />
        </div>
      </section>
    </div>
  );
}
