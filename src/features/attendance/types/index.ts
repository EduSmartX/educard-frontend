// Attendance Types

export type AttendancePeriod = 'morning' | 'afternoon' | 'full_day';

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'HALF_DAY_FIRST'
  | 'HALF_DAY_SECOND'
  | 'LEAVE'
  | 'HOLIDAY';

export interface DateValidation {
  is_working_day: boolean;
  date: string;
  reason: string | null;
}

export interface EligibleClass {
  public_id: string;
  class_master: {
    public_id: string;
    name: string;
    display_order: number;
  };
  name: string;
  display_name: string;
  class_teacher: {
    public_id: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
  } | null;
  capacity: number;
  student_count: number;
  info: string;
}

export interface Student {
  public_id: string;
  user: {
    public_id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  roll_number: string;
  admission_number: string;
  class_assigned: {
    public_id: string;
    display_name: string;
  };
}

export interface AttendanceRecord {
  public_id?: string;
  user: string; // student public_id
  morning_present: boolean;
  afternoon_present: boolean;
  remarks: string;
  status?: AttendanceStatus;
  marked_by?: {
    first_name: string;
    last_name: string;
  };
}

export interface LeaveInfo {
  leave_status: 'approved' | 'pending' | null;
  leave_type: string | null;
  leave_reason: string | null;
  leave_start_date: string | null;
  leave_end_date: string | null;
}

export interface ComprehensiveAttendanceRecord {
  // Student information
  public_id: string;
  first_name: string;
  last_name: string;
  email: string;
  roll_number: string | null;
  admission_number: string | null;

  // Attendance information
  attendance_public_id: string | null;
  morning_present: boolean | null;
  afternoon_present: boolean | null;
  attendance_status: AttendanceStatus | null;
  attendance_remarks: string | null;

  // Leave information
  leave_status: 'approved' | 'pending' | null;
  leave_type: string | null;
  leave_reason: string | null;
  leave_start_date: string | null;
  leave_end_date: string | null;
}

// UI-specific student row for attendance forms
export interface StudentRow {
  // From ComprehensiveAttendanceRecord
  public_id: string;
  first_name: string;
  last_name: string;
  email: string;
  roll_number: string | null;
  admission_number: string | null;
  attendance_public_id: string | null;
  // Override to ensure non-null booleans
  morning_present: boolean;
  afternoon_present: boolean;
  attendance_status: AttendanceStatus | undefined;
  attendance_remarks: string | null;
  leave_status: 'approved' | 'pending' | null;
  leave_type: string | null;
  leave_reason: string | null;
  leave_start_date: string | null;
  leave_end_date: string | null;

  // Extra fields for UI
  canEdit: boolean;
  remarks: string;
  user: {
    public_id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  class_assigned: {
    public_id: string;
    display_name: string;
  };
  leave_info?: {
    leave_status: 'approved' | 'pending' | null;
    leave_type: string | null;
    leave_reason: string | null;
  };
  already_marked?: boolean;
}

export interface StudentAttendanceRow extends Student {
  morning_present: boolean;
  afternoon_present: boolean;
  remarks: string;
  attendance_status?: AttendanceStatus;
  already_marked?: boolean;
  leave_info?: LeaveInfo;
}

export interface DateValidation {
  is_working_day: boolean;
  date: string;
  holiday_info: {
    type: string;
    description: string;
  } | null;
  exception_info: {
    override_type: string;
    reason: string;
  } | null;
  default_attendance_behavior: boolean; // true = present by default, false = absent by default
}

export interface BulkAttendancePayload {
  date: string;
  period: AttendancePeriod;
  attendance_records: Array<{
    user: string;
    morning_present: boolean;
    afternoon_present: boolean;
    remarks: string;
  }>;
}

export interface AttendanceFormData {
  class_id: string;
  date: string;
  period: AttendancePeriod;
  students: StudentAttendanceRow[];
}

export interface EmployeeAttendanceRecord {
  public_id: string;
  date: string;
  morning_present: boolean;
  afternoon_present: boolean;
  approval_status: string;
  remarks?: string;
}

export interface EmployeeAttendanceBulkPayload {
  attendance_records: Array<{
    date: string;
    morning_present: boolean;
    afternoon_present: boolean;
    remarks?: string;
  }>;
}

export interface EmployeeSubmissionConfig {
  default_present: boolean;
  timesheet_deadline_day: number;
}
