/**
 * Classes API
 * All API calls for class CRUD operations
 */

import api from '@/lib/api';
import type {
  Class,
  CreateClassPayload,
  UpdateClassPayload,
  FetchClassesParams,
  ClassesResponse,
  ClassResponse,
  ClassBulkUploadResponse,
  PaginatedResponse,
} from '../types';

const BASE_URL = '/classes/admin/';

export async function fetchClasses(
  params: FetchClassesParams = {}
): Promise<PaginatedResponse<Class>> {
  const response = await api.get<ClassesResponse>(BASE_URL, { params });

  // Transform the response to match our PaginatedResponse structure
  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
}

export async function fetchClass(publicId: string): Promise<Class> {
  const response = await api.get<ClassResponse>(`${BASE_URL}${publicId}/`);
  return response.data.data;
}

export async function createClass(data: CreateClassPayload, forceCreate?: boolean): Promise<Class> {
  const params = forceCreate ? { force_create: 'true' } : {};
  const response = await api.post<ClassResponse>(BASE_URL, data, { params });
  return response.data.data;
}

export async function updateClass(publicId: string, data: UpdateClassPayload): Promise<Class> {
  const response = await api.put<ClassResponse>(`${BASE_URL}${publicId}/`, data);
  return response.data.data;
}

export async function deleteClass(publicId: string): Promise<void> {
  await api.delete(`${BASE_URL}${publicId}/`);
}

export async function reactivateClass(publicId: string): Promise<Class> {
  const response = await api.post<ClassResponse>(`${BASE_URL}${publicId}/activate/`);
  return response.data.data;
}

export async function bulkUploadClasses(file: File): Promise<ClassBulkUploadResponse['data']> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<ClassBulkUploadResponse>(`${BASE_URL}bulk-upload/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}
