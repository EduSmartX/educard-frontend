/**
 * Leave Allocation Table Columns Configuration
 * Reusable column definitions for the leave allocations table
 */

import { Users, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Column } from '@/components/ui/data-table';
import type { LeaveAllocation } from '@/lib/api/leave-api';
import { createActionsColumn } from '@/components/tables/common-columns';

interface CreateColumnsParams {
  onView: (allocation: LeaveAllocation) => void;
  onEdit: (allocation: LeaveAllocation) => void;
  onDelete: (allocation: LeaveAllocation) => void;
}

export function createLeaveAllocationColumns({
  onView,
  onEdit,
  onDelete,
}: CreateColumnsParams): Column<LeaveAllocation>[] {
  return [
    {
      header: 'Leave Type',
      accessor: (row) => <div className="font-medium text-gray-900">{row.leave_type_name}</div>,
      sortable: true,
      sortKey: 'leave_type_name',
    },
    {
      header: 'Total Days',
      accessor: (row) => (
        <Badge variant="secondary" className="font-mono">
          {row.total_days} days
        </Badge>
      ),
      sortable: true,
      sortKey: 'total_days',
    },
    {
      header: 'Carry Forward',
      accessor: (row) => (
        <Badge variant="outline" className="font-mono">
          {row.max_carry_forward_days} days
        </Badge>
      ),
      sortable: true,
      sortKey: 'max_carry_forward_days',
    },
    {
      header: 'Applicable Roles',
      accessor: (row) => {
        if (row.applies_to_all_roles) {
          return (
            <Badge className="gap-1 bg-blue-600">
              <Users className="h-3 w-3" />
              All Roles
            </Badge>
          );
        }

        const roles = row.roles ? row.roles.split(',').map((r: string) => r.trim()) : [];

        if (roles.length === 0) {
          return <span className="text-sm text-muted-foreground">N/A</span>;
        }

        const visibleRoles = roles.slice(0, 2);
        const hiddenRoles = roles.slice(2);

        return (
          <div className="flex flex-wrap gap-1.5 items-center">
            {visibleRoles.map((role: string, idx: number) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200"
              >
                {role}
              </Badge>
            ))}
            {hiddenRoles.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Badge
                    variant="outline"
                    className="text-xs font-medium cursor-pointer hover:bg-gray-100 gap-1 border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    +{hiddenRoles.length} more
                    <ChevronDown className="h-3 w-3" />
                  </Badge>
                </PopoverTrigger>
                <PopoverContent className="w-auto max-w-md p-4" align="start" sideOffset={8}>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-900 border-b pb-2">
                      All Applicable Roles ({roles.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {roles.map((role: string, idx: number) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs font-medium bg-purple-100 text-purple-700 px-2.5 py-1"
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        );
      },
    },
    {
      header: 'Effective Period',
      accessor: (row) => {
        const academicYear = row.academic_year || 'N/A';

        if (academicYear === 'N/A') {
          return <span className="text-sm text-muted-foreground">N/A</span>;
        }

        // Check if it's a range (contains '-') or a "From" date
        const isRange = academicYear.includes(' - ');

        return (
          <div className="text-sm">
            {isRange ? (
              // Range format: "01 May 2025 - 30 Apr 2026"
              <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md">
                <span className="font-medium text-blue-900">{academicYear}</span>
              </div>
            ) : (
              // From date format or plain text
              <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md">
                <span className="font-medium text-gray-900">{academicYear}</span>
              </div>
            )}
          </div>
        );
      },
    },
    createActionsColumn<LeaveAllocation>(
      {
        onView,
        onEdit,
        onDelete,
      },
      {
        variant: 'buttons',
        align: 'right',
      }
    ),
  ];
}
