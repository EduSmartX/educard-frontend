/**
 * Teacher Form Page Component
 * Wrapper for create, edit, and view modes with navigation
 */

import { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Edit, Trash2, X, AlertCircle, UserPlus, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common';
import { ROUTES } from '@/constants/app-config';
import { useTeacher } from '../hooks/use-teachers';
import { TeacherForm } from '../components/teacher-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getErrorMessage } from '@/lib/utils/error-handler';

export default function TeacherFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // Determine mode based on URL path
  const getMode = (): 'create' | 'edit' | 'view' => {
    if (!id) return 'create';
    if (location.pathname.endsWith('/edit')) return 'edit';
    return 'view';
  };

  const mode = getMode();

  // Fetch teacher data if editing or viewing
  const { data: teacher, isLoading, error } = useTeacher(id);

  // Show toast notification when error occurs
  useEffect(() => {
    if (error && mode !== 'create') {
      const errorMessage = getErrorMessage(error, 'Failed to load teacher data');
      toast.error('Error Loading Teacher', {
        description: errorMessage,
        duration: 5000,
      });
    }
  }, [error, mode]);

  const handleBackToList = () => {
    navigate(ROUTES.TEACHERS);
  };

  const handleFormSuccess = () => {
    navigate(ROUTES.TEACHERS);
  };

  const handleSwitchToEdit = () => {
    if (id) {
      navigate(ROUTES.TEACHERS_EDIT.replace(':id', id));
    }
  };

  const handleDelete = () => {
    if (id) {
      // TODO: Implement actual delete mutation
      console.info('Delete teacher:', id);
      navigate(ROUTES.TEACHERS);
    }
  };

  // Validate ID for edit/view modes
  if (mode !== 'create' && !id) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Teacher Not Found"
          description="Invalid teacher ID"
          actions={[
            {
              label: 'Back to List',
              onClick: handleBackToList,
              variant: 'outline',
            },
          ]}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div>
              <p className="text-red-600 font-medium">Invalid teacher ID</p>
              <p className="text-sm text-gray-500 mt-2">
                The teacher you're looking for doesn't exist or the ID is invalid.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && mode !== 'create') {
    const errorMessage = getErrorMessage(error, 'Failed to load teacher data');

    return (
      <div className="space-y-6">
        <PageHeader
          title="Error Loading Teacher"
          description="Failed to fetch teacher data"
          actions={[
            {
              label: 'Back to List',
              onClick: handleBackToList,
              variant: 'outline',
            },
          ]}
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get page configuration based on mode
  const getPageConfig = () => {
    if (mode === 'create') {
      return {
        title: 'Add New Teacher',
        description: 'Add a new teacher to your organization',
        icon: UserPlus,
        actions: [
          {
            label: 'Cancel',
            onClick: handleBackToList,
            variant: 'outline' as const,
            icon: X,
            className: 'border-2 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700',
          },
        ],
      };
    }

    if (mode === 'view') {
      return {
        title: 'View Teacher Details',
        description: 'View teacher information and details',
        icon: Eye,
        actions: [
          {
            label: 'Close',
            onClick: handleBackToList,
            variant: 'outline' as const,
            icon: X,
            className: 'border-2 border-gray-400 text-gray-700 hover:bg-gray-100',
          },
          {
            label: 'Edit',
            onClick: handleSwitchToEdit,
            variant: 'default' as const,
            icon: Edit,
          },
          {
            label: 'Delete',
            onClick: handleDelete,
            variant: 'destructive' as const,
            icon: Trash2,
          },
        ],
      };
    }

    // Edit mode
    return {
      title: 'Edit Teacher',
      description: 'Update teacher information',
      icon: Edit,
      actions: [
        {
          label: 'Cancel',
          onClick: handleBackToList,
          variant: 'outline' as const,
          icon: X,
          className: 'border-2 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700',
        },
      ],
    };
  };

  const pageConfig = getPageConfig();

  return (
    <div className="space-y-6">
      {/* Page Header with dynamic title, description, and actions */}
      <PageHeader
        title={pageConfig.title}
        description={pageConfig.description}
        icon={pageConfig.icon}
        actions={pageConfig.actions}
      />

      {/* Form Component */}
      <TeacherForm
        mode={mode}
        teacherId={id}
        initialData={teacher}
        isLoading={isLoading}
        onSuccess={handleFormSuccess}
        onCancel={handleBackToList}
        onDelete={mode === 'edit' ? handleDelete : undefined}
      />
    </div>
  );
}
