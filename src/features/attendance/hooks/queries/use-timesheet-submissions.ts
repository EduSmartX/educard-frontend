import { useQuery } from '@tanstack/react-query';

import { getTimesheetSubmissions, type TimesheetSubmission } from '../../api/attendance-api';

interface UseTimesheetSubmissionsOptions {
  employee?: string;
  status?: string;
  week_start_date?: string;
  week_end_date?: string;
}

export function useTimesheetSubmissions(options?: UseTimesheetSubmissionsOptions) {
  return useQuery({
    queryKey: ['timesheet-submissions', options],
    queryFn: () => getTimesheetSubmissions(options),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export type { TimesheetSubmission };
