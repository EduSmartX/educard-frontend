/**
 * Custom Hook for Leave Allocations Data Fetching and Mutations
 * Handles API calls, caching, and state management with pagination
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { leaveApi } from '@/lib/api/leave-api';
import { parseApiError } from '@/lib/utils/error-handler';

interface UseLeaveAllocationsParams {
  searchQuery?: string;
  filters?: Record<string, string>;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

export function useLeaveAllocations({
  searchQuery = '',
  filters = {},
  page = 1,
  pageSize = 10,
  enabled = true,
}: UseLeaveAllocationsParams = {}) {
  return useQuery({
    queryKey: ['leave-allocations', searchQuery, filters, page, pageSize],
    queryFn: () =>
      leaveApi.getAllocations({
        search: searchQuery,
        page,
        page_size: pageSize,
        ...filters,
      }),
    enabled,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
}

export function useDeleteLeaveAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => leaveApi.deleteAllocation(publicId),
    onSuccess: (_, __, context: unknown) => {
      const allocationName = context?.allocationName;
      toast.success('Leave allocation deleted successfully', {
        description: allocationName ? `${allocationName} policy has been removed` : undefined,
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
      queryClient.invalidateQueries({ queryKey: ['leave-allocations'] });
    },
    onError: (error: unknown) => {
      const errorMessage = parseApiError(error, 'Failed to delete leave allocation');
      toast.error('Failed to delete policy', {
        description: errorMessage,
        icon: <AlertCircle className="h-4 w-4" />,
      });
    },
  });
}
