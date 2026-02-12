/**
 * Class Form Page - Add/Edit/View Class
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useCreateClass, useUpdateClass } from '../hooks/mutations';
import { useClass } from '../hooks/use-classes';
import { useTeachers } from '@/features/teachers/hooks/use-teachers';
import { ROUTES } from '@/constants/app-config';

const STANDARDS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];
const currentYear = new Date().getFullYear();
const ACADEMIC_YEARS = [
  `${currentYear - 1}-${currentYear}`,
  `${currentYear}-${currentYear + 1}`,
  `${currentYear + 1}-${currentYear + 2}`,
];

const classSchema = z.object({
  standard: z.string().min(1, 'Standard is required'),
  section: z.string().min(1, 'Section is required'),
  academic_year: z.string().min(1, 'Academic year is required'),
  class_teacher: z.string().optional(),
  capacity: z.string().optional(),
});

type ClassFormData = z.infer<typeof classSchema>;

export default function ClassFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'edit';
  const isViewMode = mode === 'view';
  const isEditing = !!id && mode !== 'view';
  const firstErrorRef = useRef<HTMLDivElement>(null);

  // Fetch class data if editing/viewing
  const { data: classItem } = useClass(id);

  // Fetch teachers for dropdown
  const { data: teachersResponse } = useTeachers({ page_size: 1000 });
  const teachers = teachersResponse?.results || [];

  const form = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      standard: '',
      section: '',
      academic_year: ACADEMIC_YEARS[1],
      class_teacher: '',
      capacity: '',
    },
  });

  // Populate form when editing/viewing
  useEffect(() => {
    if ((isEditing || isViewMode) && classItem) {
      form.reset({
        standard: classItem.standard.toString(),
        section: classItem.section,
        academic_year: classItem.academic_year,
        class_teacher: classItem.class_teacher?.public_id || '',
        capacity: classItem.capacity?.toString() || '',
      });
    }
  }, [classItem, isEditing, isViewMode, form]);

  // Error handler
  const handleFormErrors = (_error: Error, fieldErrors?: Record<string, string | undefined>) => {
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
    onSuccess: () => navigate(ROUTES.CLASSES),
    onError: handleFormErrors,
  });

  const updateMutation = useUpdateClass({
    onSuccess: () => navigate(ROUTES.CLASSES),
    onError: handleFormErrors,
  });

  // Form submission
  const onSubmit = (data: ClassFormData) => {
    if (isEditing && classItem) {
      updateMutation.mutate({
        publicId: classItem.public_id,
        payload: {
          standard: Number(data.standard),
          section: data.section,
          class_teacher: data.class_teacher || undefined,
          academic_year: data.academic_year,
          capacity: data.capacity ? Number(data.capacity) : undefined,
        },
      });
    } else {
      createMutation.mutate({
        standard: Number(data.standard),
        section: data.section,
        class_teacher: data.class_teacher || undefined,
        academic_year: data.academic_year,
        capacity: data.capacity ? Number(data.capacity) : undefined,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isViewMode ? 'View Class' : isEditing ? 'Edit Class' : 'Add New Class'}
        description={
          isViewMode
            ? 'View class information'
            : isEditing
              ? 'Update the class information below'
              : 'Fill in the details to create a new class'
        }
        actions={
          isViewMode && id
            ? [
                {
                  label: 'Edit',
                  onClick: () => navigate(ROUTES.CLASSES_EDIT.replace(':id', id)),
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
              {/* Class Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Class Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Standard */}
                  <FormField
                    control={form.control}
                    name="standard"
                    render={({ field, fieldState }) => (
                      <FormItem
                        ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                      >
                        <FormLabel>
                          Standard <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isPending || isViewMode}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select standard" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STANDARDS.map((std) => (
                              <SelectItem key={std} value={std}>
                                Standard {std}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Section */}
                  <FormField
                    control={form.control}
                    name="section"
                    render={({ field, fieldState }) => (
                      <FormItem
                        ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                      >
                        <FormLabel>
                          Section <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isPending || isViewMode}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select section" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SECTIONS.map((sec) => (
                              <SelectItem key={sec} value={sec}>
                                Section {sec}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Academic Year */}
                  <FormField
                    control={form.control}
                    name="academic_year"
                    render={({ field, fieldState }) => (
                      <FormItem
                        ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                      >
                        <FormLabel>
                          Academic Year <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isPending || isViewMode}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select academic year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ACADEMIC_YEARS.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            disabled={isPending || isViewMode}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isPending || isViewMode}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class teacher" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {teachers.map((teacher) => (
                            <SelectItem key={teacher.public_id} value={teacher.public_id}>
                              {teacher.user.full_name} ({teacher.employee_id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    onClick={() => navigate(ROUTES.CLASSES)}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving...' : isEditing ? 'Update Class' : 'Create Class'}
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
