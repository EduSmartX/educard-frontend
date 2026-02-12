/**
 * Students Management Page
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader, DeleteConfirmationDialog } from '@/components/common';
import { ResourceFilter, type FilterField } from '@/components/filters/resource-filter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { useStudents } from '../hooks/use-students';
import { useDeleteStudent } from '../hooks/mutations';
import { BulkUploadStudentsDialog } from './bulk-upload-dialog';
import { createStudentColumns } from './student-table-columns';
import { ROUTES } from '@/constants/app-config';
import type { Student } from '../types';

export function StudentsManagement() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [studentToDelete, setStudentToDelete] = useState<Student | undefined>();

  const { data, isLoading, error, refetch } = useStudents({
    page,
    page_size: pageSize,
    search: filters.search,
  });

  const students = data?.results || [];
  const totalCount = data?.count || 0;

  const deleteMutation = useDeleteStudent({
    onSuccess: () => {
      setStudentToDelete(undefined);
      refetch();
    },
  });

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        name: 'search',
        label: 'Search',
        type: 'text',
        placeholder: 'Search by name, student ID, or email...',
      },
    ],
    []
  );

  const columns = createStudentColumns(
    (student) => {
      navigate(`/students/${student.public_id}?mode=view`);
    },
    (student) => {
      navigate(ROUTES.STUDENTS_EDIT.replace(':id', student.public_id));
    },
    (student) => setStudentToDelete(student)
  );

  const handleFilter = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleAddNew = () => {
    navigate(ROUTES.STUDENTS_NEW);
  };

  const handleDeleteConfirm = () => {
    if (studentToDelete) {
      deleteMutation.mutate(studentToDelete.public_id);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Students">
          <div className="flex gap-2">
            <BulkUploadStudentsDialog />
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
          </div>
        </PageHeader>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold text-red-600">Error Loading Students</h3>
              <p className="mb-4 text-gray-600">Failed to fetch students. Please try again.</p>
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Students" description="Manage student records">
        <div className="flex gap-2">
          <BulkUploadStudentsDialog />
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Student
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
              data={students}
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
        open={!!studentToDelete}
        onOpenChange={(open) => !open && setStudentToDelete(undefined)}
        onConfirm={handleDeleteConfirm}
        title="Delete Student"
        description={`Are you sure you want to delete ${studentToDelete?.user.full_name}? This action cannot be undone.`}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
