/**
 * Student Mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage, getFieldErrors } from '@/lib/utils/error-handler';
import type { CreateStudentPayload, UpdateStudentPayload, BulkUploadResponse } from '../types';
import {
  createStudent,
  updateStudent,
  deleteStudent,
  bulkUploadStudents,
} from '../api/students-api';

export interface StudentFieldErrors {
  student_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  class_id?: string;
  [key: string]: string | undefined;
}

export interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error, fieldErrors?: StudentFieldErrors) => void;
}

export function useCreateStudent(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStudentPayload) => createStudent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student Created', {
        description: 'The student has been created successfully.',
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, 'Failed to create student. Please try again.');
      const fieldErrors = getFieldErrors(error) as StudentFieldErrors | undefined;
      toast.error('Error Creating Student', {
        description: errorMessage,
        duration: 5000,
      });
      options?.onError?.(error, fieldErrors);
    },
  });
}

export function useUpdateStudent(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, payload }: { publicId: string; payload: UpdateStudentPayload }) =>
      updateStudent(publicId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student Updated', {
        description: 'The student has been updated successfully.',
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, 'Failed to update student. Please try again.');
      const fieldErrors = getFieldErrors(error) as StudentFieldErrors | undefined;
      toast.error('Error Updating Student', {
        description: errorMessage,
        duration: 5000,
      });
      options?.onError?.(error, fieldErrors);
    },
  });
}

export function useDeleteStudent(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => deleteStudent(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student Deleted', {
        description: 'The student has been deleted successfully.',
      });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, 'Failed to delete student. Please try again.');
      toast.error('Error Deleting Student', {
        description: errorMessage,
        duration: 5000,
      });
      options?.onError?.(error, {});
    },
  });
}

export function useBulkUploadStudents(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => bulkUploadStudents(file),
    onSuccess: (response: BulkUploadResponse) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      if (response.failed_count > 0) {
        toast.warning('Upload Completed with Errors', {
          description: `${response.created_count} students created, ${response.failed_count} failed.`,
          duration: 6000,
        });
      } else {
        toast.success('Bulk Upload Successful', {
          description: `${response.created_count} students have been created successfully.`,
        });
      }
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(
        error,
        'Failed to upload students. Please check the file and try again.'
      );
      toast.error('Bulk Upload Failed', {
        description: errorMessage,
        duration: 5000,
      });
      options?.onError?.(error, {});
    },
  });
}
