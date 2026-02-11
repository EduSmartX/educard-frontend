/**
 * Holiday Calendar API Functions
 * Handles all API calls for organization holiday calendar
 */

import api from '../../../lib/api';
import type {
  CreateHolidayPayload,
  FetchHolidaysParams,
  HolidayListResponse,
  HolidayResponse,
  UpdateHolidayPayload,
  WorkingDayPolicyListResponse,
  BulkUploadResult,
} from '../types';

// ============================================================================
// API Endpoints
// ============================================================================

const ENDPOINTS = {
  holidays: '/attendance/admin/holiday-calendar/',
  holidayDetail: (id: string) => `/attendance/admin/holiday-calendar/${id}/`,
  holidayTemplate: '/attendance/admin/holiday-calendar/download-template/',
  holidayBulkUpload: '/attendance/admin/holiday-calendar/bulk-upload/',
  workingDayPolicy: '/attendance/admin/working-day-policy/',
};

// ============================================================================
// Holiday CRUD Operations
// ============================================================================

/**
 * Fetch holidays with optional filters
 */
export async function fetchHolidays(params?: FetchHolidaysParams): Promise<HolidayListResponse> {
  const queryParams = new URLSearchParams();

  if (params?.from_date) queryParams.append('from_date', params.from_date);
  if (params?.to_date) queryParams.append('to_date', params.to_date);
  if (params?.holiday_type) queryParams.append('holiday_type', params.holiday_type);
  if (params?.ordering) queryParams.append('ordering', params.ordering);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

  const url = `${ENDPOINTS.holidays}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await api.get<HolidayListResponse>(url);
  return response.data;
}

/**
 * Fetch a single holiday by ID
 */
export async function fetchHoliday(id: string): Promise<HolidayResponse> {
  const response = await api.get<HolidayResponse>(ENDPOINTS.holidayDetail(id));
  return response.data;
}

/**
 * Create a new holiday
 */
export async function createHoliday(payload: CreateHolidayPayload): Promise<HolidayResponse> {
  const response = await api.post<HolidayResponse>(ENDPOINTS.holidays, payload);
  return response.data;
}

/**
 * Create multiple holidays at once
 */
export async function createHolidaysBulk(
  payloads: CreateHolidayPayload[]
): Promise<HolidayResponse> {
  const response = await api.post<HolidayResponse>(ENDPOINTS.holidays, payloads);
  return response.data;
}

/**
 * Update an existing holiday
 */
export async function updateHoliday(
  id: string,
  payload: Partial<UpdateHolidayPayload>
): Promise<HolidayResponse> {
  const response = await api.patch<HolidayResponse>(ENDPOINTS.holidayDetail(id), payload);
  return response.data;
}

/**
 * Delete a holiday
 */
export async function deleteHoliday(id: string): Promise<void> {
  await api.delete(ENDPOINTS.holidayDetail(id));
}

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Download holiday template Excel file
 */
export async function downloadHolidayTemplate(): Promise<Blob> {
  const response = await api.get(ENDPOINTS.holidayTemplate, {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Upload bulk holidays from Excel file
 */
export async function bulkUploadHolidays(
  file: File
): Promise<{ success: boolean; message: string; data: BulkUploadResult; code: number }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<{
    success: boolean;
    message: string;
    data: BulkUploadResult;
    code: number;
  }>(ENDPOINTS.holidayBulkUpload, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

// ============================================================================
// Working Day Policy
// ============================================================================

/**
 * Fetch working day policy
 */
export async function fetchWorkingDayPolicy(): Promise<WorkingDayPolicyListResponse> {
  const response = await api.get<WorkingDayPolicyListResponse>(ENDPOINTS.workingDayPolicy);
  return response.data;
}
