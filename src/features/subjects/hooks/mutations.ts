/**
 * Subject Mutations
 * All mutation hooks for subjects module
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getErrorMessage,
  getFieldErrors,
  isDeletedDuplicateError,
} from '@/lib/utils/error-handler';
import {
  createSubject,
  updateSubject,
  deleteSubject,
  reactivateSubject,
} from '../api/subjects-api';
import { ErrorMessages, SuccessMessages, ToastTitles } from '@/constants';
import type { SubjectCreatePayload, SubjectUpdatePayload } from '../types/subject';

export interface SubjectFieldErrors {
  class_id?: string;
  subject_id?: string;
  teacher_id?: string;
  description?: string;
  [key: string]: string | undefined;
}

export interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error, fieldErrors?: SubjectFieldErrors) => void;
}

/**
 * Create subject mutation
 */
export function useCreateSubject(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, forceCreate }: { data: SubjectCreatePayload; forceCreate?: boolean }) =>
      createSubject(data, forceCreate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, ErrorMessages.SUBJECT.CREATE_FAILED);
      const fieldErrors = getFieldErrors(error) as SubjectFieldErrors | undefined;

      // Don't show toast for deleted duplicates (dialog will be shown by page)
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
 * Update subject mutation
 */
export function useUpdateSubject(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubjectUpdatePayload }) =>
      updateSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, ErrorMessages.SUBJECT.UPDATE_FAILED);
      const fieldErrors = getFieldErrors(error) as SubjectFieldErrors | undefined;

      // Don't show toast for deleted duplicates (dialog will be shown by page)
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
 * Delete subject mutation (soft delete)
 */
export function useDeleteSubject(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => {
      // Only invalidate the list queries, not individual subject queries
      queryClient.invalidateQueries({
        queryKey: ['subjects'],
        exact: true,
      });
      toast.success(SuccessMessages.SUBJECT.DELETE_SUCCESS);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, ErrorMessages.SUBJECT.DELETE_FAILED);

      toast.error(ToastTitles.ERROR, {
        description: errorMessage,
        duration: 5000,
      });

      options?.onError?.(error);
    },
  });
}

/**
 * Reactivate subject mutation
 */
export function useReactivateSubject(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivateSubject,
    onSuccess: () => {
      // Only invalidate the list queries, not individual subject queries
      // The navigation will handle refreshing the detail view
      queryClient.invalidateQueries({
        queryKey: ['subjects'],
        exact: true,
      });
      toast.success(SuccessMessages.SUBJECT.REACTIVATE_SUCCESS);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, ErrorMessages.SUBJECT.REACTIVATE_FAILED);

      toast.error(ToastTitles.ERROR, {
        description: errorMessage,
        duration: 5000,
      });

      options?.onError?.(error);
    },
  });
}
