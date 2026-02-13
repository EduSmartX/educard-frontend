/**
 * Teacher API
 * All API calls for teacher CRUD operations
 */

import api from '@/lib/api';
import type {
  Teacher,
  TeacherDetail,
  CreateTeacherPayload,
  UpdateTeacherPayload,
  FetchTeachersParams,
  TeachersResponse,
  TeacherBulkUploadResponse,
  PaginatedResponse,
  ApiResponse,
} from '../types';

const BASE_URL = '/teacher/admin/';

/**
 * Fetch all teachers with pagination and filters
 */
export async function fetchTeachers(
  params: FetchTeachersParams = {}
): Promise<PaginatedResponse<Teacher>> {
  const response = await api.get<TeachersResponse>(BASE_URL, { params });
  // Backend returns: { success, message, data: [...], pagination: {...}, code }
  // We need to restructure it to match PaginatedResponse<Teacher>
  return {
    data: response.data.data,
    pagination: response.data.pagination!,
  };
}

/**
 * Fetch a single teacher by ID
 */
export async function fetchTeacher(publicId: string, isDeleted?: boolean): Promise<TeacherDetail> {
  const params = isDeleted ? { is_deleted: 'true' } : {};
  const response = await api.get<ApiResponse<TeacherDetail>>(`${BASE_URL}${publicId}/`, {
    params,
  });
  return response.data.data;
}

/**
 * Create a new teacher
 */
export async function createTeacher(
  data: CreateTeacherPayload,
  forceCreate?: boolean
): Promise<TeacherDetail> {
  const params = forceCreate ? { force_create: 'true' } : {};
  const response = await api.post<ApiResponse<TeacherDetail>>(BASE_URL, data, { params });
  return response.data.data;
}

/**
 * Update an existing teacher
 */
export async function updateTeacher(
  publicId: string,
  data: UpdateTeacherPayload
): Promise<TeacherDetail> {
  const response = await api.put<ApiResponse<TeacherDetail>>(`${BASE_URL}${publicId}/`, data);
  return response.data.data;
}

/**
 * Delete a teacher (soft delete)
 */
export async function deleteTeacher(publicId: string): Promise<void> {
  await api.delete(`${BASE_URL}${publicId}/`);
}

/**
 * Bulk upload teachers from Excel file
 */
export async function bulkUploadTeachers(file: File): Promise<TeacherBulkUploadResponse['data']> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<TeacherBulkUploadResponse>(`${BASE_URL}bulk-upload/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
}

/**
 * Download teacher bulk import template
 */
export async function downloadTeacherTemplate(): Promise<Blob> {
  const response = await api.get(`${BASE_URL}download-template/`, {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Activate a deactivated teacher
 */
export async function reactivateTeacher(publicId: string): Promise<Teacher> {
  const response = await api.post<ApiResponse<Teacher>>(`${BASE_URL}${publicId}/activate/`);
  return response.data.data;
}
