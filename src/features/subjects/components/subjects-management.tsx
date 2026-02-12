/**
 * Subjects Management Page
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader, DeleteConfirmationDialog } from '@/components/common';
import { ResourceFilter, type FilterField } from '@/components/filters/resource-filter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { useSubjects } from '../hooks/use-subjects';
import { useDeleteSubject } from '../hooks/mutations';
import { BulkUploadSubjectsDialog } from './bulk-upload-dialog';
import { ROUTES } from '@/constants/app-config';
import type { Subject } from '../types';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function SubjectsManagement() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [subjectToDelete, setSubjectToDelete] = useState<Subject | undefined>();

  const { data, isLoading, error, refetch } = useSubjects({
    page,
    page_size: pageSize,
    search: filters.search,
  });

  const subjects = data?.results || [];
  const totalCount = data?.count || 0;

  const deleteMutation = useDeleteSubject({
    onSuccess: () => {
      setSubjectToDelete(undefined);
      refetch();
    },
  });

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        name: 'search',
        label: 'Search',
        type: 'text',
        placeholder: 'Subject name or code...',
      },
    ],
    []
  );

  // Table columns
  const columns: ColumnDef<Subject>[] = [
    {
      accessorKey: 'subject_code',
      header: 'Code',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          {row.original.subject_code}
        </Badge>
      ),
    },
    {
      accessorKey: 'subject_name',
      header: 'Subject Name',
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.subject_name}</span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => <span className="text-gray-700">{row.original.description || '—'}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/subjects/${row.original.public_id}?mode=view`)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.SUBJECTS_EDIT.replace(':id', row.original.public_id))}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSubjectToDelete(row.original)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
    },
  ];

  const handleFilter = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleAddNew = () => {
    navigate(ROUTES.SUBJECTS_NEW);
  };

  const handleDeleteConfirm = () => {
    if (subjectToDelete) {
      deleteMutation.mutate(subjectToDelete.public_id);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Subjects">
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Subject
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold text-red-600">Error Loading Subjects</h3>
              <p className="mb-4 text-gray-600">Failed to fetch subjects. Please try again.</p>
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Subjects" description="Manage academic subjects">
        <div className="flex gap-2">
          <BulkUploadSubjectsDialog />
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Subject
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <ResourceFilter
              fields={filterFields}
              onFilter={handleFilter}
              onReset={handleResetFilters}
            />

            <DataTable
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              columns={columns as any}
              data={subjects}
              isLoading={isLoading}
              pageIndex={page - 1}
              pageSize={pageSize}
              totalCount={totalCount}
              onPageChange={(newPage) => setPage(newPage + 1)}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={!!subjectToDelete}
        onOpenChange={(open) => !open && setSubjectToDelete(undefined)}
        onConfirm={handleDeleteConfirm}
        title="Delete Subject"
        description={`Are you sure you want to delete ${subjectToDelete?.subject_name}? This action cannot be undone.`}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
