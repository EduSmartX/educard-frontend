/**
 * Teacher Form Component
 * Handles create, edit, and view modes with data prefilling and error handling
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TextInputField, DateInputField, GenderField, BloodGroupField } from '@/components/forms';
import { AddressForm } from '@/components/forms/address-form';
import { OrganizationRoleField } from '@/components/forms/organization-role-field';
import { SupervisorField } from '@/components/forms/supervisor-field';
import { ADDRESS_TYPE } from '@/constants/address-type';
import { useCreateTeacher, useUpdateTeacher, useReactivateTeacher } from '../hooks/mutations';
import {
  teacherFormSchema,
  minimalTeacherSchema,
  type TeacherFormValues,
} from '../schemas/teacher-form-schema';
import {
  applyFieldErrors,
  isDeletedDuplicateError,
  getDeletedDuplicateMessage,
  getDeletedRecordId,
} from '@/lib/utils/error-handler';
import type { TeacherDetail } from '../types';
import { transformFormToPayload, transformTeacherToForm } from '../utils/form-utils';
import { SubjectsMultiSelectField } from '@/components/form/subjects-multi-select-field';
import { FormActions } from '@/components/form/form-actions';
import { FormMetadata } from '@/components/form/form-metadata';
import { DeleteConfirmationDialog, DeletedDuplicateDialog } from '@/components/common';
import { useDeletedDuplicateHandler } from '@/hooks/use-deleted-duplicate-handler';
import type { CreateTeacherPayload } from '../types';

/**
 * Scroll to the first field with an error
 * Helps users quickly identify validation issues
 */
function scrollToFirstError() {
  // Small delay to ensure DOM is updated with error messages
  setTimeout(() => {
    // Find the first element with an error message
    const firstError = document.querySelector('[data-error="true"], [aria-invalid="true"]');

    if (firstError) {
      firstError.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Focus on the input if it's focusable
      const input = firstError.querySelector('input, textarea, select');
      if (input instanceof HTMLElement) {
        input.focus();
      }
    }
  }, 100);
}

interface TeacherFormProps {
  mode: 'create' | 'edit' | 'view';
  teacherId?: string;
  initialData?: TeacherDetail;
  isLoading?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function TeacherForm({
  mode,
  teacherId,
  initialData,
  isLoading: isLoadingData,
  onSuccess,
  onCancel,
  onDelete,
}: TeacherFormProps) {
  const [useQuickAdd, setUseQuickAdd] = useState(false);
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Duplicate handler for deleted duplicate detection
  const duplicateHandler = useDeletedDuplicateHandler<{
    payload: CreateTeacherPayload;
    deletedRecordId?: string | null;
  }>();

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(useQuickAdd ? minimalTeacherSchema : teacherFormSchema),
    defaultValues: {
      employee_id: '',
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      gender: undefined,
      organization_role: undefined,
      blood_group: undefined,
      designation: '',
      highest_qualification: '',
      specialization: '',
      experience_years: undefined,
      supervisor_email: undefined,
      date_of_birth: undefined,
      joining_date: undefined,
      subjects: [],
      address_type: ADDRESS_TYPE.USER_CURRENT,
      street_address: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      emergency_contact_name: '',
      emergency_contact_number: '',
    },
  });

  // Prefill form with teacher data in edit or view mode
  useEffect(() => {
    if (initialData) {
      const formData = transformTeacherToForm(initialData);
      form.reset(formData as TeacherFormValues);
    }
  }, [initialData, form]);

  const createMutation = useCreateTeacher({
    onSuccess: () => {
      toast.success('Teacher created successfully!');
      duplicateHandler.closeDialog();
      onSuccess();
    },
    onError: (error) => {
      // Check if it's a deleted duplicate error - show dialog instead of toast
      if (isDeletedDuplicateError(error)) {
        const message = getDeletedDuplicateMessage(error);
        const deletedRecordId = getDeletedRecordId(error);

        // Store the current payload and deleted record ID for potential reactivation or force create
        const payload = transformFormToPayload(form.getValues());
        duplicateHandler.openDialog(message, { payload, deletedRecordId });
        // Don't show any toast - the dialog is enough
        return;
      }

      // Map nested user fields to form fields
      const fieldMap = {
        'user.email': 'email',
        'user.first_name': 'first_name',
        'user.last_name': 'last_name',
        'user.phone': 'phone',
        'user.gender': 'gender',
        'user.date_of_birth': 'date_of_birth',
        'user.blood_group': 'blood_group',
        'user.organization_role_code': 'organization_role',
        'user.supervisor_email': 'supervisor_email',
        'user.address.street_address': 'street_address',
        'user.address.address_line_2': 'address_line_2',
        'user.address.city': 'city',
        'user.address.state': 'state',
        'user.address.zip_code': 'postal_code',
        'user.address.postal_code': 'postal_code',
        'user.address.country': 'country',
      } as const;

      const result = applyFieldErrors(error, form.setError, fieldMap);

      // Scroll to first error field if there are field errors
      if (result.hasFieldErrors) {
        scrollToFirstError();
      }

      if (!result.hasFieldErrors) {
        toast.error('Failed to create teacher. Please try again.');
      } else if (
        result.toastMessage &&
        result.toastMessage !== 'Please check the form fields for errors'
      ) {
        // Show toast only for non-field errors, not for general validation summary
        toast.error('Validation Error', {
          description: result.toastMessage,
        });
      }
    },
  });

  const updateMutation = useUpdateTeacher({
    onSuccess: () => {
      toast.success('Teacher updated successfully!');
      onSuccess();
    },
    onError: (error) => {
      // Map nested user fields to form fields (same as create)
      const fieldMap = {
        'user.email': 'email',
        'user.first_name': 'first_name',
        'user.last_name': 'last_name',
        'user.phone': 'phone',
        'user.gender': 'gender',
        'user.date_of_birth': 'date_of_birth',
        'user.blood_group': 'blood_group',
        'user.organization_role_code': 'organization_role',
        'user.supervisor_email': 'supervisor_email',
        'user.address.street_address': 'street_address',
        'user.address.address_line_2': 'address_line_2',
        'user.address.city': 'city',
        'user.address.state': 'state',
        'user.address.zip_code': 'postal_code',
        'user.address.postal_code': 'postal_code',
        'user.address.country': 'country',
      } as const;

      const result = applyFieldErrors(error, form.setError, fieldMap);

      // Scroll to first error field if there are field errors
      if (result.hasFieldErrors) {
        scrollToFirstError();
      }

      if (!result.hasFieldErrors) {
        toast.error('Failed to update teacher. Please try again.');
      } else if (
        result.toastMessage &&
        result.toastMessage !== 'Please check the form fields for errors'
      ) {
        // Show toast only for non-field errors, not for general validation summary
        toast.error('Validation Error', {
          description: result.toastMessage,
        });
      }
    },
  });

  const reactivateMutation = useReactivateTeacher({
    onSuccess: () => {
      toast.success('Teacher Reactivated', {
        description: 'The deleted teacher has been reactivated successfully. You can now edit it.',
      });
      duplicateHandler.closeDialog();
      onSuccess(); // Refresh the list or close the form
    },
    onError: () => {
      toast.error('Failed to Reactivate', {
        description: 'Could not reactivate the teacher. Please try again.',
      });
    },
  });

  const handleReactivate = () => {
    const deletedRecordId = duplicateHandler.pendingData?.deletedRecordId;

    if (!deletedRecordId) {
      toast.error('Cannot find the deleted teacher record to reactivate.');
      return;
    }

    // Reactivate the deleted teacher
    reactivateMutation.mutate(deletedRecordId);
  };

  const handleForceCreate = () => {
    if (duplicateHandler.pendingData) {
      createMutation.mutate({
        payload: duplicateHandler.pendingData.payload,
        forceCreate: true,
      });
    }
  };

  const onSubmit = (data: TeacherFormValues) => {
    const payload = transformFormToPayload(data);

    if (mode === 'create') {
      createMutation.mutate({ payload });
    } else if (mode === 'edit' && teacherId) {
      updateMutation.mutate({ publicId: teacherId, payload: payload });
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

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInputField
                control={form.control}
                name="employee_id"
                label="Employee ID"
                placeholder="Enter employee ID"
                disabled={isViewMode}
                required
                validationType="employeeId"
              />
              <TextInputField
                control={form.control}
                name="email"
                label="Email"
                type="email"
                placeholder="Enter email"
                disabled={isViewMode}
                required
                validationType="email"
              />
              <TextInputField
                control={form.control}
                name="first_name"
                label="First Name"
                placeholder="Enter first name"
                disabled={isViewMode}
                required
                validationType="name"
                validationOptions={{ fieldName: 'First name' }}
              />
              <TextInputField
                control={form.control}
                name="last_name"
                label="Last Name"
                placeholder="Enter last name"
                disabled={isViewMode}
                required
                validationType="name"
                validationOptions={{ fieldName: 'Last name' }}
              />
              <GenderField control={form.control} name="gender" disabled={isViewMode} required />
              <OrganizationRoleField
                control={form.control}
                name="organization_role"
                disabled={isViewMode}
                required
              />
              {!useQuickAdd && (
                <>
                  <TextInputField
                    control={form.control}
                    name="phone"
                    label="Phone"
                    placeholder="Enter phone number"
                    disabled={isViewMode}
                    required
                    validationType="phone"
                  />
                  <BloodGroupField
                    control={form.control}
                    name="blood_group"
                    disabled={isViewMode}
                  />
                  <DateInputField
                    control={form.control}
                    name="date_of_birth"
                    label="Date of Birth"
                    disabled={isViewMode}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Professional Details */}
          {!useQuickAdd && (
            <Card>
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInputField
                  control={form.control}
                  name="designation"
                  label="Designation"
                  placeholder="e.g., Senior Teacher"
                  disabled={isViewMode}
                  validationType="text"
                  validationOptions={{ fieldName: 'Designation', maxLength: 100 }}
                />
                <TextInputField
                  control={form.control}
                  name="highest_qualification"
                  label="Qualification"
                  placeholder="e.g., M.Ed, B.Sc"
                  disabled={isViewMode}
                  validationType="text"
                  validationOptions={{ fieldName: 'Qualification', maxLength: 200 }}
                />
                <TextInputField
                  control={form.control}
                  name="specialization"
                  label="Specialization"
                  placeholder="e.g., Mathematics, Science"
                  disabled={isViewMode}
                  validationType="text"
                  validationOptions={{ fieldName: 'Specialization', maxLength: 200 }}
                />
                <TextInputField
                  control={form.control}
                  name="experience_years"
                  label="Experience (Years)"
                  type="number"
                  placeholder="Enter years of experience"
                  disabled={isViewMode}
                  validationType="numeric"
                  validationOptions={{
                    fieldName: 'Experience',
                    min: 0,
                    max: 70,
                    allowDecimal: false,
                  }}
                />
                <SupervisorField
                  control={form.control}
                  name="supervisor_email"
                  disabled={isViewMode}
                />
                <SubjectsMultiSelectField
                  control={form.control}
                  name="subjects"
                  disabled={isViewMode}
                />
                <DateInputField
                  control={form.control}
                  name="joining_date"
                  label="Date of Joining"
                  disabled={isViewMode}
                />
                <DateInputField
                  control={form.control}
                  name="admission_date"
                  label="Admission Date"
                  disabled={isViewMode}
                />
              </CardContent>
            </Card>
          )}

          {/* Emergency Contact */}
          {!useQuickAdd && (
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInputField
                  control={form.control}
                  name="emergency_contact_name"
                  label="Emergency Contact Name"
                  placeholder="Enter contact name"
                  disabled={isViewMode}
                  validationType="name"
                  validationOptions={{ fieldName: 'Contact name' }}
                />
                <TextInputField
                  control={form.control}
                  name="emergency_contact_number"
                  label="Emergency Contact Phone"
                  placeholder="Enter contact phone"
                  disabled={isViewMode}
                  validationType="phone"
                />
              </CardContent>
            </Card>
          )}

          {/* Address */}
          {!useQuickAdd && (
            <Card>
              <CardHeader
                className="cursor-pointer"
                onClick={() => setIsAddressExpanded(!isAddressExpanded)}
              >
                <CardTitle className="flex items-center justify-between">
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
                    disabled={isViewMode}
                    fieldNames={{
                      addressType: 'address_type',
                      streetAddress: 'street_address',
                      city: 'city',
                      state: 'state',
                      zipCode: 'postal_code',
                      country: 'country',
                    }}
                  />
                </CardContent>
              )}
            </Card>
          )}

          {/* Metadata (Created/Updated info) - Only show in edit/view mode */}
          {(isEditMode || isViewMode) && initialData && (
            <FormMetadata createdAt={initialData.created_at} updatedAt={initialData.updated_at} />
          )}

          {/* Form Actions */}
          <FormActions
            mode={mode}
            onCancel={onCancel}
            onDelete={isEditMode && onDelete ? handleDelete : undefined}
            showDelete={isEditMode && !!onDelete}
            isSubmitting={isLoading}
            submitLabel={mode === 'create' ? 'Create Teacher' : 'Update Teacher'}
          />
        </form>
      </Form>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Teacher"
        itemName={
          initialData
            ? `${initialData.user.first_name} ${initialData.user.last_name} (${initialData.employee_id})`
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
