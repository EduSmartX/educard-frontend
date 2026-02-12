/**
 * Class Mutations
 * All React Query mutations for class CRUD operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage, getFieldErrors } from '@/lib/utils/error-handler';
import type { CreateClassPayload, UpdateClassPayload } from '../types';
import { createClass, updateClass, deleteClass, bulkUploadClasses } from '../api/classes-api';

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
    mutationFn: (payload: CreateClassPayload) => createClass(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class Created', {
        description: 'The class has been created successfully.',
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, 'Failed to create class. Please try again.');
      const fieldErrors = getFieldErrors(error) as ClassFieldErrors | undefined;
      toast.error('Error Creating Class', {
        description: errorMessage,
        duration: 5000,
      });
      options?.onError?.(error, fieldErrors);
    },
  });
}

export function useUpdateClass(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, payload }: { publicId: string; payload: UpdateClassPayload }) =>
      updateClass(publicId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class Updated', {
        description: 'The class has been updated successfully.',
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, 'Failed to update class. Please try again.');
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
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class Deleted', {
        description: 'The class has been deleted successfully.',
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, 'Failed to delete class. Please try again.');
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
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      if (response.failed_count > 0) {
        toast.warning('Upload Completed with Errors', {
          description: `${response.created_count} classes created, ${response.failed_count} failed.`,
          duration: 6000,
        });
      } else {
        toast.success('Bulk Upload Successful', {
          description: `${response.created_count} classes have been created successfully.`,
        });
      }
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(
        error,
        'Failed to upload classes. Please check the file and try again.'
      );
      toast.error('Bulk Upload Failed', {
        description: errorMessage,
        duration: 5000,
      });
      options?.onError?.(error, {});
    },
  });
}
