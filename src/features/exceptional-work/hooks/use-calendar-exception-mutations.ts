/**
 * Calendar Exception Mutations Hooks
 * React Query mutations for exceptional work policy CRUD operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage, getFieldErrors } from '@/lib/utils/error-handler';
import type { CalendarExceptionCreate, CalendarExceptionUpdate } from '../types';
import {
  createCalendarException,
  updateCalendarException,
  deleteCalendarException,
} from '../api/calendar-exception-api';

interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: unknown, fieldErrors: Record<string, string>) => void;
}

/**
 * Hook to create a calendar exception
 */
export function useCreateCalendarException(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CalendarExceptionCreate) => createCalendarException(payload),
    onSuccess: () => {
      // Invalidate all calendar exception queries
      queryClient.invalidateQueries({ queryKey: ['calendar-exceptions'] });

      toast.success('Exception Created', {
        description: 'Calendar exception has been created successfully.',
      });

      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      // Parse error once
      const errorMessage = getErrorMessage(error, 'Failed to create calendar exception');
      const fieldErrors = getFieldErrors(error);

      // Show error in toast
      toast.error('Error Creating Exception', {
        description: errorMessage,
        duration: 5000,
      });

      // Pass field errors to component for form display
      options?.onError?.(error, fieldErrors);
    },
  });
}

/**
 * Hook to update a calendar exception
 */
export function useUpdateCalendarException(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, payload }: { publicId: string; payload: CalendarExceptionUpdate }) =>
      updateCalendarException(publicId, payload),
    onSuccess: () => {
      // Invalidate all calendar exception queries
      queryClient.invalidateQueries({ queryKey: ['calendar-exceptions'] });

      toast.success('Exception Updated', {
        description: 'Calendar exception has been updated successfully.',
      });

      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      // Parse error once
      const errorMessage = getErrorMessage(error, 'Failed to update calendar exception');
      const fieldErrors = getFieldErrors(error);

      // Show error in toast
      toast.error('Error Updating Exception', {
        description: errorMessage,
        duration: 5000,
      });

      // Pass field errors to component for form display
      options?.onError?.(error, fieldErrors);
    },
  });
}

/**
 * Hook to delete a calendar exception
 */
export function useDeleteCalendarException(options?: MutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => deleteCalendarException(publicId),
    onSuccess: () => {
      // Invalidate all calendar exception queries
      queryClient.invalidateQueries({ queryKey: ['calendar-exceptions'] });

      toast.success('Exception Deleted', {
        description: 'Calendar exception has been deleted successfully.',
      });

      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error, 'Failed to delete calendar exception');
      toast.error('Error Deleting Exception', {
        description: errorMessage,
        duration: 5000,
      });

      options?.onError?.(error, {});
    },
  });
}
