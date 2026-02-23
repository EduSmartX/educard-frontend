/**
 * Class Mutations
 * All React Query mutations for class CRUD operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage, getFieldErrors } from '@/lib/utils/error-handler';
import { ErrorMessages, QueryKeys, SuccessMessages, ToastTitles } from '@/constants';
import type { CreateClassPayload, UpdateClassPayload } from '../types';
import {
  createClass,
  updateClass,
  deleteClass,
  reactivateClass,
  bulkUploadClasses,
} from '../api/classes-api';

export interface ClassFieldErrors {
  standard?: string;
  section?: string;
  class_teacher?: string;
  academic_year?: string;
  capacity?: string;
  [key: string]: string | undefined;
}

export interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error, fieldErrors?: ClassFieldErrors) => void;
}

export function useCreateClass(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      forceCreate,
    }: {
      payload: CreateClassPayload;
      forceCreate?: boolean;
    }) => createClass(payload, forceCreate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.CLASSES.ALL });
      toast.success(SuccessMessages.CLASS.CREATE_SUCCESS);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, ErrorMessages.CLASS.CREATE_FAILED);
      const fieldErrors = getFieldErrors(error) as ClassFieldErrors | undefined;
      toast.error(ToastTitles.ERROR, {
        description: errorMessage,
        duration: 5000,
      });
      options?.onError?.(error, fieldErrors);
    },
  });
}

export function useReactivateClass(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => reactivateClass(publicId),
    onSuccess: () => {
      // Only invalidate the list queries, not individual class queries
      // The navigation will handle refreshing the detail view
      queryClient.invalidateQueries({
        queryKey: QueryKeys.CLASSES.ALL,
        exact: true, // Only invalidate the exact list query, not detail queries
      });
      toast.success(SuccessMessages.CLASS.REACTIVATE_SUCCESS);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, ErrorMessages.CLASS.REACTIVATE_FAILED);
      toast.error(ToastTitles.ERROR, {
        description: errorMessage,
        duration: 5000,
      });
      options?.onError?.(error);
    },
  });
}

export function useUpdateClass(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, payload }: { publicId: string; payload: UpdateClassPayload }) =>
      updateClass(publicId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.CLASSES.ALL });
      toast.success(SuccessMessages.CLASS.UPDATE_SUCCESS);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, ErrorMessages.CLASS.UPDATE_FAILED);
      const fieldErrors = getFieldErrors(error) as ClassFieldErrors | undefined;
      toast.error(ToastTitles.ERROR, {
        description: errorMessage,
        duration: 5000,
      });
      options?.onError?.(error, fieldErrors);
    },
  });
}

export function useDeleteClass(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => deleteClass(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.CLASSES.ALL });
      toast.success(SuccessMessages.CLASS.DELETE_SUCCESS);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, ErrorMessages.CLASS.DELETE_FAILED);
      toast.error(ToastTitles.ERROR, {
        description: errorMessage,
        duration: 5000,
      });
      options?.onError?.(error, {});
    },
  });
}

export function useBulkUploadClasses(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => bulkUploadClasses(file),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.CLASSES.ALL });
      if (response.failed_count > 0) {
        toast.warning(ErrorMessages.CLASS.BULK_UPLOAD_FAILED, {
          description: `${response.created_count} classes created, ${response.failed_count} failed.`,
          duration: 6000,
        });
      } else {
        toast.success(SuccessMessages.CLASS.BULK_UPLOAD_SUCCESS);
      }
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, ErrorMessages.CLASS.BULK_UPLOAD_FAILED);
      toast.error(ToastTitles.ERROR, {
        description: errorMessage,
        duration: 5000,
      });
      options?.onError?.(error, {});
    },
  });
}
