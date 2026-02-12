/**
 * Class Query Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { fetchClasses, fetchClass } from '../api/classes-api';
import type { FetchClassesParams } from '../types';

export function useClasses(params: FetchClassesParams = {}) {
  return useQuery({
    queryKey: ['classes', params],
    queryFn: () => fetchClasses(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useClass(publicId: string | undefined) {
  return useQuery({
    queryKey: ['classes', publicId],
    queryFn: () => fetchClass(publicId!),
    enabled: !!publicId,
  });
}
