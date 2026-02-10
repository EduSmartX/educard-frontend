import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Users,
  GraduationCap,
  School,
  FileText,
  UserPlus,
  UserCheck,
  CalendarPlus,
  Upload,
  Settings as SettingsIcon,
  UserCheck2,
  CheckCircle2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatsCard } from '@/components/dashboard/stats-card';
import { QuickActions, type QuickAction } from '@/components/dashboard/quick-actions';
import { LeaveRequestsList, type LeaveRequest } from '@/components/dashboard/leave-requests-list';
import { UpcomingEvents, type UpcomingEvent } from '@/components/dashboard/upcoming-events';
import { adminSidebarConfig } from './sidebar-config';
import { useAuth } from '@/hooks/use-auth';
import { useStorageListener } from '@/hooks/use-storage-listener';
import { ROUTES } from '@/constants/app-config';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  useStorageListener(); // Listen for cross-tab logout

  // Mock data for stats
  const stats = [
    {
      title: 'Total Students',
      value: '1,248',
      icon: GraduationCap,
      trend: { value: 12, isPositive: true },
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100',
    },
    {
      title: 'Total Teachers',
      value: '86',
      icon: Users,
      trend: { value: 5, isPositive: true },
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100',
    },
    {
      title: 'Active Classes',
      value: '42',
      icon: School,
      iconColor: 'text-purple-600',
      iconBgColor: 'bg-purple-100',
    },
    {
      title: 'Student Attendance',
      value: '94.2%',
      icon: UserCheck2,
      trend: { value: 2.1, isPositive: true },
      iconColor: 'text-cyan-600',
      iconBgColor: 'bg-cyan-100',
    },
    {
      title: 'Teacher Attendance',
      value: '98.5%',
      icon: CheckCircle2,
      trend: { value: 1.3, isPositive: true },
      iconColor: 'text-teal-600',
      iconBgColor: 'bg-teal-100',
    },
    {
      title: 'Pending Leaves',
      value: '8',
      icon: FileText,
      iconColor: 'text-orange-600',
      iconBgColor: 'bg-orange-100',
    },
  ];

  // Mock data for leave requests
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: '1',
      userName: 'Sarah Johnson',
      leaveType: 'Sick Leave',
      duration: '2 days',
      supervisor: 'Dr. Robert Williams',
      status: 'pending',
    },
    {
      id: '2',
      userName: 'Michael Chen',
      leaveType: 'Casual Leave',
      duration: '1 day',
      supervisor: 'Prof. Linda Martinez',
      status: 'pending',
    },
    {
      id: '3',
      userName: 'Emily Davis',
      leaveType: 'Annual Leave',
      duration: '3 days',
      supervisor: 'Dr. James Anderson',
      status: 'pending',
    },
  ]);

  // Mock data for upcoming events
  const upcomingEvents: UpcomingEvent[] = [
    {
      id: '1',
      title: 'Parent-Teacher Meeting',
      date: '2026-03-15',
      time: '10:00 AM - 2:00 PM',
      month: 'MAR',
      day: '15',
      color: 'blue',
    },
    {
      id: '2',
      title: 'Annual Sports Day',
      date: '2026-03-20',
      time: '9:00 AM - 5:00 PM',
      month: 'MAR',
      day: '20',
      color: 'green',
    },
    {
      id: '3',
      title: 'Science Fair',
      date: '2026-03-25',
      time: '11:00 AM - 4:00 PM',
      month: 'MAR',
      day: '25',
      color: 'orange',
    },
    {
      id: '4',
      title: 'Spring Break Begins',
      date: '2026-04-01',
      time: 'All Day',
      month: 'APR',
      day: '01',
      color: 'purple',
    },
  ];

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'add-teacher',
      label: 'Add Teacher',
      icon: UserPlus,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100',
      onClick: () => {
        toast.success('🎓 Opening Add Teacher form...');
        navigate(`${ROUTES.TEACHERS}/new`);
      },
    },
    {
      id: 'add-student',
      label: 'Add Student',
      icon: UserCheck,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100',
      onClick: () => {
        toast.success('📚 Opening Add Student form...');
        navigate(`${ROUTES.STUDENTS}/new`);
      },
    },
    {
      id: 'add-event',
      label: 'Add Event',
      icon: CalendarPlus,
      iconColor: 'text-purple-600',
      iconBgColor: 'bg-purple-100',
      onClick: () => {
        toast.success('📅 Opening Add Event form...');
        navigate(`${ROUTES.CALENDAR}/new`);
      },
    },
    {
      id: 'bulk-upload',
      label: 'Bulk Upload',
      icon: Upload,
      iconColor: 'text-orange-600',
      iconBgColor: 'bg-orange-100',
      onClick: () => {
        toast.info('📤 Opening Bulk Upload...');
      },
    },
    {
      id: 'leave-settings',
      label: 'Leave Allocations',
      icon: SettingsIcon,
      iconColor: 'text-indigo-600',
      iconBgColor: 'bg-indigo-100',
      onClick: () => {
        navigate(ROUTES.LEAVE.ALLOCATIONS);
      },
    },
  ];

  // Handle leave approval
  const handleApprove = (id: string) => {
    const request = leaveRequests.find((req) => req.id === id);
    setLeaveRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: 'approved' as const } : req))
    );
    toast.success(`✅ Approved leave request for ${request?.userName}`);
  };

  // Handle leave rejection
  const handleReject = (id: string) => {
    const request = leaveRequests.find((req) => req.id === id);
    setLeaveRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: 'rejected' as const } : req))
    );
    toast.error(`❌ Rejected leave request for ${request?.userName}`);
  };

  return (
    <DashboardLayout
      sidebarSections={adminSidebarConfig}
      organizationName={organization?.name}
      organizationLogo={organization?.logo}
      userName={user?.full_name || user?.username}
      userRole="Administrator"
      userAvatar={user?.profile_image}
      notificationCount={3}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-start">
        {/* Leave Requests - Takes 2 columns */}
        <div className="lg:col-span-2 h-full">
          <LeaveRequestsList
            requests={leaveRequests}
            onApprove={handleApprove}
            onReject={handleReject}
            onViewAll={() => navigate(ROUTES.LEAVE.REQUESTS)}
          />
        </div>

        {/* Quick Actions */}
        <div className="h-full">
          <QuickActions actions={quickActions} />
        </div>
      </div>

      {/* Upcoming Events */}
      <UpcomingEvents events={upcomingEvents} onViewCalendar={() => navigate(ROUTES.CALENDAR)} />
    </DashboardLayout>
  );
}
