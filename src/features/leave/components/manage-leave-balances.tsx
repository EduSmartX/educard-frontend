/**
 * Manage Leave Balances Page
 * Comprehensive leave balance management for Staff and Students
 */
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, User, Users, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { PageHeader } from '@/components/common/page-header';
import { DeleteConfirmationDialog } from '@/components/common/delete-confirmation-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Combobox } from '@/components/ui/combobox';
import { type LeaveBalance } from '@/lib/api/leave-api';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { LeaveBalanceDialog } from './leave-balance-dialog';
import {
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Label as RechartsLabel,
} from 'recharts';
import { getLeaveTypeName } from '../utils/leave-name-helper';
import { useDeleteLeaveBalance } from '../hooks';

type UserRole = 'staff' | 'student';

interface ManageableUser {
  public_id: string;
  full_name: string;
  email: string;
  employee_id?: string;
  role?: string;
  phone?: string;
  gender?: string;
  organization_role?: string;
}

interface ClassData {
  public_id: string;
  name: string;
  class_master: {
    id: number;
    name: string;
    code: string;
    display_order: number;
  };
  is_active: boolean;
}

interface StudentData {
  public_id: string;
  roll_number: string;
  admission_number: string;
  user_info: {
    public_id: string;
    username: string;
    full_name: string;
    email: string;
    phone?: string;
    gender?: string;
  };
  role?: string;
  organization_role?: string;
}

interface LeaveAllocationForUser {
  public_id: string;
  leave_type_name: string;
  total_days: string;
  max_carry_forward_days: string;
  is_applicable_to_all: boolean;
  roles: string;
  academic_year: string;
  created_at: string;
  updated_at: string;
  created_by_public_id: string;
  created_by_name: string;
  updated_by_public_id: string;
  updated_by_name: string;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ManageLeaveBalances() {
  const { user: currentUser } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>('staff');
  const [manageOwnBalance, setManageOwnBalance] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [dialog, setDialog] = useState<{
    open: boolean;
    mode: 'add' | 'edit';
    balance?: LeaveBalance | null;
  }>({
    open: false,
    mode: 'add',
    balance: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; balance: LeaveBalance | null }>(
    {
      open: false,
      balance: null,
    }
  );

  useEffect(() => {
    setSelectedUser('');
    setSelectedClass('');
  }, [userRole]);

  useEffect(() => {
    if (manageOwnBalance) {
      setSelectedUser('');
      setSelectedClass('');
    }
  }, [manageOwnBalance]);

  const { data: manageableUsersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['manageable-users', userRole],
    queryFn: async () => {
      const response = await api.get(`/users/profile/manageable-users/?role=${userRole}`);
      // Handle different API response structures
      if (Array.isArray(response.data)) {
        return { data: response.data };
      }
      return response.data;
    },
    enabled: !manageOwnBalance && userRole === 'staff',
  });

  const { data: classesData, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes-list'],
    queryFn: async () => {
      const response = await api.get('/classes/admin/?page=1&page_size=100&is_active=true');
      // Handle different API response structures
      if (Array.isArray(response.data)) {
        return { data: response.data };
      }
      return response.data;
    },
    enabled: !manageOwnBalance && userRole === 'student',
  });

  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['class-students', selectedClass],
    queryFn: async () => {
      const response = await api.get(`/students/classes/${selectedClass}/students/`);
      // Handle different API response structures
      if (Array.isArray(response.data)) {
        return { data: response.data };
      }
      return response.data;
    },
    enabled: !manageOwnBalance && userRole === 'student' && !!selectedClass,
  });

  // Get effective user ID from auth context or selected user
  const effectiveUserId = manageOwnBalance ? currentUser?.public_id : selectedUser;

  const { data: userAllocationsData, isLoading: isLoadingAllocations } = useQuery({
    queryKey: ['user-leave-allocations', effectiveUserId],
    queryFn: async () => {
      const response = await api.get(
        `/leave/leave-allocations/for-user/?user_public_id=${effectiveUserId}`
      );
      // Handle different API response structures
      if (Array.isArray(response.data)) {
        return { data: response.data };
      }
      return response.data;
    },
    enabled: !!effectiveUserId,
  });

  const {
    data: userBalancesData,
    isLoading: isLoadingBalances,
    refetch: refetchBalances,
  } = useQuery({
    queryKey: ['user-leave-balances', effectiveUserId],
    queryFn: async () => {
      const response = await api.get(`/leave/leave-balances/user/${effectiveUserId}/`);
      return response.data;
    },
    enabled: !!effectiveUserId,
  });

  const manageableUsers = useMemo(() => {
    if (!manageableUsersData?.data) return [];
    // Handle nested users array
    if (Array.isArray(manageableUsersData.data.users)) {
      return manageableUsersData.data.users as ManageableUser[];
    }
    // Handle direct array
    if (Array.isArray(manageableUsersData.data)) {
      return manageableUsersData.data as ManageableUser[];
    }
    return [];
  }, [manageableUsersData]);

  const classes = useMemo(() => {
    if (!classesData?.data) return [];
    // Handle direct array
    if (Array.isArray(classesData.data)) {
      return classesData.data as ClassData[];
    }
    return [];
  }, [classesData]);

  const students = useMemo(() => {
    if (!studentsData?.data) return [];
    // Handle nested students array
    if (Array.isArray(studentsData.data.students)) {
      return studentsData.data.students as StudentData[];
    }
    // Handle direct array
    if (Array.isArray(studentsData.data)) {
      return studentsData.data as StudentData[];
    }
    return [];
  }, [studentsData]);
  const userAllocations = Array.isArray(userAllocationsData?.data)
    ? (userAllocationsData.data as LeaveAllocationForUser[])
    : [];

  // Leave balances API returns data: { user: {...}, balances: [...] }
  const userBalances = useMemo(() => {
    return Array.isArray(userBalancesData?.data?.balances)
      ? (userBalancesData.data.balances as LeaveBalance[])
      : [];
  }, [userBalancesData?.data?.balances]);

  // Filter and paginate balances
  const filteredBalances = useMemo(() => {
    if (!searchQuery.trim()) return userBalances;

    const query = searchQuery.toLowerCase();
    return userBalances.filter(
      (balance) =>
        balance.leave_allocation.leave_type_name.toLowerCase().includes(query) ||
        balance.leave_allocation.display_name.toLowerCase().includes(query) ||
        balance.leave_name.toLowerCase().includes(query)
    );
  }, [userBalances, searchQuery]);

  const paginatedBalances = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredBalances.slice(startIndex, endIndex);
  }, [filteredBalances, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredBalances.length / pageSize);

  const paginationInfo = {
    current_page: currentPage,
    page_size: pageSize,
    count: filteredBalances.length,
    total_pages: totalPages,
    has_next: currentPage < totalPages,
    has_previous: currentPage > 1,
    next_page: currentPage < totalPages ? currentPage + 1 : null,
    previous_page: currentPage > 1 ? currentPage - 1 : null,
  };

  // Get user details - either current user or selected user from API response or lists
  // For students, we need to keep the parent object to access roll_number
  const rawUserDetails = useMemo(() => {
    if (manageOwnBalance) return currentUser;
    if (userBalancesData?.data?.user) return userBalancesData.data.user;

    if (userRole === 'staff') {
      return manageableUsers.find((u) => u.public_id === selectedUser);
    }

    // For students, return the full student object (has both user_info and roll_number)
    return students.find((s) => s.user_info.public_id === selectedUser);
  }, [
    manageOwnBalance,
    currentUser,
    userBalancesData?.data?.user,
    userRole,
    manageableUsers,
    selectedUser,
    students,
  ]);

  // Normalize user details to handle different API response shapes
  const selectedUserDetails = useMemo(() => {
    if (!rawUserDetails) return undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = rawUserDetails as Record<string, any>;

    // Handle student nested user_info structure
    const userInfo = user.user_info || user;

    const fullName =
      userInfo.full_name ||
      userInfo.name ||
      `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim() ||
      undefined;

    const organizationRole =
      user.organization_role ||
      userInfo.organization_role ||
      user.role_display ||
      userInfo.role_display ||
      undefined;

    return {
      public_id: userInfo.public_id,
      full_name: fullName,
      email: userInfo.email,

      role: user.role || userInfo.role,
      organization_role: organizationRole,
      phone: userInfo.phone,
      gender: userInfo.gender,
    };
  }, [rawUserDetails]);

  // Get allocated leave type names from user's balances
  const allocatedLeaveNames = new Set(userBalances.map((b) => b.leave_allocation.public_id));
  // Filter allocations to find unallocated leave types
  // Transform to match dialog's expected format
  const unallocatedLeaveTypes = userAllocations
    .filter((allocation) => !allocatedLeaveNames.has(allocation.public_id))
    .map((allocation) => ({
      public_id: allocation.public_id,
      leave_type_name: allocation.leave_type_name,
      leave_type_code: allocation.leave_type_name.match(/\(([^)]+)\)/)?.[1] || 'N/A',
      display_name: allocation.leave_type_name,
      total_days: parseFloat(allocation.total_days),
      max_carry_forward_days: parseFloat(allocation.max_carry_forward_days),
    }));

  const pieChartData = userBalances.map((balance, index: number) => ({
    name: getLeaveTypeName(balance),
    value: parseFloat(balance.total_allocated) || 0,
    color: COLORS[index % COLORS.length],
  }));

  const handleEditBalance = (balance: LeaveBalance) => {
    setDialog({ open: true, mode: 'edit', balance });
  };

  const deleteMutation = useDeleteLeaveBalance();

  const handleDeleteBalance = (balance: LeaveBalance) => {
    setDeleteDialog({ open: true, balance });
  };

  const confirmDelete = () => {
    if (deleteDialog.balance) {
      deleteMutation.mutate(deleteDialog.balance.public_id, {
        onSuccess: () => {
          toast.success('Leave balance deleted successfully');
          refetchBalances();
          setDeleteDialog({ open: false, balance: null });
        },
        onError: (error: Error) => {
          const apiError = error as unknown as { response?: { data?: { message?: string } } };
          toast.error('Failed to delete leave balance', {
            description: apiError.response?.data?.message || 'An error occurred',
          });
        },
      });
    }
  };

  const columns: Column<LeaveBalance>[] = [
    {
      header: 'Leave Type',
      accessor: (row: LeaveBalance) => {
        const name = getLeaveTypeName(row);
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-medium">
              {name}
            </Badge>
          </div>
        );
      },
    },
    {
      header: 'Allocated',
      accessor: (row: LeaveBalance) => (
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {parseFloat(row.total_allocated).toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">days</div>
        </div>
      ),
      width: 120,
    },
    {
      header: 'Used',
      accessor: (row: LeaveBalance) => (
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600">{Number(row.used).toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">days</div>
        </div>
      ),
      width: 120,
    },
    {
      header: 'Carried Forward',
      accessor: (row: LeaveBalance) => (
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">
            {parseFloat(row.carried_forward).toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">days</div>
        </div>
      ),
      width: 140,
    },
    {
      header: 'Available',
      accessor: (row: LeaveBalance) => (
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{Number(row.available).toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">days</div>
        </div>
      ),
      width: 120,
    },
    {
      header: 'Created',
      accessor: (row: LeaveBalance) => {
        let name = row.created_by_name?.trim();
        if (!name || name.toLowerCase() === 'string string') name = 'System';
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900">{name}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(row.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        );
      },
      sortable: true,
      sortKey: 'created_at',
    },
    {
      header: 'Updated',
      accessor: (row: LeaveBalance) => {
        let name = row.updated_by_name?.trim();
        if (!name || name.toLowerCase() === 'string string') name = 'System';
        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900">{name}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(row.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        );
      },
      sortable: true,
      sortKey: 'updated_at',
    },
    {
      header: 'Actions',
      accessor: (row: LeaveBalance) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditBalance(row)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteBalance(row)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      width: 100,
    },
  ];

  const handleAddBalance = () => {
    if (unallocatedLeaveTypes.length === 0) {
      toast.info('No Available Leave Types', {
        description: 'All leave types have been assigned.',
      });
      return;
    }
    setDialog({ open: true, mode: 'add', balance: null });
  };

  const handleDialogClose = (success?: boolean) => {
    setDialog({ open: false, mode: 'add', balance: null });
    if (success) {
      refetchBalances();
    }
  };

  const showUserSelection = !manageOwnBalance;
  const showBalances = !!effectiveUserId;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Leave Balances"
        description="Create and modify leave balances for your team members"
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="manage-own" className="cursor-pointer font-medium">
              Manage my own leave balance
            </Label>
            <Switch
              id="manage-own"
              checked={manageOwnBalance}
              onCheckedChange={setManageOwnBalance}
            />
          </div>
        </CardContent>
      </Card>

      {showUserSelection && (
        <>
          <div className="flex gap-2">
            <Button
              variant={userRole === 'staff' ? 'default' : 'outline'}
              onClick={() => setUserRole('staff')}
              className={cn(
                'flex-1',
                userRole === 'staff' && 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
              )}
            >
              <Users className="mr-2 h-4 w-4" />
              Staff
            </Button>
            <Button
              variant={userRole === 'student' ? 'default' : 'outline'}
              onClick={() => setUserRole('student')}
              className={cn(
                'flex-1',
                userRole === 'student' && 'bg-green-600 hover:bg-green-700 text-white shadow-md'
              )}
            >
              <User className="mr-2 h-4 w-4" />
              Students
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Select User</CardTitle>
              <CardDescription>
                {userRole === 'staff'
                  ? 'Choose a staff member to manage their leave balances'
                  : 'Choose a student to manage their leave balances'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userRole === 'student' && (
                <div className="space-y-2">
                  <Label>Select Class</Label>
                  <Combobox
                    value={selectedClass}
                    onValueChange={(value) => {
                      setSelectedClass(value);
                      setSelectedUser('');
                    }}
                    options={classes.map((cls) => ({
                      label: `${cls.class_master.name} (${cls.name})`,
                      value: cls.public_id,
                    }))}
                    placeholder="Select a class"
                    emptyText="No classes found"
                    searchPlaceholder="Search classes..."
                    disabled={isLoadingClasses}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Select User</Label>
                <Combobox
                  value={selectedUser}
                  onValueChange={setSelectedUser}
                  options={
                    userRole === 'staff'
                      ? manageableUsers.map((user) => ({
                          label: `${user.full_name} [${user.email}]`,
                          value: user.public_id,
                          description: user.employee_id
                            ? `Employee ID: ${user.employee_id}`
                            : undefined,
                        }))
                      : students.map((student) => ({
                          label: `${student.user_info.full_name} (${student.roll_number})`,
                          value: student.user_info.public_id,
                          description: student.user_info.email || student.admission_number,
                        }))
                  }
                  placeholder={
                    userRole === 'staff'
                      ? 'Select a staff member'
                      : selectedClass
                        ? 'Select a student'
                        : 'First select a class'
                  }
                  emptyText={userRole === 'staff' ? 'No staff members found' : 'No students found'}
                  searchPlaceholder={
                    userRole === 'staff' ? 'Search staff...' : 'Search students...'
                  }
                  disabled={
                    (userRole === 'staff' && isLoadingUsers) ||
                    (userRole === 'student' && (!selectedClass || isLoadingStudents))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {showBalances && (
        <>
          {/* User Information and Leave Types Distribution - Same Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* User Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">User Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden border rounded-lg">
                  <table className="w-full">
                    <tbody className="divide-y">
                      <tr className="hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-muted-foreground w-40">
                          Full Name
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold">
                          {selectedUserDetails?.full_name || '—'}
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-muted-foreground w-40">
                          Email
                        </td>
                        <td className="py-3 px-4 text-sm">{selectedUserDetails?.email || '—'}</td>
                      </tr>
                      <tr className="hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-muted-foreground w-40">
                          Role
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Badge variant="outline" className="font-medium capitalize">
                            {selectedUserDetails?.role || '—'}
                          </Badge>
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-muted-foreground w-40">
                          Organization Role
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Badge variant="secondary" className="font-medium">
                            {selectedUserDetails?.organization_role || 'N/A'}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Leave Types Distribution */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Leave Types Distribution</CardTitle>
                <CardDescription className="mt-1">Visual breakdown of allocations</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {pieChartData.length > 0 ? (
                  <div className="flex items-start gap-6">
                    {/* Pie Chart */}
                    <div className="flex-shrink-0">
                      <ResponsiveContainer width={320} height={320}>
                        <RechartsPieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ cx, cy, midAngle, outerRadius, percent }) => {
                              const RADIAN = Math.PI / 180;
                              const radius = outerRadius + 25;
                              const x = cx + radius * Math.cos(-midAngle * RADIAN);
                              const y = cy + radius * Math.sin(-midAngle * RADIAN);

                              return (
                                <text
                                  x={x}
                                  y={y}
                                  fill="#64748b"
                                  textAnchor={x > cx ? 'start' : 'end'}
                                  dominantBaseline="central"
                                  className="text-sm font-semibold"
                                >
                                  {`${(percent * 100).toFixed(0)}%`}
                                </text>
                              );
                            }}
                            labelLine={{
                              stroke: '#cbd5e1',
                              strokeWidth: 1,
                            }}
                          >
                            {pieChartData.map(
                              (
                                entry: { name: string; value: number; color: string },
                                index: number
                              ) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              )
                            )}
                            <RechartsLabel
                              value={`${pieChartData.reduce((sum, entry) => sum + entry.value, 0).toFixed(0)} days`}
                              position="center"
                              className="text-2xl font-bold"
                              fill="#000"
                            />
                          </Pie>
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legend on Right */}
                    <div className="flex-1 space-y-3">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Legend
                      </div>
                      {pieChartData.map(
                        (entry: { name: string; value: number; color: string }, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="h-4 w-4 rounded-full ring-2 ring-white shadow-sm"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm font-medium">{entry.name}</span>
                            </div>
                            <span className="text-sm font-bold" style={{ color: entry.color }}>
                              {entry.value.toFixed(1)} days
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                    No leave types configured
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Leave Balances Table - Full Width with Pagination and Filters */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Leave Balances</CardTitle>
                  <CardDescription className="mt-1">
                    {filteredBalances.length} of {userBalances.length} leave type(s)
                  </CardDescription>
                </div>
                <Button
                  onClick={handleAddBalance}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Leave Balance
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Filter */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search leave types..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                  className="pl-9"
                />
              </div>

              {/* Data Table */}
              <DataTable
                columns={columns}
                data={paginatedBalances}
                isLoading={isLoadingBalances || isLoadingAllocations}
                getRowKey={(row: LeaveBalance) => row.public_id}
                pagination={paginationInfo}
                onPageChange={setCurrentPage}
              />
            </CardContent>
          </Card>
        </>
      )}

      <LeaveBalanceDialog
        open={dialog.open}
        mode={dialog.mode}
        data={dialog.balance || undefined}
        availableAllocations={unallocatedLeaveTypes}
        userPublicId={effectiveUserId}
        onClose={handleDialogClose}
      />

      <DeleteConfirmationDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open, balance: null })}
        onConfirm={confirmDelete}
        title="Delete Leave Balance"
        itemName={deleteDialog.balance ? getLeaveTypeName(deleteDialog.balance) : ''}
        isDeleting={deleteMutation.isPending}
        deleteButtonText="Delete Balance"
      />
    </div>
  );
}
