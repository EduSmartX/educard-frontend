import { apiClient } from '@/lib/api-client';
import type {
  EligibleClass,
  DateValidation,
  AttendanceRecord,
  BulkAttendancePayload,
  ComprehensiveAttendanceRecord,
  EmployeeAttendanceBulkPayload,
  EmployeeAttendanceRecord,
  EmployeeSubmissionConfig,
} from '../types';

// Get eligible classes for attendance marking
export const getEligibleClasses = async (purpose = 'attendance'): Promise<EligibleClass[]> => {
  const response = await apiClient.get(`/classes/employee/eligible/`, {
    params: { purpose },
  });
  return response.data.data || response.data;
};

// Validate if attendance can be marked for a date
export const validateAttendanceDate = async (
  classId: string,
  date: string
): Promise<DateValidation> => {
  const response = await apiClient.get(
    `/attendance/class/${classId}/student-attendance/validate-date/`,
    { params: { date } }
  );
  return response.data.data || response.data;
};

export const getStudentsForClass = async (classId: string) => {
  const today = new Date().toISOString().slice(0, 10);
  const comprehensive = await getComprehensiveAttendance(classId, today);

  return (comprehensive || []).map((s) => ({
    public_id: s.public_id,
    user: {
      public_id: s.public_id,
      first_name: s.first_name,
      last_name: s.last_name,
      email: s.email,
    },
    roll_number: s.roll_number || '',
    admission_number: s.admission_number || '',
    class_assigned: {
      public_id: classId,
      display_name: '',
    },
  }));
};

export const getAttendanceForDate = async (
  classId: string,
  date: string
): Promise<AttendanceRecord[]> => {
  const response = await apiClient.get(`/attendance/class/${classId}/student-attendance/by-date/`, {
    params: { date },
  });
  return response.data.data || response.data;
};

// Get comprehensive attendance data with leave information (RECOMMENDED)
// This replaces the need for separate student list and attendance calls
export const getComprehensiveAttendance = async (
  classId: string,
  date: string
): Promise<ComprehensiveAttendanceRecord[]> => {
  const response = await apiClient.get(
    `/attendance/class/${classId}/student-attendance/comprehensive/`,
    {
      params: { date },
    }
  );
  return response.data.data || response.data;
};

// Bulk mark student attendance
export const bulkMarkAttendance = async (
  classId: string,
  payload: BulkAttendancePayload
): Promise<{ message: string; data: { failed: number; records: AttendanceRecord[] } }> => {
  const response = await apiClient.post(
    `/attendance/class/${classId}/student-attendance/bulk-mark/`,
    payload
  );
  return response.data;
};

export const getEmployeeAttendance = async (params: {
  from_date: string;
  to_date: string;
}): Promise<{
  records: EmployeeAttendanceRecord[];
  stats: Record<string, number>;
  submission_config: EmployeeSubmissionConfig;
}> => {
  const response = await apiClient.get('/attendance/employee-attendance/', { params });
  const payload = response.data || {};

  const records = Array.isArray(payload.results)
    ? payload.results
    : Array.isArray(payload.data)
      ? payload.data
      : [];

  return {
    records: records as EmployeeAttendanceRecord[],
    stats: payload.stats || {},
    submission_config: payload.submission_config || {},
  };
};

export const bulkSubmitEmployeeAttendance = async (payload: EmployeeAttendanceBulkPayload) => {
  const response = await apiClient.post('/attendance/employee-attendance/bulk_submit/', payload);
  return response.data;
};

// Fetch organization holidays for a date range
export const fetchOrganizationHolidays = async (params: {
  from_date: string;
  to_date: string;
}): Promise<{
  holidays: Array<{
    public_id: string;
    start_date: string;
    end_date: string;
    holiday_type: string;
    description: string;
  }>;
}> => {
  const response = await apiClient.get('/attendance/admin/holiday-calendar/', {
    params,
  });
  
  const payload = response.data || {};
  const holidays = Array.isArray(payload.results)
    ? payload.results
    : Array.isArray(payload.data)
      ? payload.data
      : [];

  return { holidays };
};
