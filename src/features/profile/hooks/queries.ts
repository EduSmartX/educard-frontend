/**
 * Profile Queries
 * React Query hooks for fetching profile data
 */

import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../api/profile-api';

/**
 * Hook to fetch user profile
 */
export function useUserProfile() {
  return useQuery({
    queryKey: ['user-profile', 'me'],
    queryFn: () => getUserProfile(),
    select: (data) => data.data,
  });
}
