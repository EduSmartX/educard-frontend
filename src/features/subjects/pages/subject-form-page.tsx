/**
 * Subject Form Page - Add/Edit/View Subject
 */

import { useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit } from 'lucide-react';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateSubject, useUpdateSubject } from '../hooks/mutations';
import { useSubject } from '../hooks/use-subjects';
import { ROUTES } from '@/constants/app-config';

const subjectSchema = z.object({
  subject_name: z.string().min(1, 'Subject name is required'),
  subject_code: z.string().min(1, 'Subject code is required'),
  description: z.string().optional(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

export default function SubjectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'edit';
  const isViewMode = mode === 'view';
  const isEditing = !!id && mode !== 'view';
  const firstErrorRef = useRef<HTMLDivElement>(null);

  // Fetch subject data if editing/viewing
  const { data: subject } = useSubject(id);

  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      subject_name: '',
      subject_code: '',
      description: '',
    },
  });

  // Populate form when editing/viewing
  useEffect(() => {
    if ((isEditing || isViewMode) && subject) {
      form.reset({
        subject_name: subject.subject_name,
        subject_code: subject.subject_code,
        description: subject.description || '',
      });
    }
  }, [subject, isEditing, isViewMode, form]);

  // Error handler
  const handleFormErrors = (_error: Error, fieldErrors?: Record<string, string | undefined>) => {
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
    onSuccess: () => navigate(ROUTES.SUBJECTS),
    onError: handleFormErrors,
  });

  const updateMutation = useUpdateSubject({
    onSuccess: () => navigate(ROUTES.SUBJECTS),
    onError: handleFormErrors,
  });

  // Form submission
  const onSubmit = (data: SubjectFormData) => {
    if (isEditing && subject) {
      updateMutation.mutate({
        publicId: subject.public_id,
        payload: {
          subject_name: data.subject_name,
          subject_code: data.subject_code,
          description: data.description || undefined,
        },
      });
    } else {
      createMutation.mutate({
        subject_name: data.subject_name,
        subject_code: data.subject_code,
        description: data.description || undefined,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isViewMode ? 'View Subject' : isEditing ? 'Edit Subject' : 'Add New Subject'}
        description={
          isViewMode
            ? 'View subject information'
            : isEditing
              ? 'Update the subject information below'
              : 'Fill in the details to create a new subject'
        }
        actions={
          isViewMode && id
            ? [
                {
                  label: 'Edit',
                  onClick: () => navigate(ROUTES.SUBJECTS_EDIT.replace(':id', id)),
                  variant: 'outline',
                  icon: Edit,
                },
              ]
            : undefined
        }
      />

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Subject Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Subject Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Subject Name */}
                  <FormField
                    control={form.control}
                    name="subject_name"
                    render={({ field, fieldState }) => (
                      <FormItem
                        ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                      >
                        <FormLabel>
                          Subject Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter subject name"
                            disabled={isPending || isViewMode}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Subject Code */}
                  <FormField
                    control={form.control}
                    name="subject_code"
                    render={({ field, fieldState }) => (
                      <FormItem
                        ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                      >
                        <FormLabel>
                          Subject Code <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter subject code"
                            disabled={isPending || isViewMode}
                            {...field}
                          />
                        </FormControl>
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
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter subject description"
                          rows={4}
                          disabled={isPending || isViewMode}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Form Actions */}
              {!isViewMode && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(ROUTES.SUBJECTS)}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving...' : isEditing ? 'Update Subject' : 'Create Subject'}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
