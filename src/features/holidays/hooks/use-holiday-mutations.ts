/**
 * Holiday Mutations Hooks
 * React Query mutations for holiday CRUD operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CreateHolidayPayload, UpdateHolidayPayload } from '../types';
import {
  createHoliday,
  createHolidaysBulk,
  updateHoliday,
  deleteHoliday,
  bulkUploadHolidays,
} from '../api/holidays-api';

// ============================================================================
// Mutation Options Types
// ============================================================================

interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
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

      toast.success('Holiday Created', {
        description: 'The holiday has been created successfully.',
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Error Creating Holiday', {
        description: error.message || 'Failed to create holiday. Please try again.',
      });

      options?.onError?.(error);
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

      toast.success('Holidays Created', {
        description: 'All holidays have been created successfully.',
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Error Creating Holidays', {
        description: error.message || 'Failed to create holidays. Please try again.',
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

      toast.success('Holiday Updated', {
        description: 'The holiday has been updated successfully.',
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Error Updating Holiday', {
        description: error.message || 'Failed to update holiday. Please try again.',
      });

      options?.onError?.(error);
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

      toast.success('Holiday Deleted', {
        description: 'The holiday has been deleted successfully.',
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Error Deleting Holiday', {
        description: error.message || 'Failed to delete holiday. Please try again.',
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
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });

      if (result.failed_count > 0) {
        toast.warning('Upload Completed with Errors', {
          description: `${result.created_count} holidays created, ${result.failed_count} failed.`,
        });
      } else {
        toast.success('Bulk Upload Successful', {
          description: `${result.created_count} holidays have been created successfully.`,
        });
      }

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Bulk Upload Failed', {
        description:
          error.message || 'Failed to upload holidays. Please check the file and try again.',
      });

      options?.onError?.(error);
    },
  });
}
