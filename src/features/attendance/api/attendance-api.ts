import { apiClient } from '@/lib/api-client';
import type {
  EligibleClass,
  DateValidation,
  AttendanceRecord,
  BulkAttendancePayload,
  ComprehensiveAttendanceRecord,
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
