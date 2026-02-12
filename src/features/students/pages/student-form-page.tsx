/**
 * Student Form Page - Add/Edit/View Student
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CalendarIcon, Edit } from 'lucide-react';
import { format } from 'date-fns';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCreateStudent, useUpdateStudent } from '../hooks/mutations';
import { useStudent } from '../hooks/use-students';
import { ROUTES } from '@/constants/app-config';
import { cn } from '@/lib/utils';

const studentSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  student_id: z.string().min(1, 'Student ID is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  parent_name: z.string().optional(),
  parent_phone: z.string().optional(),
  parent_email: z.string().email('Invalid parent email').optional().or(z.literal('')),
});

type StudentFormData = z.infer<typeof studentSchema>;

export default function StudentFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'edit'; // 'view', 'edit', or 'create'
  const isViewMode = mode === 'view';
  const isEditing = !!id && mode !== 'view';
  const firstErrorRef = useRef<HTMLDivElement>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Fetch student data if editing
  const { data: student } = useStudent(id);

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      student_id: '',
      date_of_birth: '',
      email: '',
      phone: '',
      parent_name: '',
      parent_phone: '',
      parent_email: '',
    },
  });

  useEffect(() => {
    if (student && isEditing) {
      const fullName = student.user.full_name || '';
      const names = fullName.split(' ');
      const firstName = names[0] || '';
      const lastName = names.slice(1).join(' ') || '';

      form.reset({
        first_name: firstName,
        last_name: lastName,
        student_id: student.student_id,
        date_of_birth: student.date_of_birth,
        email: student.user.email,
        phone: student.user.phone || '',
        parent_name: student.parent_name || '',
        parent_phone: student.parent_phone || '',
        parent_email: student.parent_email || '',
      });
    }
  }, [student, isEditing, form]);

  // Handle form errors
  const handleFormErrors = (_error: Error, fieldErrors?: Record<string, string | undefined>) => {
    if (fieldErrors) {
      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (message) {
          form.setError(field as keyof StudentFormData, {
            type: 'manual',
            message: String(message),
          });
        }
      });

      // Auto-focus first error field
      setTimeout(() => {
        firstErrorRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        firstErrorRef.current?.querySelector('input')?.focus();
      }, 100);
    }
  };

  // Mutations with callbacks
  const createMutation = useCreateStudent({
    onSuccess: () => navigate(ROUTES.STUDENTS),
    onError: handleFormErrors,
  });

  const updateMutation = useUpdateStudent({
    onSuccess: () => navigate(ROUTES.STUDENTS),
    onError: handleFormErrors,
  });

  const onSubmit = (data: StudentFormData) => {
    if (isEditing && student) {
      updateMutation.mutate({
        publicId: student.public_id,
        payload: data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isViewMode ? 'View Student' : isEditing ? 'Edit Student' : 'Add New Student'}
        description={
          isViewMode
            ? 'View student information.'
            : isEditing
              ? 'Update the student information below.'
              : 'Fill in the details to create a new student.'
        }
      >
        <div className="flex gap-2">
          {isViewMode && (
            <Button
              variant="default"
              onClick={() => navigate(`/students/${id}/edit`)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate(ROUTES.STUDENTS)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Student Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field, fieldState }) => (
                      <FormItem
                        ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                      >
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John" disabled={isPending || isViewMode} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field, fieldState }) => (
                      <FormItem
                        ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                      >
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Doe" disabled={isPending || isViewMode} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="student_id"
                    render={({ field, fieldState }) => (
                      <FormItem
                        ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                      >
                        <FormLabel>Student ID *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="STU001"
                            disabled={isPending || isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field, fieldState }) => (
                      <FormItem
                        ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                      >
                        <FormLabel>Date of Birth *</FormLabel>
                        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                                disabled={isPending || isViewMode}
                              >
                                {field.value ? format(new Date(field.value), 'PPP') : 'Pick a date'}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => {
                                field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                                setDatePickerOpen(false);
                              }}
                              disabled={(date) =>
                                date > new Date() || date < new Date('1900-01-01')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <FormItem
                        ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                      >
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="student@example.com"
                            disabled={isPending || isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field, fieldState }) => (
                      <FormItem
                        ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                      >
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="+1234567890"
                            disabled={isPending || isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Parent Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Parent/Guardian Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="parent_name"
                    render={({ field, fieldState }) => (
                      <FormItem
                        ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                      >
                        <FormLabel>Parent/Guardian Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Jane Doe"
                            disabled={isPending || isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parent_phone"
                    render={({ field, fieldState }) => (
                      <FormItem
                        ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                      >
                        <FormLabel>Parent/Guardian Phone</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="+1234567890"
                            disabled={isPending || isViewMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="parent_email"
                  render={({ field, fieldState }) => (
                    <FormItem
                      ref={fieldState.error && !firstErrorRef.current ? firstErrorRef : null}
                    >
                      <FormLabel>Parent/Guardian Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="parent@example.com"
                          disabled={isPending || isViewMode}
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
                    onClick={() => navigate(ROUTES.STUDENTS)}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving...' : isEditing ? 'Update Student' : 'Create Student'}
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
