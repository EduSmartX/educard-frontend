/**
 * Subjects Module Types
 */

export interface Subject {
  public_id: string;
  subject_name: string;
  subject_code: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CreateSubjectPayload {
  subject_name: string;
  subject_code: string;
  description?: string;
}

export interface UpdateSubjectPayload {
  subject_name?: string;
  subject_code?: string;
  description?: string;
}

export interface FetchSubjectsParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_deleted?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
