/**
 * Class Form Page - Add/Edit/View Class
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, X, Plus, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, DeleteConfirmationDialog } from '@/components/common';
import { FormActions } from '@/components/form/form-actions';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateClass, useUpdateClass, useDeleteClass } from '../hooks/mutations';
import { useClass } from '../hooks/use-classes';
import { useTeachers } from '@/features/teachers/hooks/use-teachers';
import { useCoreClasses } from '@/features/core/hooks/use-core-classes';
import { ROUTES } from '@/constants/app-config';
import { isDeletedDuplicateError, getDeletedDuplicateMessage } from '@/lib/utils/error-handler';
import { DeletedDuplicateDialog } from '@/components/common';
import { useDeletedDuplicateHandler } from '@/hooks/use-deleted-duplicate-handler';
import { classFormSchema, type ClassFormData } from '../schemas/class-form-schema';

export default function ClassFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  // Determine mode based on URL path
  const getMode = (): 'create' | 'edit' | 'view' => {
    if (!id) return 'create';
    if (location.pathname.endsWith('/edit')) return 'edit';
    return 'view';
  };

  const mode = getMode();
  const firstErrorRef = useRef<HTMLDivElement>(null);

  // Navigation handlers
  const handleBackToList = () => {
    navigate(ROUTES.CLASSES);
  };

  const handleSwitchToEdit = () => {
    if (id) {
      navigate(ROUTES.CLASSES_EDIT.replace(':id', id));
    }
  };

  // Duplicate handling
  const duplicateHandler = useDeletedDuplicateHandler();

  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch class data if editing/viewing
  const { data: classItem, isLoading: _isLoading, error: _error } = useClass(id);

  // Fetch core classes for dropdown
  const { data: coreClasses } = useCoreClasses();

  // Fetch teachers for dropdown
  const { data: teachersResponse } = useTeachers({ page_size: 1000 });
  const teachers = teachersResponse?.data || [];

  const form = useForm<ClassFormData>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      class_master: '',
      name: '',
      class_teacher: '',
      info: '',
      capacity: '',
    },
  });

  // Populate form when editing/viewing
  useEffect(() => {
    if (mode !== 'create' && classItem && id) {
      const formData = {
        class_master: classItem.class_master?.id?.toString() || '',
        name: classItem.name || '',
        class_teacher: classItem.class_teacher?.public_id || '',
        info: classItem.info || '',
        capacity: classItem.capacity?.toString() || '',
      };

      // Reset form with new data and trigger re-render
      form.reset(formData, {
        keepDefaultValues: false,
      });
    }
  }, [classItem, mode, id, form]);

  // Error handler
  const handleFormErrors = (error: Error, fieldErrors?: Record<string, string | undefined>) => {
    // Check for deleted duplicate error
    if (isDeletedDuplicateError(error)) {
      const message = getDeletedDuplicateMessage(error);
      duplicateHandler.openDialog(message, form.getValues());
      return;
    }

    // Apply field errors to form (toast already shown by mutation)
    if (fieldErrors) {
      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (message) {
          form.setError(field as keyof ClassFormData, {
            type: 'manual',
            message: String(message),
          });
        }
      });

      // Auto-focus first error field
      setTimeout(() => {
        firstErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const focusable = firstErrorRef.current?.querySelector<HTMLElement>('input, button');
        focusable?.focus();
      }, 100);
    }
  };

  // Mutations
  const createMutation = useCreateClass({
    onSuccess: () => {
      toast.success('Class created successfully');
      navigate(ROUTES.CLASSES);
    },
    onError: handleFormErrors,
  });

  const updateMutation = useUpdateClass({
    onSuccess: () => {
      toast.success('Class updated successfully');
      navigate(ROUTES.CLASSES);
    },
    onError: handleFormErrors,
  });

  const deleteMutation = useDeleteClass({
    onSuccess: () => {
      toast.success('Class deleted successfully');
      navigate(ROUTES.CLASSES);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete class: ${error.message}`);
    },
  });

  // Delete handlers
  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    setShowDeleteDialog(false);
    if (classItem) {
      deleteMutation.mutate(classItem.public_id);
    }
  };

  // Handle reactivate from duplicate dialog
  const handleReactivate = () => {
    duplicateHandler.closeDialog();
    navigate(`${ROUTES.CLASSES}?showDeleted=true`);
  };

  // Handle force create from duplicate dialog
  const handleForceCreate = () => {
    const pendingData = duplicateHandler.pendingData as ClassFormData | null;
    if (pendingData) {
      createMutation.mutate({
        payload: {
          class_master: Number(pendingData.class_master),
          name: pendingData.name,
          class_teacher: pendingData.class_teacher || undefined,
          info: pendingData.info || undefined,
          capacity: pendingData.capacity ? Number(pendingData.capacity) : undefined,
        },
        forceCreate: true,
      });
      duplicateHandler.closeDialog();
    }
  };

  // Form submission
  const onSubmit = (data: ClassFormData) => {
    if (mode === 'edit' && classItem) {
      // Don't send class_master in edit mode - it can't be changed
      updateMutation.mutate({
        publicId: classItem.public_id,
        payload: {
          name: data.name,
          class_teacher: data.class_teacher || undefined,
          info: data.info || undefined,
          capacity: data.capacity ? Number(data.capacity) : undefined,
        },
      });
    } else {
      createMutation.mutate({
        payload: {
          class_master: Number(data.class_master),
          name: data.name,
          class_teacher: data.class_teacher || undefined,
          info: data.info || undefined,
          capacity: data.capacity ? Number(data.capacity) : undefined,
        },
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Get page configuration based on mode
  const getPageConfig = () => {
    if (mode === 'create') {
      return {
        title: 'Add New Class',
        description: 'Fill in the details to create a new class',
        icon: Plus,
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
        title: 'View Class Details',
        description: 'View class information and details',
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
        ],
      };
    }

    // Edit mode
    return {
      title: 'Edit Class',
      description: 'Update class information',
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
      <PageHeader
        title={pageConfig.title}
        description={pageConfig.description}
        icon={pageConfig.icon}
        actions={pageConfig.actions}
      />

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Class Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Class Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Class Master (from core) */}
                  <FormField
                    control={form.control}
                    name="class_master"
                    render={({ field, fieldState }) => (
                      <FormItem
                        ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                      >
                        <FormLabel>
                          Class <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          key={`class-master-${classItem?.public_id || 'new'}-${field.value}`}
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isPending || mode === 'view' || mode === 'edit'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {coreClasses?.map((coreClass) => (
                              <SelectItem key={coreClass.id} value={coreClass.id.toString()}>
                                {coreClass.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {mode === 'edit' && (
                          <p className="text-sm text-muted-foreground">
                            Class cannot be changed after creation
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Section Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field, fieldState }) => (
                      <FormItem
                        ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                      >
                        <FormLabel>
                          Section Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., A, B, Section A"
                            disabled={isPending || mode === 'view'}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Capacity */}
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field, fieldState }) => (
                      <FormItem
                        ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                      >
                        <FormLabel>Capacity (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Enter class capacity"
                            disabled={isPending || mode === 'view'}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Class Teacher */}
                  <FormField
                    control={form.control}
                    name="class_teacher"
                    render={({ field, fieldState }) => (
                      <FormItem
                        ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                      >
                        <FormLabel>Class Teacher (Optional)</FormLabel>
                        <Select
                          key={`class-teacher-${classItem?.public_id || 'new'}-${field.value}`}
                          onValueChange={(value) => {
                            // Allow clearing the selection
                            field.onChange(value === 'none' ? '' : value);
                          }}
                          value={field.value || 'none'}
                          disabled={isPending || mode === 'view'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class teacher" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher.public_id} value={teacher.public_id}>
                                {teacher.full_name} ({teacher.employee_id})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Info/Description */}
                <FormField
                  control={form.control}
                  name="info"
                  render={({ field, fieldState }) => (
                    <FormItem
                      ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                    >
                      <FormLabel>Additional Information (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any additional information about this class section"
                          disabled={isPending || mode === 'view'}
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Form Actions */}
              <FormActions
                mode={mode}
                isSubmitting={isPending}
                onCancel={() => navigate(ROUTES.CLASSES)}
                onDelete={mode === 'edit' || mode === 'view' ? handleDelete : undefined}
                showDelete={mode === 'edit' || mode === 'view'}
                submitLabel={mode === 'edit' ? 'Update Class' : 'Create Class'}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Class"
        itemName={
          classItem ? `${classItem.class_master?.name || 'Class'} - ${classItem.name}` : undefined
        }
        isSoftDelete={true}
        isDeleting={deleteMutation.isPending}
      />

      {/* Deleted Duplicate Dialog */}
      <DeletedDuplicateDialog
        open={duplicateHandler.isOpen}
        onOpenChange={(open) => !open && duplicateHandler.closeDialog()}
        message={duplicateHandler.message}
        onReactivate={handleReactivate}
        onCreateNew={handleForceCreate}
        onCancel={duplicateHandler.closeDialog}
      />
    </div>
  );
}
