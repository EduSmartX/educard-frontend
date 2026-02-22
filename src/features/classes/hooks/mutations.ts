/**
 * Class Mutations
 * All React Query mutations for class CRUD operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage, getFieldErrors } from '@/lib/utils/error-handler';
import { ErrorMessages, SuccessMessages, QueryKeys } from '@/constants';
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
      toast.success('Class Created', {
        description: SuccessMessages.CLASS.CREATE_SUCCESS,
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, ErrorMessages.CLASS.CREATE_FAILED);
      const fieldErrors = getFieldErrors(error) as ClassFieldErrors | undefined;
      toast.error('Error Creating Class', {
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
      toast.success('Class Reactivated', {
        description: SuccessMessages.CLASS.REACTIVATE_SUCCESS,
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, ErrorMessages.CLASS.UPDATE_FAILED);
      toast.error('Error Reactivating Class', {
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
      toast.success('Class Updated', {
        description: SuccessMessages.CLASS.UPDATE_SUCCESS,
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, ErrorMessages.CLASS.UPDATE_FAILED);
      const fieldErrors = getFieldErrors(error) as ClassFieldErrors | undefined;
      toast.error('Error Updating Class', {
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
      toast.success('Class Deleted', {
        description: SuccessMessages.CLASS.DELETE_SUCCESS,
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, ErrorMessages.CLASS.DELETE_FAILED);
      toast.error('Error Deleting Class', {
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
        toast.warning('Upload Completed with Errors', {
          description: `${response.created_count} classes created, ${response.failed_count} failed.`,
          duration: 6000,
        });
      } else {
        toast.success('Bulk Upload Successful', {
          description: SuccessMessages.CLASS.CREATE_SUCCESS,
        });
      }
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, ErrorMessages.CLASS.CREATE_FAILED);
      toast.error('Bulk Upload Failed', {
        description: errorMessage,
        duration: 5000,
      });
      options?.onError?.(error, {});
    },
  });
}
