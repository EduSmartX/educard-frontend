/**
 * API functions for Exceptional Work Policy (Calendar Exceptions)
 */

import api from '@/lib/api';
import type {
  CalendarException,
  CalendarExceptionCreate,
  CalendarExceptionFilters,
  CalendarExceptionListResponse,
  CalendarExceptionUpdate,
} from '../types';

const BASE_URL = '/attendance/calendar-exception';

/**
 * Fetch paginated list of calendar exceptions with optional filters
 */
export async function fetchCalendarExceptions(
  filters?: CalendarExceptionFilters
): Promise<CalendarExceptionListResponse> {
  const params = new URLSearchParams();

  if (filters?.override_type) {
    params.append('override_type', filters.override_type);
  }
  if (filters?.from_date) {
    params.append('from_date', filters.from_date);
  }
  if (filters?.to_date) {
    params.append('to_date', filters.to_date);
  }
  if (filters?.classes && filters.classes.length > 0) {
    // Backend expects comma-separated class IDs
    params.append('classes', filters.classes.join(','));
  }
  if (filters?.page) {
    params.append('page', filters.page.toString());
  }
  if (filters?.page_size) {
    params.append('page_size', filters.page_size.toString());
  }
  if (filters?.ordering) {
    params.append('ordering', filters.ordering);
  }

  const response = await api.get<CalendarExceptionListResponse>(
    `${BASE_URL}/?${params.toString()}`
  );
  return response.data;
}

/**
 * Fetch a single calendar exception by public_id
 */
export async function fetchCalendarException(publicId: string): Promise<CalendarException> {
  const response = await api.get<{ data: CalendarException }>(`${BASE_URL}/${publicId}/`);
  return response.data.data;
}

/**
 * Create a new calendar exception
 */
export async function createCalendarException(
  data: CalendarExceptionCreate
): Promise<CalendarException> {
  const response = await api.post<{ data: CalendarException }>(`${BASE_URL}/`, data);
  return response.data.data;
}

/**
 * Update an existing calendar exception
 */
export async function updateCalendarException(
  publicId: string,
  data: CalendarExceptionUpdate
): Promise<CalendarException> {
  const response = await api.patch<{ data: CalendarException }>(`${BASE_URL}/${publicId}/`, data);
  return response.data.data;
}

/**
 * Delete a calendar exception (soft delete)
 */
export async function deleteCalendarException(publicId: string): Promise<void> {
  await api.delete(`${BASE_URL}/${publicId}/`);
}
