/**
 * Students Module Types
 */

export interface StudentUser {
  public_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  organization: string;
}

export interface Student {
  public_id: string;
  user: StudentUser;
  student_id: string;
  date_of_birth: string; // ISO date string
  parent_name: string | null;
  parent_phone: string | null;
  parent_email: string | null;
  class_id: string | null;
  class_name: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CreateStudentPayload {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth: string; // YYYY-MM-DD format
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  class_id?: string;
}

export interface UpdateStudentPayload {
  student_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  class_id?: string;
}

export interface FetchStudentsParams {
  page?: number;
  page_size?: number;
  search?: string;
  class_id?: string;
  is_deleted?: boolean;
}

export interface BulkUploadResponse {
  message: string;
  created_count: number;
  failed_count: number;
  errors?: Array<{
    row: number;
    errors: Record<string, string[]>;
  }>;
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
