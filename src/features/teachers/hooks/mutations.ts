/**
 * Teacher Mutations
 * All React Query mutations for Teacher CRUD operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage, getFieldErrors } from '@/lib/utils/error-handler';
import type { CreateTeacherPayload, UpdateTeacherPayload } from '../types';
import {
  createTeacher,
  updateTeacher,
  deleteTeacher,
  reactivateTeacher,
  bulkUploadTeachers,
} from '../api/teachers-api';

/**
 * Field errors for teacher forms
 */
export interface TeacherFieldErrors {
  employee_id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  blood_group?: string;
  date_of_birth?: string;
  designation?: string;
  highest_qualification?: string;
  specialization?: string;
  experience_years?: string;
  joining_date?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  street_address?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  subjects?: string;
  [key: string]: string | undefined;
}

/**
 * Mutation options
 */
export interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error, fieldErrors?: TeacherFieldErrors) => void;
}

/**
 * Hook to create a teacher
 */
export function useCreateTeacher(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      forceCreate,
    }: {
      payload: CreateTeacherPayload;
      forceCreate?: boolean;
    }) => createTeacher(payload, forceCreate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });

      toast.success('Teacher Created', {
        description: 'The teacher has been created successfully.',
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, 'Failed to create teacher. Please try again.');
      const fieldErrors = getFieldErrors(error) as TeacherFieldErrors | undefined;

      // Only show toast if no custom error handler is provided
      // If custom handler exists, let it decide whether to show toast or dialog
      if (!options?.onError) {
        toast.error('Error Creating Teacher', {
          description: errorMessage,
          duration: 5000,
        });
      }

      options?.onError?.(error, fieldErrors);
    },
  });
}

/**
 * Hook to reactivate a deleted teacher
 */
export function useReactivateTeacher(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => reactivateTeacher(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });

      toast.success('Teacher Reactivated', {
        description: 'The teacher has been reactivated successfully.',
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(
        error,
        'Failed to reactivate teacher. Please try again.'
      );

      toast.error('Error Reactivating Teacher', {
        description: errorMessage,
        duration: 5000,
      });

      options?.onError?.(error);
    },
  });
}

/**
 * Hook to update a teacher
 */
export function useUpdateTeacher(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, payload }: { publicId: string; payload: UpdateTeacherPayload }) =>
      updateTeacher(publicId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });

      toast.success('Teacher Updated', {
        description: 'The teacher has been updated successfully.',
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, 'Failed to update teacher. Please try again.');
      const fieldErrors = getFieldErrors(error) as TeacherFieldErrors | undefined;

      toast.error('Error Updating Teacher', {
        description: errorMessage,
        duration: 5000,
      });

      options?.onError?.(error, fieldErrors);
    },
  });
}

/**
 * Hook to delete a teacher
 */
export function useDeleteTeacher(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => deleteTeacher(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });

      toast.success('Teacher Deleted', {
        description: 'The teacher has been deleted successfully.',
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, 'Failed to delete teacher. Please try again.');

      toast.error('Error Deleting Teacher', {
        description: errorMessage,
        duration: 5000,
      });

      options?.onError?.(error, {});
    },
  });
}

/**
 * Hook to bulk upload teachers
 */
export function useBulkUploadTeachers(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => bulkUploadTeachers(file),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });

      if (response.failed_count > 0) {
        toast.warning('Upload Completed with Errors', {
          description: `${response.created_count} teachers created, ${response.failed_count} failed.`,
          duration: 6000,
        });
      } else {
        toast.success('Bulk Upload Successful', {
          description: `${response.created_count} teachers have been created successfully.`,
        });
      }

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(
        error,
        'Failed to upload teachers. Please check the file and try again.'
      );

      toast.error('Bulk Upload Failed', {
        description: errorMessage,
        duration: 5000,
      });

      options?.onError?.(error, {});
    },
  });
}
