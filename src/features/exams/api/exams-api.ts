/**
 * Exams API Client
 */

import apiClient from '@/lib/api';
import type { ApiListResponse } from '@/lib/utils/api-response-handler';
import type {
  ExamSession,
  ExamSessionListParams,
  ExamSessionCreatePayload,
  ExamSessionUpdatePayload,
  Exam,
  ExamListParams,
  ExamCreatePayload,
  ExamUpdatePayload,
  ExamSubject,
  ExamSubjectListParams,
  ExamSubjectCreatePayload,
  ExamSubjectUpdatePayload,
  Mark,
  MarkListParams,
  MarkCreatePayload,
  MarkUpdatePayload,
  BulkMarkCreatePayload,
} from '../types';

const BASE_URL = '/exams';

// ── Helper ─────────────────────────────────────────────────

function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) return '';
  const qp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      qp.append(key, String(value));
    }
  });
  const str = qp.toString();
  return str ? `?${str}` : '';
}

// ── Exam Sessions ──────────────────────────────────────────

export async function fetchExamSessions(
  params?: ExamSessionListParams
): Promise<ApiListResponse<ExamSession>> {
  const qs = buildQueryString(params);
  const response = await apiClient.get<ApiListResponse<ExamSession>>(
    `${BASE_URL}/sessions/${qs}`
  );
  return response.data;
}

export async function fetchExamSession(publicId: string): Promise<ExamSession> {
  const response = await apiClient.get<{ success: boolean; data: ExamSession }>(
    `${BASE_URL}/sessions/${publicId}/`
  );
  return response.data.data;
}

export async function createExamSession(data: ExamSessionCreatePayload): Promise<ExamSession> {
  const response = await apiClient.post<{ success: boolean; data: ExamSession }>(
    `${BASE_URL}/sessions/`,
    data
  );
  return response.data.data;
}

export async function updateExamSession(
  publicId: string,
  data: ExamSessionUpdatePayload
): Promise<ExamSession> {
  const response = await apiClient.patch<{ success: boolean; data: ExamSession }>(
    `${BASE_URL}/sessions/${publicId}/`,
    data
  );
  return response.data.data;
}

export async function deleteExamSession(publicId: string): Promise<void> {
  await apiClient.delete(`${BASE_URL}/sessions/${publicId}/`);
}

export async function reactivateExamSession(publicId: string): Promise<ExamSession> {
  const response = await apiClient.post<{ success: boolean; data: ExamSession }>(
    `${BASE_URL}/sessions/${publicId}/activate/`
  );
  return response.data.data;
}

// ── Exams ──────────────────────────────────────────────────

export async function fetchExams(params?: ExamListParams): Promise<ApiListResponse<Exam>> {
  const qs = buildQueryString(params);
  const response = await apiClient.get<ApiListResponse<Exam>>(`${BASE_URL}/exams/${qs}`);
  return response.data;
}

export async function fetchExam(publicId: string): Promise<Exam> {
  const response = await apiClient.get<{ success: boolean; data: Exam }>(
    `${BASE_URL}/exams/${publicId}/`
  );
  return response.data.data;
}

export async function createExam(data: ExamCreatePayload): Promise<Exam> {
  const response = await apiClient.post<{ success: boolean; data: Exam }>(
    `${BASE_URL}/exams/`,
    data
  );
  return response.data.data;
}

export async function updateExam(publicId: string, data: ExamUpdatePayload): Promise<Exam> {
  const response = await apiClient.patch<{ success: boolean; data: Exam }>(
    `${BASE_URL}/exams/${publicId}/`,
    data
  );
  return response.data.data;
}

export async function deleteExam(publicId: string): Promise<void> {
  await apiClient.delete(`${BASE_URL}/exams/${publicId}/`);
}

export async function reactivateExam(publicId: string): Promise<Exam> {
  const response = await apiClient.post<{ success: boolean; data: Exam }>(
    `${BASE_URL}/exams/${publicId}/activate/`
  );
  return response.data.data;
}

// ── Exam Subjects ──────────────────────────────────────────

export async function fetchExamSubjects(
  params?: ExamSubjectListParams
): Promise<ApiListResponse<ExamSubject>> {
  const qs = buildQueryString(params);
  const response = await apiClient.get<ApiListResponse<ExamSubject>>(
    `${BASE_URL}/exam-subjects/${qs}`
  );
  return response.data;
}

export async function fetchExamSubject(publicId: string): Promise<ExamSubject> {
  const response = await apiClient.get<{ success: boolean; data: ExamSubject }>(
    `${BASE_URL}/exam-subjects/${publicId}/`
  );
  return response.data.data;
}

export async function createExamSubject(data: ExamSubjectCreatePayload): Promise<ExamSubject> {
  const response = await apiClient.post<{ success: boolean; data: ExamSubject }>(
    `${BASE_URL}/exam-subjects/`,
    data
  );
  return response.data.data;
}

export async function updateExamSubject(
  publicId: string,
  data: ExamSubjectUpdatePayload
): Promise<ExamSubject> {
  const response = await apiClient.patch<{ success: boolean; data: ExamSubject }>(
    `${BASE_URL}/exam-subjects/${publicId}/`,
    data
  );
  return response.data.data;
}

export async function deleteExamSubject(publicId: string): Promise<void> {
  await apiClient.delete(`${BASE_URL}/exam-subjects/${publicId}/`);
}

// ── Marks ──────────────────────────────────────────────────

export async function fetchMarks(params?: MarkListParams): Promise<ApiListResponse<Mark>> {
  const qs = buildQueryString(params);
  const response = await apiClient.get<ApiListResponse<Mark>>(`${BASE_URL}/marks/${qs}`);
  return response.data;
}

export async function fetchMark(publicId: string): Promise<Mark> {
  const response = await apiClient.get<{ success: boolean; data: Mark }>(
    `${BASE_URL}/marks/${publicId}/`
  );
  return response.data.data;
}

export async function createMark(data: MarkCreatePayload): Promise<Mark> {
  const response = await apiClient.post<{ success: boolean; data: Mark }>(
    `${BASE_URL}/marks/`,
    data
  );
  return response.data.data;
}

export async function updateMark(publicId: string, data: MarkUpdatePayload): Promise<Mark> {
  const response = await apiClient.patch<{ success: boolean; data: Mark }>(
    `${BASE_URL}/marks/${publicId}/`,
    data
  );
  return response.data.data;
}

export async function deleteMark(publicId: string): Promise<void> {
  await apiClient.delete(`${BASE_URL}/marks/${publicId}/`);
}

export async function bulkCreateMarks(
  data: BulkMarkCreatePayload
): Promise<{ success: boolean; message: string; data: Mark[] }> {
  const response = await apiClient.post<{ success: boolean; message: string; data: Mark[] }>(
    `${BASE_URL}/marks/bulk-create/`,
    data
  );
  return response.data;
}
