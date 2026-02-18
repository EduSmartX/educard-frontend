/**
 * Leave Request Table Columns
 * Using common columns pattern like all other list pages
 */
import { X, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Column } from '@/components/ui/data-table';
import { formatDate } from '@/lib/utils/date-utils';
import type { LeaveRequest } from '../types';
import { LEAVE_STATUS_CONFIG } from '../types';

interface ColumnActions {
  onView?: (request: LeaveRequest) => void;
  onCancel?: (request: LeaveRequest) => void;
}

export function getLeaveRequestColumns(actions: ColumnActions): Column<LeaveRequest>[] {
  return [
    {
      header: 'Leave Type',
      accessor: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.leave_name}</div>
          <div className="text-xs text-muted-foreground">{row.leave_type_code}</div>
        </div>
      ),
      sortable: true,
      sortKey: 'leave_name',
    },
    {
      header: 'Start Date',
      accessor: (row) => <div className="text-sm text-gray-900">{formatDate(row.start_date)}</div>,
      sortable: true,
      sortKey: 'start_date',
    },
    {
      header: 'End Date',
      accessor: (row) => <div className="text-sm text-gray-900">{formatDate(row.end_date)}</div>,
      sortable: true,
      sortKey: 'end_date',
    },
    {
      header: 'Days',
      accessor: (row) => (
        <div className="text-center">
          <span className="font-semibold text-gray-900">{row.number_of_days}</span>
        </div>
      ),
      sortable: true,
      sortKey: 'number_of_days',
      width: 80,
    },
    {
      header: 'Status',
      accessor: (row) => {
        const config = LEAVE_STATUS_CONFIG[row.status];
        return (
          <Badge variant="outline" className={config.className}>
            {config.label}
          </Badge>
        );
      },
      sortable: true,
      sortKey: 'status',
    },
    {
      header: 'Created',
      accessor: (row) => (
        <div>
          <div className="text-sm text-gray-900">{row.created_by_name || 'System'}</div>
          <div className="text-xs text-muted-foreground">{formatDate(row.created_at)}</div>
        </div>
      ),
      sortable: true,
      sortKey: 'created_at',
    },
    {
      header: 'Updated',
      accessor: (row) => (
        <div>
          <div className="text-sm text-gray-900">{row.updated_by_name || 'System'}</div>
          <div className="text-xs text-muted-foreground">{formatDate(row.updated_at)}</div>
        </div>
      ),
      sortable: true,
      sortKey: 'updated_at',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          {actions.onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => actions.onView?.(row)}
              className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {row.status === 'pending' && actions.onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => actions.onCancel?.(row)}
              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
      width: 120,
    },
  ];
}
