/**
 * Teacher Table Columns Configuration for DataTable
 * Creates column definitions for the teachers list table
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, RotateCcw } from 'lucide-react';
import type { Column } from '@/components/ui/data-table';
import type { Teacher } from '../types';
import { createCommonColumns } from '@/components/tables/common-columns';

interface CreateColumnsParams {
  onView: (teacher: Teacher) => void;
  onEdit: (teacher: Teacher) => void;
  onDelete?: (teacher: Teacher) => void;
  isDeletedView?: boolean;
}

export function createTeacherListColumns({
  onView,
  onEdit,
  onDelete,
  isDeletedView = false,
}: CreateColumnsParams): Column<Teacher>[] {
  return [
    {
      header: 'Employee ID',
      accessor: (row) => <span className="font-medium text-gray-900">{row.employee_id}</span>,
      sortable: true,
      sortKey: 'employee_id',
      width: 120,
    },
    {
      header: 'Name',
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.full_name}</span>
          <span className="text-sm text-gray-500">{row.email}</span>
        </div>
      ),
      sortable: true,
      sortKey: 'user__first_name',
      width: 250,
    },
    {
      header: 'Phone',
      accessor: (row) => <span className="text-gray-700">{row.phone || '—'}</span>,
      width: 140,
    },
    {
      header: 'Designation',
      accessor: (row) => (
        <Badge variant="secondary" className="font-medium">
          {row.designation || '—'}
        </Badge>
      ),
      sortable: true,
      sortKey: 'designation',
      width: 180,
    },
    {
      header: 'Experience',
      accessor: (row) => (
        <span className="text-gray-700">
          {row.experience_years ? `${row.experience_years} years` : '—'}
        </span>
      ),
      sortable: true,
      sortKey: 'experience_years',
      width: 120,
    },
    {
      header: 'Subjects',
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.subjects && row.subjects.length > 0 ? (
            row.subjects.slice(0, 2).map((subject) => (
              <Badge key={subject.public_id} variant="outline" className="text-xs">
                {subject.code}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-gray-500">—</span>
          )}
          {row.subjects && row.subjects.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{row.subjects.length - 2}
            </Badge>
          )}
        </div>
      ),
      width: 200,
    },
    // Common columns: Created, Updated, Actions
    ...(isDeletedView
      ? [
          {
            header: 'Actions',
            accessor: (teacher) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(teacher);
                  }}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  title="View details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(teacher);
                    }}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    title="Restore Teacher"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ),
            headerClassName: 'text-right',
          } as Column<Teacher>,
        ]
      : createCommonColumns<Teacher>(
          { onView, onEdit, onDelete },
          {
            actionsOptions: {
              variant: 'buttons',
              align: 'right',
            },
          }
        )),
  ];
}
