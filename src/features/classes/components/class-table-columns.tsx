/**
 * Class Table Columns Configuration
 */

import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Class } from '../types';

interface GetColumnsOptions {
  onView: (classItem: Class) => void;
  onEdit: (classItem: Class) => void;
  onDelete: (classItem: Class) => void;
  isDeletedView?: boolean;
}

export function getClassColumns({
  onView,
  onEdit,
  onDelete,
  isDeletedView = false,
}: GetColumnsOptions): ColumnDef<Class>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Class Name',
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.name}</span>,
    },
    {
      id: 'standard_section',
      header: 'Standard - Section',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline">{row.original.standard}</Badge>
          <span className="text-gray-500">-</span>
          <Badge variant="outline">{row.original.section}</Badge>
        </div>
      ),
    },
    {
      id: 'class_teacher',
      header: 'Class Teacher',
      cell: ({ row }) => (
        <div className="flex flex-col">
          {row.original.class_teacher ? (
            <>
              <span className="font-medium text-gray-900">
                {row.original.class_teacher.full_name}
              </span>
              <span className="text-sm text-gray-500">
                {row.original.class_teacher.employee_id}
              </span>
            </>
          ) : (
            <span className="text-gray-400">Not assigned</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'academic_year',
      header: 'Academic Year',
      cell: ({ row }) => <span className="text-gray-700">{row.original.academic_year}</span>,
    },
    {
      id: 'students',
      header: 'Students',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.original.student_count}</span>
          {row.original.capacity && (
            <span className="text-xs text-gray-500">of {row.original.capacity}</span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(row.original)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          {!isDeletedView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row.original)}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row.original)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{isDeletedView ? 'Restore' : 'Delete'}</span>
          </Button>
        </div>
      ),
    },
  ];
}
