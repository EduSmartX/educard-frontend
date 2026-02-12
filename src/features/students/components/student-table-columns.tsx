/**
 * Student Table Columns Configuration
 */

import { format } from 'date-fns';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { Student } from '../types';

interface StudentActionsProps {
  student: Student;
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

function StudentActionsCell({ student, onView, onEdit, onDelete }: StudentActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={() => onView(student)} className="h-8 w-8 p-0">
        <Eye className="h-4 w-4" />
        <span className="sr-only">View</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onEdit(student)} className="h-8 w-8 p-0">
        <Pencil className="h-4 w-4" />
        <span className="sr-only">Edit</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(student)}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>
    </div>
  );
}

export function createStudentColumns(
  onView: (student: Student) => void,
  onEdit: (student: Student) => void,
  onDelete: (student: Student) => void
): ColumnDef<Student>[] {
  return [
    {
      accessorKey: 'student_id',
      header: 'Student ID',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          {row.original.student_id}
        </Badge>
      ),
    },
    {
      accessorKey: 'user.full_name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.user.full_name}</span>
      ),
    },
    {
      accessorKey: 'user.email',
      header: 'Email',
      cell: ({ row }) => <span className="text-gray-700">{row.original.user.email}</span>,
    },
    {
      accessorKey: 'user.phone',
      header: 'Phone',
      cell: ({ row }) => <span className="text-gray-700">{row.original.user.phone || '—'}</span>,
    },
    {
      accessorKey: 'date_of_birth',
      header: 'Date of Birth',
      cell: ({ row }) => (
        <span className="text-gray-700">
          {row.original.date_of_birth ? format(new Date(row.original.date_of_birth), 'PP') : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'class_name',
      header: 'Class',
      cell: ({ row }) =>
        row.original.class_name ? (
          <Badge variant="secondary">{row.original.class_name}</Badge>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <StudentActionsCell
          student={row.original}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ];
}
