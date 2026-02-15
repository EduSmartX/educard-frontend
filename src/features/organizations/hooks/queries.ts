/**
 * Organization Queries
 * React Query hooks for fetching organization data
 */

import { useQuery } from '@tanstack/react-query';
import { getOrganization } from '../api/organization-api';

/**
 * Hook to fetch organization details
 */
export function useOrganization(publicId: string | undefined) {
  return useQuery({
    queryKey: ['organization', publicId],
    queryFn: () => getOrganization(publicId!),
    select: (data) => data.data,
    enabled: !!publicId,
  });
}
