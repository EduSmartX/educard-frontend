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
 * Class model - Updated to match backend response
 */
export interface Class {
  public_id: string;
  class_master: {
    id: number;
    name: string;
    code: string;
    display_order: number;
  };
  name: string; // Section name (e.g., "A", "B")
  organization: number;
  class_teacher: {
    public_id: string;
    email: string;
    full_name: string;
    employee_id: string;
  } | null;
  info: string;
  capacity: number;
  student_count: number;
  created_at: string;
  updated_at: string;
  created_by_public_id: string;
  created_by_name: string;
  updated_by_public_id: string;
  updated_by_name: string;
  is_deleted?: boolean;
}

/**
 * Create class payload
 */
export interface CreateClassPayload {
  class_master: number; // id from core classes
  name: string; // section name (e.g., "A", "B", "Section A")
  class_teacher?: string; // public_id
  info?: string;
  capacity?: number;
}

/**
 * Update class payload
 */
export interface UpdateClassPayload {
  class_master?: number;
  name?: string;
  class_teacher?: string;
  info?: string;
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
 * Pagination metadata from backend
 */
export interface PaginationMeta {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
}

/**
 * Paginated response structure - Updated to match backend
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * API response types
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code: number;
}

export type ClassesResponse = ApiResponse<Class[]> & { pagination: PaginationMeta };
export type ClassResponse = ApiResponse<Class>;
export type ClassBulkUploadResponse = ApiResponse<BulkUploadResponse['data']>;
