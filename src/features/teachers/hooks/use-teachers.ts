/**
 * Teacher Query Hooks
 * React Query hooks for fetching teacher data
 */

import { useQuery } from '@tanstack/react-query';
import { fetchTeachers, fetchTeacher } from '../api/teachers-api';
import type { FetchTeachersParams } from '../types';

/**
 * Hook to fetch teachers list with pagination and filters
 */
export function useTeachers(params: FetchTeachersParams = {}) {
  return useQuery({
    queryKey: ['teachers', params],
    queryFn: () => fetchTeachers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single teacher
 */
export function useTeacher(publicId: string | undefined, isDeleted?: boolean) {
  return useQuery({
    queryKey: ['teachers', publicId, isDeleted],
    queryFn: () => fetchTeacher(publicId!, isDeleted),
    enabled: !!publicId,
  });
}
