/**
 * Student Form Component
 * Handles create, edit, and view modes with data prefilling and error handling
 * Following the pattern from teacher-form.tsx
 */

import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TextInputField, DateInputField, GenderField, BloodGroupField } from '@/components/forms';
import { AddressForm } from '@/components/forms/address-form';
import { useCreateStudent, useUpdateStudent, useReactivateStudent } from '../hooks/mutations';
import { useClasses } from '@/features/classes/hooks/use-classes';
import type { Class } from '@/features/classes/types';
import { useSupervisors } from '../hooks/use-supervisors';
import { studentFormSchema, type StudentFormData } from '../schemas/student-form-schema';
import {
  applyFieldErrors,
  isDeletedDuplicateError,
  getDeletedDuplicateMessage,
  getDeletedRecordId,
} from '@/lib/utils/error-handler';
import type { CreateStudentPayload, Student } from '../types';
import { FormActions } from '@/components/form/form-actions';
import { FormMetadata } from '@/components/form/form-metadata';
import { DeleteConfirmationDialog, DeletedDuplicateDialog } from '@/components/common';
import { useDeletedDuplicateHandler } from '@/hooks/use-deleted-duplicate-handler';
import { RELATIONSHIP_OPTIONS } from '@/constants/form-enums';
import { MinimalStudentFields } from './minimal-student-fields';
import {
  CommonUiText,
  ErrorMessages,
  FormPlaceholders,
  SuccessMessages,
  ToastTitles,
} from '@/constants';
import {
  getStudentFormValuesFromInitialData,
  scrollToFirstFormError,
  shouldShowValidationToast,
  STUDENT_FORM_DEFAULT_VALUES,
  STUDENT_FORM_FIELD_ERROR_MAP,
  transformStudentFormToPayload,
} from '../utils/student-form.utils';

interface StudentFormProps {
  mode: 'create' | 'edit' | 'view';
  studentId?: string;
  initialData?: Student;
  isLoading?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function StudentForm({
  mode,
  studentId,
  initialData,
  isLoading: isLoadingData,
  onSuccess,
  onCancel,
  onDelete,
}: StudentFormProps) {
  const [useQuickAdd, setUseQuickAdd] = useState(false);
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [isPreviousSchoolExpanded, setIsPreviousSchoolExpanded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch classes for selection
  const { data: classesData } = useClasses({ page_size: 100 });
  const classes = useMemo<Class[]>(() => classesData?.data || [], [classesData]);

  // Supervisors (teachers) for supervisor dropdown
  const { supervisors, isLoading: isSupervisorsLoading } = useSupervisors();
  // Duplicate handler for deleted duplicate detection
  const duplicateHandler = useDeletedDuplicateHandler<{
    payload: { classId: string; payload: CreateStudentPayload };
    deletedRecordId?: string | null;
  }>();

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: STUDENT_FORM_DEFAULT_VALUES,
  });

  // Auto-fill supervisor_email when class is selected
  const classId = form.watch('class_id');
  useEffect(() => {
    if (classId && classes.length > 0) {
      const selectedClass = classes.find((c) => c.public_id === classId);
      if (selectedClass?.class_teacher?.email) {
        form.setValue('supervisor_email', selectedClass.class_teacher.email);
      } else {
        // Clear if no class teacher assigned
        form.setValue('supervisor_email', '');
      }
    } else if (!classId) {
      // Clear when no class selected
      form.setValue('supervisor_email', '');
    }
  }, [classId, classes, form]);

  // Prefill form with student data in edit or view mode
  useEffect(() => {
    if (initialData && (mode === 'edit' || mode === 'view')) {
      form.reset(getStudentFormValuesFromInitialData(initialData), { keepDefaultValues: false });
    }
  }, [initialData, mode, form]);

  const createMutation = useCreateStudent({
    onSuccess: () => {
      toast.success(SuccessMessages.STUDENT.CREATE_SUCCESS);
      duplicateHandler.closeDialog();
      onSuccess();
    },
    onError: (error) => {
      // Check if it's a deleted duplicate error
      if (isDeletedDuplicateError(error)) {
        const message = getDeletedDuplicateMessage(error);
        const deletedRecordId = getDeletedRecordId(error);

        const formData = form.getValues();
        const payload = transformStudentFormToPayload(formData);
        duplicateHandler.openDialog(message, {
          payload: { classId: formData.class_id, payload },
          deletedRecordId,
        });
        return;
      }

      const result = applyFieldErrors(error, form.setError, STUDENT_FORM_FIELD_ERROR_MAP);

      // Scroll to first error field if there are field errors
      if (result.hasFieldErrors) {
        scrollToFirstFormError();
      }

      if (!result.hasFieldErrors) {
        toast.error(ErrorMessages.STUDENT.CREATE_FAILED);
      } else if (shouldShowValidationToast(result.toastMessage)) {
        toast.error(ToastTitles.VALIDATION_ERROR, {
          description: result.toastMessage,
        });
      }
    },
  });

  const updateMutation = useUpdateStudent({
    onSuccess: () => {
      toast.success(SuccessMessages.STUDENT.UPDATE_SUCCESS);
      onSuccess();
    },
    onError: (error) => {
      const result = applyFieldErrors(error, form.setError, STUDENT_FORM_FIELD_ERROR_MAP);

      // Scroll to first error field if there are field errors
      if (result.hasFieldErrors) {
        scrollToFirstFormError();
      }

      if (!result.hasFieldErrors) {
        toast.error(ErrorMessages.STUDENT.UPDATE_FAILED);
      } else if (shouldShowValidationToast(result.toastMessage)) {
        toast.error(ToastTitles.VALIDATION_ERROR, {
          description: result.toastMessage,
        });
      }
    },
  });

  const reactivateMutation = useReactivateStudent({
    onSuccess: () => {
      toast.success(SuccessMessages.STUDENT.REACTIVATE_SUCCESS, {
        description: 'The deleted student has been reactivated successfully.',
      });
      duplicateHandler.closeDialog();
      onSuccess();
    },
    onError: () => {
      toast.error(ToastTitles.ERROR, {
        description: ErrorMessages.STUDENT.REACTIVATE_FAILED,
      });
    },
  });

  const handleReactivate = () => {
    const deletedRecordId = duplicateHandler.pendingData?.deletedRecordId;
    const classId = duplicateHandler.pendingData?.payload.classId;

    if (!deletedRecordId || !classId) {
      toast.error(ErrorMessages.STUDENT.NOT_FOUND);
      return;
    }

    reactivateMutation.mutate({ classId, publicId: deletedRecordId });
  };

  const handleForceCreate = () => {
    if (duplicateHandler.pendingData) {
      const { classId, payload } = duplicateHandler.pendingData.payload;
      createMutation.mutate({ classId, payload });
    }
  };

  const onSubmit = (data: StudentFormData) => {
    const payload = transformStudentFormToPayload(data);

    if (mode === 'create') {
      createMutation.mutate({ classId: data.class_id, payload });
    } else if (mode === 'edit' && studentId && initialData) {
      updateMutation.mutate({
        classId: data.class_id,
        publicId: studentId,
        payload: payload,
      });
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    setShowDeleteDialog(false);
    if (onDelete) {
      onDelete();
    }
  };

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isLoading = isLoadingData || createMutation.isPending || updateMutation.isPending;

  // Watch class selection to enable/disable form fields
  const selectedClassId = form.watch('class_id');
  const isClassSelected = mode !== 'create' || !!selectedClassId;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Quick Add Toggle - Only for create mode */}
          {mode === 'create' && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="quick-add" className="text-sm font-medium">
                    Quick Add (Only Required Fields)
                  </Label>
                  <Switch
                    id="quick-add"
                    checked={useQuickAdd}
                    onCheckedChange={setUseQuickAdd}
                    disabled={isViewMode}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Class Selection - Required First Step */}
          <Card className="border-primary/50 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  1
                </span>
                Select Class
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="class_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Class <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      key={`${initialData?.public_id}-${field.value}`}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isViewMode}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={FormPlaceholders.SELECT_CLASS} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.public_id} value={cls.public_id}>
                            {cls.class_master.name} - {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supervisor_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supervisor (Class Teacher)</FormLabel>
                    <Select
                      key={`supervisor-${field.value}`}
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      disabled={isViewMode || isSupervisorsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isSupervisorsLoading
                                ? CommonUiText.LOADING
                                : FormPlaceholders.SELECT_SUPERVISOR
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {supervisors.map((teacher) => (
                          <SelectItem key={teacher.email} value={teacher.email}>
                            {teacher.full_name} ({teacher.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Show message if class not selected in create mode */}
          {!isClassSelected && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <p className="text-sm text-amber-800">
                  Please select a class to continue filling the student information.
                </p>
              </CardContent>
            </Card>
          )}

          {mode === 'create' && useQuickAdd ? (
            <MinimalStudentFields control={form.control} disabled={!isClassSelected} />
          ) : (
            <>
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInputField
                    control={form.control}
                    name="first_name"
                    label="First Name"
                    placeholder={FormPlaceholders.ENTER_FIRST_NAME}
                    disabled={isViewMode || !isClassSelected}
                    required
                    validationType="name"
                    validationOptions={{ fieldName: 'First name' }}
                  />
                  <TextInputField
                    control={form.control}
                    name="last_name"
                    label="Last Name"
                    placeholder={FormPlaceholders.ENTER_LAST_NAME}
                    disabled={isViewMode || !isClassSelected}
                    required
                    validationType="name"
                    validationOptions={{ fieldName: 'Last name' }}
                  />
                  <TextInputField
                    control={form.control}
                    name="roll_number"
                    label="Roll Number"
                    placeholder={FormPlaceholders.ENTER_ROLL_NUMBER}
                    disabled={isViewMode || !isClassSelected}
                    required
                    validationType="alphanumeric"
                  />
                  <TextInputField
                    control={form.control}
                    name="email"
                    label="Email"
                    type="email"
                    placeholder={FormPlaceholders.ENTER_EMAIL}
                    disabled={isViewMode || !isClassSelected}
                    validationType="email"
                  />
                  <TextInputField
                    control={form.control}
                    name="phone"
                    label="Phone"
                    placeholder={FormPlaceholders.ENTER_PHONE_NUMBER}
                    disabled={isViewMode || !isClassSelected}
                    validationType="phone"
                  />
                  <GenderField
                    control={form.control}
                    name="gender"
                    disabled={isViewMode || !isClassSelected}
                  />
                  <BloodGroupField
                    control={form.control}
                    name="blood_group"
                    disabled={isViewMode || !isClassSelected}
                  />
                  <DateInputField
                    control={form.control}
                    name="date_of_birth"
                    label="Date of Birth"
                    disabled={isViewMode || !isClassSelected}
                  />
                </CardContent>
              </Card>

              {/* Admission Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">Admission Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInputField
                    control={form.control}
                    name="admission_number"
                    label="Admission Number"
                    placeholder={FormPlaceholders.ENTER_ADMISSION_NUMBER}
                    disabled={isViewMode || !isClassSelected}
                    validationType="alphanumeric"
                  />
                  <DateInputField
                    control={form.control}
                    name="admission_date"
                    label="Admission Date"
                    disabled={isViewMode || !isClassSelected}
                  />
                </CardContent>
              </Card>

              {/* Guardian Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">Guardian Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextInputField
                    control={form.control}
                    name="guardian_name"
                    label="Guardian Name"
                    placeholder={FormPlaceholders.ENTER_GUARDIAN_NAME}
                    disabled={isViewMode || !isClassSelected}
                    validationType="name"
                    validationOptions={{ fieldName: 'Guardian name' }}
                  />
                  <TextInputField
                    control={form.control}
                    name="guardian_phone"
                    label="Guardian Phone"
                    placeholder={FormPlaceholders.ENTER_GUARDIAN_PHONE}
                    disabled={isViewMode || !isClassSelected}
                    validationType="phone"
                  />
                  <TextInputField
                    control={form.control}
                    name="guardian_email"
                    label="Guardian Email"
                    type="email"
                    placeholder={FormPlaceholders.ENTER_GUARDIAN_EMAIL}
                    disabled={isViewMode || !isClassSelected}
                    validationType="email"
                  />
                  <FormField
                    control={form.control}
                    name="guardian_relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship</FormLabel>
                        <Select
                          key={`${initialData?.public_id}-${field.value}`}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isViewMode || !isClassSelected}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={FormPlaceholders.SELECT_RELATIONSHIP} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RELATIONSHIP_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Medical & Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">
                    Medical & Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="medical_conditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Conditions</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={FormPlaceholders.MEDICAL_CONDITIONS}
                            disabled={isViewMode || !isClassSelected}
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={FormPlaceholders.ENTER_ADDITIONAL_NOTES}
                            disabled={isViewMode || !isClassSelected}
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Previous School Information */}
              <Card>
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setIsPreviousSchoolExpanded(!isPreviousSchoolExpanded)}
                >
                  <CardTitle className="flex items-center justify-between text-base font-medium">
                    <span>Previous School Information (Optional)</span>
                    {isPreviousSchoolExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </CardTitle>
                </CardHeader>
                {isPreviousSchoolExpanded && (
                  <CardContent className="space-y-4">
                    <TextInputField
                      control={form.control}
                      name="previous_school_name"
                      label="Previous School Name"
                      placeholder={FormPlaceholders.ENTER_PREVIOUS_SCHOOL_NAME}
                      disabled={isViewMode || !isClassSelected}
                      validationType="text"
                      validationOptions={{ fieldName: 'Previous school name', maxLength: 255 }}
                    />
                    <TextInputField
                      control={form.control}
                      name="previous_school_class"
                      label="Previous School Class"
                      placeholder={FormPlaceholders.ENTER_PREVIOUS_CLASS}
                      disabled={isViewMode || !isClassSelected}
                      validationType="text"
                      validationOptions={{ fieldName: 'Previous school class', maxLength: 50 }}
                    />
                    <FormField
                      control={form.control}
                      name="previous_school_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previous School Address</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder={FormPlaceholders.ENTER_PREVIOUS_SCHOOL_ADDRESS}
                              disabled={isViewMode}
                              className="min-h-[80px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                )}
              </Card>

              {/* Address */}
              <Card>
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setIsAddressExpanded(!isAddressExpanded)}
                >
                  <CardTitle className="flex items-center justify-between text-base font-medium">
                    <span>Address (Optional)</span>
                    {isAddressExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </CardTitle>
                </CardHeader>
                {isAddressExpanded && (
                  <CardContent>
                    <AddressForm
                      form={form}
                      disabled={isViewMode || !isClassSelected}
                      fieldNames={{
                        addressType: 'addressType',
                        streetAddress: 'streetAddress',
                        addressLine2: 'addressLine2',
                        city: 'city',
                        state: 'state',
                        zipCode: 'zipCode',
                        country: 'country',
                      }}
                    />
                  </CardContent>
                )}
              </Card>

              {/* Metadata */}
              {(isEditMode || isViewMode) && initialData && (
                <FormMetadata
                  createdAt={initialData.created_at}
                  updatedAt={initialData.updated_at}
                />
              )}
            </>
          )}

          {/* Form Actions */}
          <FormActions
            mode={mode}
            onCancel={onCancel}
            onDelete={isEditMode && onDelete ? handleDelete : undefined}
            showDelete={isEditMode && !!onDelete}
            isSubmitting={isLoading}
            submitLabel={mode === 'create' ? 'Create Student' : 'Update Student'}
          />
        </form>
      </Form>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Student"
        itemName={
          initialData
            ? `${initialData.user_info.full_name} (${initialData.roll_number})`
            : undefined
        }
        isSoftDelete={true}
      />

      {/* Deleted Duplicate Dialog */}
      <DeletedDuplicateDialog
        open={duplicateHandler.isOpen}
        onOpenChange={duplicateHandler.closeDialog}
        message={duplicateHandler.message}
        onReactivate={handleReactivate}
        onCreateNew={handleForceCreate}
      />
    </>
  );
}
