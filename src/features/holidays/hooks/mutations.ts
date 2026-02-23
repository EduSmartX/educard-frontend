/**
 * Holiday Mutations
 * All React Query mutations for holiday CRUD operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ErrorMessages, SuccessMessages, ToastTitles } from '@/constants';
import type { CreateHolidayPayload, UpdateHolidayPayload } from '../types';
import {
  createHoliday,
  createHolidaysBulk,
  updateHoliday,
  deleteHoliday,
  bulkUploadHolidays,
} from '../api/holidays-api';
import { getErrorMessage, getFieldErrors } from '@/lib/utils/error-handler';

// ============================================================================
// Shared Types
// ============================================================================

/**
 * Field errors object for form validation
 */
export interface FieldErrors {
  start_date?: string;
  end_date?: string;
  holiday_type?: string;
  description?: string;
  [key: string]: string | undefined;
}

/**
 * Options that can be passed to any mutation hook
 */
export interface MutationOptions {
  /**
   * Callback executed after successful mutation
   * Called after toast notification and query invalidation
   */
  onSuccess?: () => void;

  /**
   * Callback executed when mutation fails
   * Called after error toast notification
   * @param error - The error that occurred
   * @param fieldErrors - Field-specific validation errors (if any)
   */
  onError?: (error: Error, fieldErrors?: FieldErrors) => void;
}

// ============================================================================
// Create Holiday Mutations
// ============================================================================

/**
 * Hook to create a single holiday
 */
export function useCreateHoliday(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateHolidayPayload) => createHoliday(payload),
    onSuccess: () => {
      // Invalidate all holiday queries
      queryClient.invalidateQueries({ queryKey: ['holidays'] });

      toast.success(SuccessMessages.HOLIDAY.CREATE_SUCCESS, {
        description: 'The holiday has been created successfully.',
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, 'Failed to create holiday. Please try again.');
      const fieldErrors = getFieldErrors(error) as FieldErrors | undefined;

      // Only show toast if there are no field errors (generic errors)
      if (!fieldErrors || Object.keys(fieldErrors).length === 0) {
        toast.error(ToastTitles.ERROR, {
          description: errorMessage,
        });
      } else {
        // If there are field errors, show a generic validation message
        toast.error(ToastTitles.VALIDATION_ERROR, {
          description: 'Please check the form fields and try again.',
        });
      }

      options?.onError?.(error, fieldErrors);
    },
  });
}

/**
 * Hook to create multiple holidays at once
 */
export function useCreateHolidaysBulk(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payloads: CreateHolidayPayload[]) => createHolidaysBulk(payloads),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });

      toast.success(SuccessMessages.HOLIDAY.BULK_UPLOAD_SUCCESS, {
        description: 'All holidays have been created successfully.',
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(ToastTitles.ERROR, {
        description: error.message || ErrorMessages.HOLIDAY.CREATE_FAILED,
      });

      options?.onError?.(error);
    },
  });
}

// ============================================================================
// Update Holiday Mutation
// ============================================================================

/**
 * Hook to update an existing holiday
 */
export function useUpdateHoliday(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<UpdateHolidayPayload> }) =>
      updateHoliday(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });

      toast.success(SuccessMessages.HOLIDAY.UPDATE_SUCCESS, {
        description: 'The holiday has been updated successfully.',
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getErrorMessage(error, 'Failed to update holiday. Please try again.');
      const fieldErrors = getFieldErrors(error) as FieldErrors | undefined;

      // Only show toast if there are no field errors (generic errors)
      if (!fieldErrors || Object.keys(fieldErrors).length === 0) {
        toast.error(ToastTitles.ERROR, {
          description: errorMessage,
        });
      } else {
        // If there are field errors, show a generic validation message
        toast.error(ToastTitles.VALIDATION_ERROR, {
          description: 'Please check the form fields and try again.',
        });
      }

      options?.onError?.(error, fieldErrors);
    },
  });
}

// ============================================================================
// Delete Holiday Mutation
// ============================================================================

/**
 * Hook to delete a holiday
 */
export function useDeleteHoliday(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteHoliday(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });

      toast.success(SuccessMessages.HOLIDAY.DELETE_SUCCESS, {
        description: 'The holiday has been deleted successfully.',
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(ToastTitles.ERROR, {
        description: error.message || ErrorMessages.HOLIDAY.DELETE_FAILED,
      });

      options?.onError?.(error);
    },
  });
}

// ============================================================================
// Bulk Upload Mutation
// ============================================================================

/**
 * Hook to bulk upload holidays from Excel file
 */
export function useBulkUploadHolidays(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => bulkUploadHolidays(file),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });

      if (response.data.failed_count > 0) {
        toast.warning(ErrorMessages.HOLIDAY.BULK_UPLOAD_FAILED, {
          description: `${response.data.created_count} holidays created, ${response.data.failed_count} failed.`,
        });
      } else {
        toast.success(SuccessMessages.HOLIDAY.BULK_UPLOAD_SUCCESS, {
          description: `${response.data.created_count} holidays have been created successfully.`,
        });
      }

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(ToastTitles.ERROR, {
        description: error.message || ErrorMessages.HOLIDAY.BULK_UPLOAD_FAILED,
      });

      options?.onError?.(error);
    },
  });
}
