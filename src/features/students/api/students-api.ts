/**
 * Students API
 */

import api from '@/lib/api';
import type {
  Student,
  CreateStudentPayload,
  UpdateStudentPayload,
  FetchStudentsParams,
  PaginatedResponse,
  BulkUploadResponse,
} from '../types';

const STUDENTS_BASE = '/students';

export async function fetchStudents(
  params: FetchStudentsParams = {}
): Promise<PaginatedResponse<Student>> {
  const response = await api.get<PaginatedResponse<Student>>(STUDENTS_BASE, { params });
  return response.data;
}

export async function fetchStudent(publicId: string): Promise<Student> {
  const response = await api.get<Student>(`${STUDENTS_BASE}/${publicId}`);
  return response.data;
}

export async function createStudent(payload: CreateStudentPayload): Promise<Student> {
  const response = await api.post<Student>(STUDENTS_BASE, payload);
  return response.data;
}

export async function updateStudent(
  publicId: string,
  payload: UpdateStudentPayload
): Promise<Student> {
  const response = await api.patch<Student>(`${STUDENTS_BASE}/${publicId}`, payload);
  return response.data;
}

export async function deleteStudent(publicId: string): Promise<void> {
  await api.delete(`${STUDENTS_BASE}/${publicId}`);
}

export async function bulkUploadStudents(file: File): Promise<BulkUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<BulkUploadResponse>(
    `${STUDENTS_BASE}/bulk-operations/bulk-upload/`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data;
}

export async function reactivateStudent(publicId: string): Promise<Student> {
  const response = await api.post<Student>(`${STUDENTS_BASE}/${publicId}/reactivate`);
  return response.data;
}
