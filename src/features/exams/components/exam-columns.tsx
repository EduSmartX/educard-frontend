/**
 * Exam Table Columns Configuration
 */

import { Eye, Pencil, Trash2, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Column } from '@/components/ui/data-table';
import type { Exam } from '../types';
import { EXAM_STATUS_LABELS, type ExamStatus } from '../types';
import { format } from 'date-fns';

interface CreateColumnsParams {
  onView: (exam: Exam) => void;
  onEdit: (exam: Exam) => void;
  onDelete?: (exam: Exam) => void;
  isDeletedView?: boolean;
}

const statusBadgeClass: Record<ExamStatus, string> = {
  draft: 'bg-gray-50 text-gray-700 border-gray-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export function createExamColumns({
  onView,
  onEdit,
  onDelete,
  isDeletedView = false,
}: CreateColumnsParams): Column<Exam>[] {
  return [
    {
      header: 'Exam Name',
      accessor: (row) => (
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-gray-900">{row.name}</span>
          <span className="text-xs text-gray-500">{row.session_name}</span>
        </div>
      ),
      sortable: true,
      sortKey: 'name',
      width: 220,
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge
          variant="outline"
          className={`text-xs font-medium ${statusBadgeClass[row.status] || ''}`}
        >
          {EXAM_STATUS_LABELS[row.status] || row.status}
        </Badge>
      ),
      sortable: true,
      sortKey: 'status',
      width: 120,
    },
    {
      header: 'Date',
      accessor: (row) => {
        if (!row.date) return <span className="text-gray-400 italic">Not set</span>;
        return (
          <div className="flex flex-col gap-0.5 text-sm">
            <span className="text-gray-700">{format(new Date(row.date), 'dd MMM yyyy')}</span>
            {row.start_time && row.end_time && (
              <span className="text-xs text-gray-500">
                {row.start_time.slice(0, 5)} - {row.end_time.slice(0, 5)}
              </span>
            )}
          </div>
        );
      },
      sortable: true,
      sortKey: 'date',
      width: 130,
    },
    {
      header: 'Classes',
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.classes_info.length > 0 ? (
            row.classes_info.slice(0, 3).map((cls) => (
              <Badge key={cls.public_id} variant="secondary" className="text-xs">
                {cls.class_master_name}-{cls.name}
              </Badge>
            ))
          ) : (
            <span className="text-gray-400 italic">None</span>
          )}
          {row.classes_info.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{row.classes_info.length - 3}
            </Badge>
          )}
        </div>
      ),
      width: 200,
    },
    {
      header: 'Subjects',
      accessor: (row) => (
        <Badge variant="secondary" className="font-medium">
          {row.subject_count}
        </Badge>
      ),
      width: 90,
    },
    {
      header: 'Actions',
      accessor: (exam) => (
        <div className="flex items-center gap-1">
          {isDeletedView ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(exam);
              }}
              title="Restore"
            >
              <RotateCcw className="h-4 w-4 text-green-600" />
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(exam);
                }}
                title="View"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(exam);
                }}
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(exam);
                }}
                title="Delete"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </>
          )}
        </div>
      ),
      width: 120,
    },
  ];
}
