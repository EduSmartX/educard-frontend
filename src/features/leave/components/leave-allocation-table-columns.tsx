/**
 * Leave Allocation Table Columns Configuration
 * Reusable column definitions for the leave allocations table
 */

import { Users, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Column } from '@/components/ui/data-table';
import type { LeaveAllocation } from '@/lib/api/leave-api';
import { createCommonColumns } from '@/components/tables/common-columns';

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
        // Format date range from effective_from and effective_to
        const formatDate = (dateStr: string | null) => {
          if (!dateStr) return null;
          try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
          } catch {
            return dateStr;
          }
        };

        const fromDate = formatDate(row.effective_from);
        const toDate = formatDate(row.effective_to);

        if (!fromDate && !toDate) {
          return <span className="text-sm text-muted-foreground">N/A</span>;
        }

        const displayText =
          fromDate && toDate ? `${fromDate} - ${toDate}` : fromDate || toDate || 'N/A';
        const hasRange = fromDate && toDate;

        return (
          <div className="text-sm">
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 ${
                hasRange ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'
              } rounded-md`}
            >
              <span className={`font-medium ${hasRange ? 'text-blue-900' : 'text-gray-900'}`}>
                {displayText}
              </span>
            </div>
          </div>
        );
      },
    },
    // Common columns: Created, Updated, Actions
    ...createCommonColumns<LeaveAllocation>(
      { onView, onEdit, onDelete },
      {
        actionsOptions: {
          variant: 'buttons',
          align: 'right',
        },
      }
    ),
  ];
}
