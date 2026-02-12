/**
 * Classes Management Page
 * Main page for managing classes with table, filters, and CRUD operations
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader, DeleteConfirmationDialog } from '@/components/common';
import { ResourceFilter, type FilterField } from '@/components/filters/resource-filter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { useClasses } from '../hooks/use-classes';
import { useDeleteClass } from '../hooks/mutations';
import { BulkUploadDialog } from './bulk-upload-dialog';
import { getClassColumns } from './class-table-columns';
import { ROUTES } from '@/constants/app-config';
import type { Class } from '../types';

export function ClassesManagement() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [classToDelete, setClassToDelete] = useState<Class | undefined>();

  // Fetch classes
  const { data, isLoading, error, refetch } = useClasses({
    page,
    page_size: pageSize,
    search: filters.search,
    academic_year: filters.academic_year,
  });

  const classes = data?.results || [];
  const totalCount = data?.count || 0;

  // Delete mutation
  const deleteMutation = useDeleteClass({
    onSuccess: () => {
      setClassToDelete(undefined);
      refetch();
    },
  });

  // Filter fields
  const filterFields: FilterField[] = useMemo(
    () => [
      {
        name: 'search',
        label: 'Search',
        type: 'text',
        placeholder: 'Standard, section, or teacher...',
      },
      {
        name: 'academic_year',
        label: 'Academic Year',
        type: 'text',
        placeholder: 'e.g., 2024-2025',
      },
    ],
    []
  );

  // Table columns
  const columns = getClassColumns({
    onView: (classItem) => {
      navigate(`/classes/${classItem.public_id}?mode=view`);
    },
    onEdit: (classItem) => {
      navigate(ROUTES.CLASSES_EDIT.replace(':id', classItem.public_id));
    },
    onDelete: (classItem) => {
      setClassToDelete(classItem);
    },
  });

  // Handlers
  const handleFilter = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleAddNew = () => {
    navigate(ROUTES.CLASSES_NEW);
  };

  const handleDeleteConfirm = () => {
    if (classToDelete) {
      deleteMutation.mutate(classToDelete.public_id);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Classes">
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Class
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold text-red-600">Error Loading Classes</h3>
              <p className="mb-4 text-gray-600">Failed to fetch classes. Please try again.</p>
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Classes" description="Manage class sections and assignments">
        <div className="flex flex-wrap gap-3">
          <BulkUploadDialog />
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Class
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Filters */}
            <ResourceFilter
              fields={filterFields}
              onFilter={handleFilter}
              onReset={handleResetFilters}
            />

            {/* Table */}
            <DataTable
              columns={columns}
              data={classes}
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

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        open={!!classToDelete}
        onOpenChange={(open) => !open && setClassToDelete(undefined)}
        onConfirm={handleDeleteConfirm}
        title="Delete Class"
        description={`Are you sure you want to delete ${classToDelete?.name}? This action cannot be undone.`}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
