/**
 * Subject Query Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { fetchSubjects, fetchSubject } from '../api/subjects-api';
import type { FetchSubjectsParams } from '../types';

export function useSubjects(params: FetchSubjectsParams = {}) {
  return useQuery({
    queryKey: ['subjects', params],
    queryFn: () => fetchSubjects(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubject(publicId: string | undefined) {
  return useQuery({
    queryKey: ['subjects', publicId],
    queryFn: () => fetchSubject(publicId!),
    enabled: !!publicId,
  });
}
