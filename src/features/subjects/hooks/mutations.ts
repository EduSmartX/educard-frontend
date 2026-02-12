/**
 * Subject Mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage, getFieldErrors } from '@/lib/utils/error-handler';
import type { CreateSubjectPayload, UpdateSubjectPayload } from '../types';
import type { BulkUploadResponse } from '../api/subjects-api';
import {
  createSubject,
  updateSubject,
  deleteSubject,
  bulkUploadSubjects,
} from '../api/subjects-api';

export interface SubjectFieldErrors {
  subject_name?: string;
  subject_code?: string;
  description?: string;
  [key: string]: string | undefined;
}

export interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error, fieldErrors?: SubjectFieldErrors) => void;
}

export function useCreateSubject(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSubjectPayload) => createSubject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject Created', {
        description: 'The subject has been created successfully.',
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, 'Failed to create subject. Please try again.');
      const fieldErrors = getFieldErrors(error) as SubjectFieldErrors | undefined;
      toast.error('Error Creating Subject', {
        description: errorMessage,
        duration: 5000,
      });
      options?.onError?.(error, fieldErrors);
    },
  });
}

export function useUpdateSubject(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, payload }: { publicId: string; payload: UpdateSubjectPayload }) =>
      updateSubject(publicId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject Updated', {
        description: 'The subject has been updated successfully.',
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, 'Failed to update subject. Please try again.');
      const fieldErrors = getFieldErrors(error) as SubjectFieldErrors | undefined;
      toast.error('Error Updating Subject', {
        description: errorMessage,
        duration: 5000,
      });
      options?.onError?.(error, fieldErrors);
    },
  });
}

export function useDeleteSubject(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => deleteSubject(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject Deleted', {
        description: 'The subject has been deleted successfully.',
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, 'Failed to delete subject. Please try again.');
      toast.error('Error Deleting Subject', {
        description: errorMessage,
        duration: 5000,
      });
      options?.onError?.(error, {});
    },
  });
}

export function useBulkUploadSubjects(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => bulkUploadSubjects(file),
    onSuccess: (response: BulkUploadResponse) => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      if (response.failed_count > 0) {
        toast.warning('Upload Completed with Errors', {
          description: `${response.created_count} subjects created, ${response.failed_count} failed.`,
          duration: 6000,
        });
      } else {
        toast.success('Bulk Upload Successful', {
          description: `${response.created_count} subjects have been created successfully.`,
        });
      }
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(
        error,
        'Failed to upload subjects. Please check the file and try again.'
      );
      toast.error('Bulk Upload Failed', {
        description: errorMessage,
        duration: 5000,
      });
      options?.onError?.(error, {});
    },
  });
}
