/**
 * Student Query Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { fetchStudents, fetchStudent } from '../api/students-api';
import type { FetchStudentsParams } from '../types';

export function useStudents(params: FetchStudentsParams = {}) {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => fetchStudents(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudent(publicId: string | undefined) {
  return useQuery({
    queryKey: ['students', publicId],
    queryFn: () => fetchStudent(publicId!),
    enabled: !!publicId,
  });
}
