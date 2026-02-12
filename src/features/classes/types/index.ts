/**
 * Class Types
 * TypeScript interfaces for class module
 */

/**
 * Teacher information
 */
export interface ClassTeacher {
  public_id: string;
  full_name: string;
  employee_id: string;
}

/**
 * Class model
 */
export interface Class {
  public_id: string;
  name: string; // e.g., "10-A"
  standard: number; // 1-12
  section: string; // A-Z
  class_teacher: ClassTeacher | null;
  academic_year: string;
  division: string;
  capacity: number;
  student_count: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

/**
 * Create class payload
 */
export interface CreateClassPayload {
  standard: number;
  section: string;
  class_teacher?: string; // public_id
  academic_year: string;
  division?: string;
  capacity?: number;
}

/**
 * Update class payload
 */
export interface UpdateClassPayload {
  standard?: number;
  section?: string;
  class_teacher?: string;
  academic_year?: string;
  division?: string;
  capacity?: number;
}

/**
 * Fetch classes parameters
 */
export interface FetchClassesParams {
  page?: number;
  page_size?: number;
  search?: string;
  standard?: number;
  academic_year?: string;
  is_deleted?: boolean;
}

/**
 * Bulk upload response
 */
export interface BulkUploadResponse {
  success: boolean;
  message: string;
  data: {
    created_count: number;
    failed_count: number;
    errors?: Array<{
      row: number;
      errors: Record<string, string[]>;
    }>;
  };
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * API response types
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export type ClassesResponse = ApiResponse<PaginatedResponse<Class>>;
export type ClassResponse = ApiResponse<Class>;
export type ClassBulkUploadResponse = ApiResponse<BulkUploadResponse['data']>;
