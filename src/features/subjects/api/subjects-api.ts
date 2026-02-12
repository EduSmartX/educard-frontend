/**
 * Subjects API
 */

import api from '@/lib/api';
import type {
  Subject,
  CreateSubjectPayload,
  UpdateSubjectPayload,
  FetchSubjectsParams,
  PaginatedResponse,
} from '../types';

const SUBJECTS_BASE = '/subjects';

export async function fetchSubjects(
  params: FetchSubjectsParams = {}
): Promise<PaginatedResponse<Subject>> {
  const response = await api.get<PaginatedResponse<Subject>>(SUBJECTS_BASE, { params });
  return response.data;
}

export async function fetchSubject(publicId: string): Promise<Subject> {
  const response = await api.get<Subject>(`${SUBJECTS_BASE}/${publicId}`);
  return response.data;
}

export async function createSubject(payload: CreateSubjectPayload): Promise<Subject> {
  const response = await api.post<Subject>(SUBJECTS_BASE, payload);
  return response.data;
}

export async function updateSubject(
  publicId: string,
  payload: UpdateSubjectPayload
): Promise<Subject> {
  const response = await api.patch<Subject>(`${SUBJECTS_BASE}/${publicId}`, payload);
  return response.data;
}

export async function deleteSubject(publicId: string): Promise<void> {
  await api.delete(`${SUBJECTS_BASE}/${publicId}`);
}

export async function reactivateSubject(publicId: string): Promise<Subject> {
  const response = await api.post<Subject>(`${SUBJECTS_BASE}/${publicId}/reactivate`);
  return response.data;
}

export interface BulkUploadResponse {
  success: boolean;
  message: string;
  created_count: number;
  failed_count: number;
  errors?: Array<{
    row: number;
    errors: Record<string, string[]>;
  }>;
}

export async function bulkUploadSubjects(file: File): Promise<BulkUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<BulkUploadResponse>(`${SUBJECTS_BASE}/bulk-upload/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
