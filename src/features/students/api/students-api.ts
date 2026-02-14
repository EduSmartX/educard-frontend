import api from '@/lib/api';
import type {
  Student,
  StudentListItem,
  CreateStudentPayload,
  UpdateStudentPayload,
  StudentQueryParams,
  BulkUploadResult,
  ExportStudentsResult,
  ExportStudentsPayload,
} from '../types';
import type { ApiListResponse, ApiDetailResponse } from '@/lib/utils/api-response-handler';

const STUDENTS_BASE = '/students';
const CLASS_STUDENTS_BASE = (classId: string) => `/students/classes/${classId}/students`;

// API Response types for transformation
interface StudentApiResponse {
  public_id: string;
  user_info: {
    public_id: string;
    username: string;
    full_name: string;
    email?: string;
    phone?: string;
    gender?: string;
  };
  class_info: {
    public_id: string;
    class_master_name: string;
    name: string;
  };
  roll_number: string;
  admission_number?: string;
  admission_date?: string;
  guardian_name?: string;
  gender?: string; // Some backends return gender at root level
  is_deleted?: boolean;
  created_at: string;
  updated_at: string;
  created_by_public_id?: string | null;
  created_by_name?: string | null;
  updated_by_public_id?: string | null;
  updated_by_name?: string | null;
}

// Organization-level (read-only, list all students)
export async function fetchStudents(
  params: StudentQueryParams = {}
): Promise<ApiListResponse<StudentListItem>> {
  const response = await api.get<ApiListResponse<StudentApiResponse>>(STUDENTS_BASE, { params });

  // Transform nested API response to flat StudentListItem
  const transformedData: StudentListItem[] = response.data.data.map(
    (student: StudentApiResponse) => ({
      public_id: student.public_id,
      full_name: student.user_info?.full_name || '',
      roll_number: student.roll_number || '',
      admission_number: student.admission_number || '',
      admission_date: student.admission_date,
      email: student.user_info?.email || '',
      phone: student.user_info?.phone || '',
      class_name: student.class_info?.name || '',
      class_id: student.class_info?.public_id || '',
      class_master_name: student.class_info?.class_master_name || '',
      // Gender can be in user_info or at root level (depending on backend)
      gender: (student.user_info?.gender || student.gender || '') as StudentListItem['gender'],
      is_active: !student.is_deleted,
    })
  );

  return {
    ...response.data,
    data: transformedData,
  };
}

export async function fetchStudent(publicId: string, isDeleted = false): Promise<Student> {
  const params = isDeleted ? { is_deleted: 'true' } : {};
  const response = await api.get<ApiDetailResponse<Student>>(`${STUDENTS_BASE}/${publicId}/`, {
    params,
  });
  return response.data.data;
}

// Class-level (full CRUD)
export async function createStudent(
  classId: string,
  payload: CreateStudentPayload
): Promise<Student> {
  const response = await api.post<ApiDetailResponse<Student>>(
    `${CLASS_STUDENTS_BASE(classId)}/`,
    payload
  );
  return response.data.data;
}

export async function updateStudent(
  classId: string,
  publicId: string,
  payload: UpdateStudentPayload
): Promise<Student> {
  const response = await api.patch<ApiDetailResponse<Student>>(
    `${CLASS_STUDENTS_BASE(classId)}/${publicId}/`,
    payload
  );
  return response.data.data;
}

export async function deleteStudent(classId: string, publicId: string): Promise<void> {
  await api.delete(`${CLASS_STUDENTS_BASE(classId)}/${publicId}/`);
}

export async function reactivateStudent(classId: string, publicId: string): Promise<Student> {
  const response = await api.post<ApiDetailResponse<Student>>(
    `${CLASS_STUDENTS_BASE(classId)}/${publicId}/activate/`
  );
  return response.data.data;
}

// Bulk operations
export async function downloadStudentTemplate(minimalFields = false): Promise<Blob> {
  const params = minimalFields ? { minimal_fields: 'true' } : {};
  const response = await api.get(`${STUDENTS_BASE}/bulk-operations/download_template/`, {
    params,
    responseType: 'blob',
  });
  return response.data;
}

export async function bulkUploadStudents(file: File): Promise<BulkUploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<BulkUploadResult>(
    `${STUDENTS_BASE}/bulk-operations/bulk_upload/`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data;
}

export async function exportStudents(
  payload: ExportStudentsPayload = {}
): Promise<ExportStudentsResult> {
  const response = await api.post<ExportStudentsResult>(
    `${STUDENTS_BASE}/bulk-operations/export_students_data/`,
    payload
  );
  return response.data;
}
