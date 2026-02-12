/**
 * Teacher Types
 * TypeScript interfaces for teacher module
 */

/**
 * Teacher user information
 */
export interface TeacherUser {
  public_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  full_name: string;
  gender?: string;
  date_of_birth?: string;
  blood_group?: string;
  organization_role?: string;
  supervisor?: {
    email: string;
    full_name: string;
    public_id: string;
  };
  address?: {
    street_address?: string;
    address_line_2?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  };
}

/**
 * Subject information (from core/master subjects)
 */
export interface Subject {
  public_id: string; // Actually the numeric ID converted to string
  code: string;
  name: string;
}

/**
 * Teacher model (for list view - flattened response)
 */
export interface Teacher {
  public_id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone: string;
  designation: string;
  specialization: string;
  highest_qualification?: string;
  experience_years?: number;
  subjects: Subject[];
  created_at: string;
  updated_at: string;
  created_by_public_id: string | null;
  created_by_name: string | null;
  updated_by_public_id: string | null;
  updated_by_name: string | null;
}

/**
 * Teacher detail model (for detail view - nested user object)
 */
export interface TeacherDetail {
  public_id: string;
  user: TeacherUser;
  employee_id: string;
  designation: string;
  highest_qualification: string;
  specialization: string;
  experience_years: number | null;
  joining_date: string | null;
  subjects: Subject[];
  emergency_contact_name: string;
  emergency_contact_number: string;
  is_first_login: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

/**
 * Create teacher payload
 * Backend expects nested user object structure
 */
export interface CreateTeacherPayload {
  employee_id: string;
  designation?: string;
  highest_qualification?: string;
  specialization?: string;
  experience_years?: number;
  joining_date?: string;
  subjects?: number[]; // Array of subject IDs (integers)
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  user: {
    email: string;
    first_name: string;
    last_name: string;
    gender: string;
    organization_role_code: string;
    phone?: string;
    blood_group?: string;
    date_of_birth?: string;
    supervisor_email?: string;
    address?: {
      street_address?: string;
      address_line_2?: string;
      city?: string;
      state?: string;
      zip_code?: string;
      country?: string;
    };
  };
}

/**
 * Update teacher payload
 */
export interface UpdateTeacherPayload {
  employee_id?: string;
  designation?: string;
  highest_qualification?: string;
  specialization?: string;
  experience_years?: number;
  joining_date?: string;
  subjects?: number[]; // Array of subject IDs (integers)
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  user?: {
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    gender?: string;
    organization_role?: string;
    supervisor_email?: string;
    blood_group?: string;
    date_of_birth?: string;
    address?: {
      street_address?: string;
      address_line_2?: string;
      city?: string;
      state?: string;
      zip_code?: string;
      country?: string;
    };
  };
}

/**
 * Fetch teachers parameters
 */
export interface FetchTeachersParams {
  page?: number;
  page_size?: number;
  search?: string;
  designation?: string;
  subject?: string;
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
 * Paginated response structure (matches backend format)
 */
export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

/**
 * Backend API response wrapper
 */
export interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationInfo;
  code: number;
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

export type TeachersResponse = BackendApiResponse<Teacher[]>;
export type TeacherResponse = ApiResponse<Teacher>;
export type TeacherBulkUploadResponse = ApiResponse<BulkUploadResponse['data']>;
