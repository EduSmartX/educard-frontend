/**
 * React Query hooks for exams
 */

import { useQuery } from '@tanstack/react-query';
import {
  fetchExamSessions,
  fetchExamSession,
  fetchExams,
  fetchExam,
  fetchExamSubjects,
  fetchExamSubject,
  fetchMarks,
} from '../api/exams-api';
import type {
  ExamSessionListParams,
  ExamListParams,
  ExamSubjectListParams,
  MarkListParams,
} from '../types';

// ── Exam Sessions ──────────────────────────────────────────

export function useExamSessions(params?: ExamSessionListParams) {
  return useQuery({
    queryKey: ['exam-sessions', params],
    queryFn: () => fetchExamSessions(params),
  });
}

export function useExamSession(publicId?: string) {
  return useQuery({
    queryKey: ['exam-session', publicId],
    queryFn: () => fetchExamSession(publicId!),
    enabled: !!publicId,
  });
}

// ── Exams ──────────────────────────────────────────────────

export function useExams(params?: ExamListParams) {
  return useQuery({
    queryKey: ['exams', params],
    queryFn: () => fetchExams(params),
  });
}

export function useExam(publicId?: string) {
  return useQuery({
    queryKey: ['exam', publicId],
    queryFn: () => fetchExam(publicId!),
    enabled: !!publicId,
  });
}

// ── Exam Subjects ──────────────────────────────────────────

export function useExamSubjects(params?: ExamSubjectListParams) {
  return useQuery({
    queryKey: ['exam-subjects', params],
    queryFn: () => fetchExamSubjects(params),
  });
}

export function useExamSubject(publicId?: string) {
  return useQuery({
    queryKey: ['exam-subject', publicId],
    queryFn: () => fetchExamSubject(publicId!),
    enabled: !!publicId,
  });
}

// ── Marks ──────────────────────────────────────────────────

export function useMarks(params?: MarkListParams) {
  return useQuery({
    queryKey: ['marks', params],
    queryFn: () => fetchMarks(params),
  });
}
