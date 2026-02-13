/**
 * Subject Form Page - Add/Edit/View Subject
 */

import { useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit, X, Plus, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, DeletedDuplicateDialog } from '@/components/common';
import { FormActions } from '@/components/form/form-actions';
import { isDeletedDuplicateError, getDeletedDuplicateMessage } from '@/lib/utils/error-handler';
import { useDeletedDuplicateHandler } from '@/hooks/use-deleted-duplicate-handler';
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
import { Textarea } from '@/components/ui/textarea';
import { useCreateSubject, useUpdateSubject } from '../hooks/mutations';
import { useSubject } from '../hooks/use-subjects';
import { useClasses } from '@/features/classes/hooks/use-classes';
import { useSubjectMasters } from '@/features/core/hooks/use-subject-masters';
import { useTeachers } from '@/features/teachers/hooks/use-teachers';
import { ROUTES } from '@/constants/app-config';

const subjectSchema = z.object({
  class_id: z.string().min(1, 'Class is required'),
  subject_id: z.number({ required_error: 'Subject is required' }),
  teacher_id: z.string().optional(),
  description: z.string().optional(),
});
type SubjectFormData = z.infer<typeof subjectSchema>;

export default function SubjectFormPage() {
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

  // Duplicate handling
  const duplicateHandler = useDeletedDuplicateHandler();

  // Fetch subject data if editing/viewing
  const { data: subject } = useSubject(id);
  // Fetch dropdown data
  const { data: classesData } = useClasses({ page_size: 100 });
  const { data: subjectMastersData } = useSubjectMasters({ page_size: 100 });
  const { data: teachersData } = useTeachers({ page_size: 100 });

  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      class_id: '',
      subject_id: 0,
      teacher_id: '',
      description: '',
    },
  });

  // Populate form when editing/viewing
  useEffect(() => {
    if (mode !== 'create' && subject && id) {
      form.reset(
        {
          class_id: subject.class_info.public_id,
          subject_id: subject.subject_info.id,
          teacher_id: subject.teacher_info?.public_id || '',
          description: subject.description || '',
        },
        {
          keepDefaultValues: false,
        }
      );
    }
  }, [subject, mode, id, form]);

  // Error handler
  const handleFormErrors = (error: Error, fieldErrors?: Record<string, string | undefined>) => {
    if (isDeletedDuplicateError(error)) {
      const message = getDeletedDuplicateMessage(error);
      duplicateHandler.openDialog(message, form.getValues());
      return;
    }

    // Apply field errors to form (toast already shown by mutation)
    if (fieldErrors) {
      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (message) {
          form.setError(field as keyof SubjectFormData, {
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
  const createMutation = useCreateSubject({
    onSuccess: () => {
      toast.success('Subject created successfully');
      navigate(ROUTES.SUBJECTS);
    },
    onError: handleFormErrors,
  });

  const updateMutation = useUpdateSubject({
    onSuccess: () => {
      toast.success('Subject updated successfully');
      navigate(ROUTES.SUBJECTS);
    },
    onError: handleFormErrors,
  });

  // Handle reactivate from duplicate dialog
  const handleReactivate = () => {
    duplicateHandler.closeDialog();
    navigate(`${ROUTES.SUBJECTS}?showDeleted=true`);
  };

  // Handle force create from duplicate dialog
  const handleForceCreate = () => {
    const pendingData = duplicateHandler.pendingData as SubjectFormData | null;
    if (pendingData) {
      createMutation.mutate({
        data: {
          class_id: pendingData.class_id,
          subject_id: pendingData.subject_id,
          teacher_id: pendingData.teacher_id || undefined,
          description: pendingData.description || undefined,
        },
        forceCreate: true,
      });
      duplicateHandler.closeDialog();
    }
  };

  // Form submission
  const onSubmit = (data: SubjectFormData) => {
    if (mode === 'edit' && subject) {
      updateMutation.mutate({
        id: subject.public_id,
        data: {
          teacher_id: data.teacher_id || undefined,
          description: data.description || undefined,
        },
      });
    } else {
      createMutation.mutate({
        data: {
          class_id: data.class_id,
          subject_id: data.subject_id,
          teacher_id: data.teacher_id || undefined,
          description: data.description || undefined,
        },
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Navigation handlers
  const handleBackToList = () => {
    navigate(ROUTES.SUBJECTS);
  };

  const handleSwitchToEdit = () => {
    if (id) {
      navigate(ROUTES.SUBJECTS_EDIT.replace(':id', id));
    }
  };

  // Get page configuration based on mode
  const getPageConfig = () => {
    if (mode === 'create') {
      return {
        title: 'Add New Subject',
        description: 'Fill in the details to create a new subject',
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
        title: 'View Subject Details',
        description: 'View subject information and details',
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
      title: 'Edit Subject',
      description: 'Update subject information',
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

  // Dropdown options
  const classOptions =
    classesData?.data?.map((c) => ({
      value: c.public_id,
      label: `${c.class_master.name} - ${c.name}`,
    })) || [];
  const subjectOptions =
    subjectMastersData?.data?.map((s) => ({
      value: s.id,
      label: `${s.name} (${s.code})`,
    })) || [];
  const teacherOptions =
    teachersData?.data?.map((t) => ({
      value: t.public_id,
      label: `${t.full_name} (${t.employee_id})`,
    })) || [];

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
              {/* Subject Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Subject Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Class Dropdown */}
                  <FormField
                    control={form.control}
                    name="class_id"
                    render={({ field, fieldState }) => (
                      <FormItem
                        ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                      >
                        <FormLabel>
                          Class <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          key={`class-${subject?.public_id || 'new'}-${field.value}`}
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
                            {classOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
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

                  {/* Subject Master Dropdown */}
                  <FormField
                    control={form.control}
                    name="subject_id"
                    render={({ field, fieldState }) => (
                      <FormItem
                        ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                      >
                        <FormLabel>
                          Subject Master <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          key={`subject-${subject?.public_id || 'new'}-${field.value}`}
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString() || ''}
                          disabled={isPending || mode === 'view' || mode === 'edit'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subjectOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value.toString()}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {mode === 'edit' && (
                          <p className="text-sm text-muted-foreground">
                            Subject cannot be changed after creation
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Teacher Dropdown */}
                  <FormField
                    control={form.control}
                    name="teacher_id"
                    render={({ field, fieldState }) => (
                      <FormItem
                        ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                      >
                        <FormLabel>Teacher (Optional)</FormLabel>
                        <Select
                          key={`teacher-${subject?.public_id || 'new'}-${field.value}`}
                          onValueChange={(value) => {
                            // Allow clearing the selection
                            field.onChange(value === 'none' ? '' : value);
                          }}
                          value={field.value || 'none'}
                          disabled={isPending || mode === 'view'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select teacher" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {teacherOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <FormItem
                      ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                    >
                      <FormLabel>Additional Information (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any additional information about this subject"
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
                onCancel={() => navigate(ROUTES.SUBJECTS)}
                submitLabel={mode === 'edit' ? 'Update Subject' : 'Create Subject'}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

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
