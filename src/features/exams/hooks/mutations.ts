/**
 * Exam Mutations
 * All mutation hooks for exams module
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  handleMutationError,
  type FieldErrors,
  type MutationOptions,
} from '@/lib/utils/mutation-utils';
import {
  createExamSession,
  updateExamSession,
  deleteExamSession,
  reactivateExamSession,
  createExam,
  updateExam,
  deleteExam,
  reactivateExam,
  createExamSubject,
  updateExamSubject,
  deleteExamSubject,
  createMark,
  updateMark,
  deleteMark,
  bulkCreateMarks,
} from '../api/exams-api';
import { ErrorMessages, SuccessMessages } from '@/constants';
import type {
  ExamSessionCreatePayload,
  ExamSessionUpdatePayload,
  ExamCreatePayload,
  ExamUpdatePayload,
  ExamSubjectCreatePayload,
  ExamSubjectUpdatePayload,
  MarkCreatePayload,
  MarkUpdatePayload,
  BulkMarkCreatePayload,
} from '../types';

export type { MutationOptions };

// ── Exam Session Mutations ─────────────────────────────────

export function useCreateExamSession(options?: MutationOptions<FieldErrors>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExamSessionCreatePayload) => createExamSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-sessions'] });
      toast.success(SuccessMessages.EXAM_SESSION.CREATE_SUCCESS);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      handleMutationError(error, ErrorMessages.EXAM_SESSION.CREATE_FAILED, options?.onError);
    },
  });
}

export function useUpdateExamSession(options?: MutationOptions<FieldErrors>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExamSessionUpdatePayload }) =>
      updateExamSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-sessions'] });
      toast.success(SuccessMessages.EXAM_SESSION.UPDATE_SUCCESS);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      handleMutationError(error, ErrorMessages.EXAM_SESSION.UPDATE_FAILED, options?.onError);
    },
  });
}

export function useDeleteExamSession(options?: MutationOptions<FieldErrors>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExamSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-sessions'] });
      toast.success(SuccessMessages.EXAM_SESSION.DELETE_SUCCESS);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      handleMutationError(error, ErrorMessages.EXAM_SESSION.DELETE_FAILED, options?.onError);
    },
  });
}

export function useReactivateExamSession(options?: MutationOptions<FieldErrors>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reactivateExamSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-sessions'] });
      toast.success(SuccessMessages.EXAM_SESSION.REACTIVATE_SUCCESS);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      handleMutationError(error, ErrorMessages.EXAM_SESSION.REACTIVATE_FAILED, options?.onError);
    },
  });
}

// ── Exam Mutations ─────────────────────────────────────────

export function useCreateExam(options?: MutationOptions<FieldErrors>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExamCreatePayload) => createExam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exam-sessions'] });
      toast.success(SuccessMessages.EXAM.CREATE_SUCCESS);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      handleMutationError(error, ErrorMessages.EXAM.CREATE_FAILED, options?.onError);
    },
  });
}

export function useUpdateExam(options?: MutationOptions<FieldErrors>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExamUpdatePayload }) => updateExam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success(SuccessMessages.EXAM.UPDATE_SUCCESS);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      handleMutationError(error, ErrorMessages.EXAM.UPDATE_FAILED, options?.onError);
    },
  });
}

export function useDeleteExam(options?: MutationOptions<FieldErrors>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exam-sessions'] });
      toast.success(SuccessMessages.EXAM.DELETE_SUCCESS);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      handleMutationError(error, ErrorMessages.EXAM.DELETE_FAILED, options?.onError);
    },
  });
}

export function useReactivateExam(options?: MutationOptions<FieldErrors>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reactivateExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success(SuccessMessages.EXAM.REACTIVATE_SUCCESS);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      handleMutationError(error, ErrorMessages.EXAM.REACTIVATE_FAILED, options?.onError);
    },
  });
}

// ── Exam Subject Mutations ─────────────────────────────────

export function useCreateExamSubject(options?: MutationOptions<FieldErrors>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExamSubjectCreatePayload) => createExamSubject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-subjects'] });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success(SuccessMessages.EXAM_SUBJECT.CREATE_SUCCESS);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      handleMutationError(error, ErrorMessages.EXAM_SUBJECT.CREATE_FAILED, options?.onError);
    },
  });
}

export function useUpdateExamSubject(options?: MutationOptions<FieldErrors>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExamSubjectUpdatePayload }) =>
      updateExamSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-subjects'] });
      toast.success(SuccessMessages.EXAM_SUBJECT.UPDATE_SUCCESS);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      handleMutationError(error, ErrorMessages.EXAM_SUBJECT.UPDATE_FAILED, options?.onError);
    },
  });
}

export function useDeleteExamSubject(options?: MutationOptions<FieldErrors>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExamSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-subjects'] });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success(SuccessMessages.EXAM_SUBJECT.DELETE_SUCCESS);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      handleMutationError(error, ErrorMessages.EXAM_SUBJECT.DELETE_FAILED, options?.onError);
    },
  });
}

// ── Mark Mutations ─────────────────────────────────────────

export function useCreateMark(options?: MutationOptions<FieldErrors>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MarkCreatePayload) => createMark(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks'] });
      toast.success(SuccessMessages.MARK.CREATE_SUCCESS);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      handleMutationError(error, ErrorMessages.MARK.CREATE_FAILED, options?.onError);
    },
  });
}

export function useUpdateMark(options?: MutationOptions<FieldErrors>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MarkUpdatePayload }) => updateMark(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks'] });
      toast.success(SuccessMessages.MARK.UPDATE_SUCCESS);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      handleMutationError(error, ErrorMessages.MARK.UPDATE_FAILED, options?.onError);
    },
  });
}

export function useDeleteMark(options?: MutationOptions<FieldErrors>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks'] });
      toast.success(SuccessMessages.MARK.DELETE_SUCCESS);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      handleMutationError(error, ErrorMessages.MARK.DELETE_FAILED, options?.onError);
    },
  });
}

export function useBulkCreateMarks(options?: MutationOptions<FieldErrors>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkMarkCreatePayload) => bulkCreateMarks(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks'] });
      toast.success(SuccessMessages.MARK.BULK_CREATE_SUCCESS);
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      handleMutationError(error, ErrorMessages.MARK.BULK_CREATE_FAILED, options?.onError);
    },
  });
}
