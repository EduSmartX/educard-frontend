/**
 * Teacher Mutations
 * All React Query mutations for Teacher CRUD operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getErrorMessage,
  getFieldErrors,
  isDeletedDuplicateError,
} from '@/lib/utils/error-handler';
import { ErrorMessages, QueryKeys, SuccessMessages, ToastTitles } from '@/constants';
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
      queryClient.invalidateQueries({ queryKey: QueryKeys.TEACHERS.ALL });

      toast.success(SuccessMessages.TEACHER.CREATE_SUCCESS);

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, ErrorMessages.TEACHER.CREATE_FAILED);
      const fieldErrors = getFieldErrors(error) as TeacherFieldErrors | undefined;

      // Don't show toast for deleted duplicate errors - the dialog will handle it
      if (!isDeletedDuplicateError(error)) {
        // Only show toast if no custom error handler is provided
        // If custom handler exists, let it decide whether to show toast or dialog
        if (!options?.onError) {
          toast.error(ToastTitles.ERROR, {
            description: errorMessage,
            duration: 5000,
          });
        }
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
      // Invalidate all teacher queries to refresh both active and deleted lists
      queryClient.invalidateQueries({
        queryKey: QueryKeys.TEACHERS.ALL,
      });

      toast.success(SuccessMessages.TEACHER.REACTIVATE_SUCCESS);

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, ErrorMessages.TEACHER.REACTIVATE_FAILED);

      toast.error(ToastTitles.ERROR, {
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
      queryClient.invalidateQueries({ queryKey: QueryKeys.TEACHERS.ALL });

      toast.success(SuccessMessages.TEACHER.UPDATE_SUCCESS);

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, ErrorMessages.TEACHER.UPDATE_FAILED);
      const fieldErrors = getFieldErrors(error) as TeacherFieldErrors | undefined;

      if (!isDeletedDuplicateError(error)) {
        toast.error(ToastTitles.ERROR, {
          description: errorMessage,
          duration: 5000,
        });
      }

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
    onSuccess: (_data, publicId) => {
      // Remove the deleted teacher's detail query from cache to prevent 404 refetch
      queryClient.removeQueries({
        queryKey: ['teachers', publicId],
      });
      // Invalidate list queries to refresh the list
      queryClient.invalidateQueries({
        queryKey: QueryKeys.TEACHERS.ALL,
      });

      toast.success(SuccessMessages.TEACHER.DELETE_SUCCESS);

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, ErrorMessages.TEACHER.DELETE_FAILED);

      toast.error(ToastTitles.ERROR, {
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
      queryClient.invalidateQueries({ queryKey: QueryKeys.TEACHERS.ALL });

      if (response.failed_count > 0) {
        toast.warning(ErrorMessages.TEACHER.BULK_UPLOAD_FAILED, {
          description: `${response.created_count} teachers created, ${response.failed_count} failed.`,
          duration: 6000,
        });
      } else {
        toast.success(SuccessMessages.TEACHER.BULK_UPLOAD_SUCCESS);
      }

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, ErrorMessages.TEACHER.BULK_UPLOAD_FAILED);

      toast.error(ToastTitles.ERROR, {
        description: errorMessage,
        duration: 5000,
      });

      options?.onError?.(error, {});
    },
  });
}
