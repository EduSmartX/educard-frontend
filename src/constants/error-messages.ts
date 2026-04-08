/**
 * Centralized error messages for the application
 * Use these constants instead of hardcoding error messages
 */

export const ErrorMessages = {
  // Generic errors
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  GENERIC_RETRY: 'An error occurred. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  NO_SERVER_RESPONSE: 'No response from server. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  AUTH_REQUIRED: 'Authentication required. Please login again.',
  FORBIDDEN: 'Access forbidden.',
  FORBIDDEN_ACTION: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  INVALID_REQUEST: 'Invalid request. Please check your input.',
  VALIDATION_ERROR: 'Validation error. Please check your input.',
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
  SERVER_ERROR: 'Server error. Please try again later.',
  SERVICE_UNAVAILABLE: 'Service unavailable. Please try again later.',
  CONFLICT: 'A conflict occurred.',

  // Authentication errors
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  INVALID_TOKEN: 'Invalid or expired token.',

  // Validation errors
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  INVALID_DATE: 'Please enter a valid date.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters.',

  // CRUD operation errors
  CREATE_FAILED: 'Failed to create. Please try again.',
  UPDATE_FAILED: 'Failed to update. Please try again.',
  DELETE_FAILED: 'Failed to delete. Please try again.',
  FETCH_FAILED: 'Failed to load data. Please try again.',

  // Feature-specific errors
  STUDENT: {
    CREATE_FAILED: 'Failed to create student. Please try again.',
    UPDATE_FAILED: 'Failed to update student. Please try again.',
    DELETE_FAILED: 'Failed to delete student. Please try again.',
    REACTIVATE_FAILED: 'Failed to reactivate student. Please try again.',
    FETCH_FAILED: 'Failed to load students. Please try again.',
    BULK_UPLOAD_FAILED: 'Failed to upload students. Please try again.',
    DOWNLOAD_TEMPLATE_FAILED: 'Failed to download student template.',
    NOT_FOUND: 'Student not found.',
  },

  TEACHER: {
    CREATE_FAILED: 'Failed to create teacher. Please try again.',
    UPDATE_FAILED: 'Failed to update teacher. Please try again.',
    DELETE_FAILED: 'Failed to delete teacher. Please try again.',
    REACTIVATE_FAILED: 'Failed to reactivate teacher. Please try again.',
    FETCH_FAILED: 'Failed to load teachers. Please try again.',
    BULK_UPLOAD_FAILED: 'Failed to upload teachers. Please try again.',
    DOWNLOAD_TEMPLATE_FAILED: 'Failed to download teacher template.',
    NOT_FOUND: 'Teacher not found.',
  },

  CLASS: {
    CREATE_FAILED: 'Failed to create class. Please try again.',
    UPDATE_FAILED: 'Failed to update class. Please try again.',
    DELETE_FAILED: 'Failed to delete class. Please try again.',
    REACTIVATE_FAILED: 'Failed to reactivate class. Please try again.',
    BULK_UPLOAD_FAILED: 'Failed to upload classes. Please try again.',
    FETCH_FAILED: 'Failed to load classes. Please try again.',
    NOT_FOUND: 'Class not found.',
  },

  SUBJECT: {
    CREATE_FAILED: 'Failed to create subject. Please try again.',
    UPDATE_FAILED: 'Failed to update subject. Please try again.',
    DELETE_FAILED: 'Failed to delete subject. Please try again.',
    REACTIVATE_FAILED: 'Failed to reactivate subject. Please try again.',
    FETCH_FAILED: 'Failed to load subjects. Please try again.',
    BULK_UPLOAD_FAILED: 'Failed to upload subjects. Please try again.',
    DOWNLOAD_TEMPLATE_FAILED: 'Failed to download subject template.',
    NOT_FOUND: 'Subject not found.',
  },

  ATTENDANCE: {
    MARK_FAILED: 'Failed to mark attendance. Please try again.',
    BULK_MARK_FAILED: 'Failed to bulk mark attendance. Please try again.',
    FETCH_FAILED: 'Failed to load attendance records. Please try again.',
    APPROVE_FAILED: 'Failed to approve attendance. Please try again.',
    VALIDATE_DATE_FAILED: 'Failed to validate date. Please try again.',
    INVALID_DATE: 'Invalid attendance date.',
    NO_PERMISSION: 'You do not have permission to mark attendance for this class.',
    TIMESHEET_SUBMIT_FAILED: 'Failed to submit timesheet. Please try again.',
    TIMESHEET_FETCH_FAILED: 'Failed to load timesheet submissions. Please try again.',
    TIMESHEET_REVIEW_FAILED: 'Failed to review timesheet. Please try again.',
    TIMESHEET_APPROVE_FAILED: 'Failed to approve timesheet. Please try again.',
    TIMESHEET_REJECT_FAILED: 'Failed to reject timesheet. Please try again.',
    EMPLOYEE_ATTENDANCE_FETCH_FAILED: 'Failed to load employee attendance. Please try again.',
    REJECTION_COMMENT_REQUIRED: 'Comments are required when rejecting a timesheet.',
  },

  HOLIDAY: {
    CREATE_FAILED: 'Failed to create holiday. Please try again.',
    UPDATE_FAILED: 'Failed to update holiday. Please try again.',
    DELETE_FAILED: 'Failed to delete holiday. Please try again.',
    FETCH_FAILED: 'Failed to load holidays. Please try again.',
    BULK_UPLOAD_FAILED: 'Failed to upload holidays. Please try again.',
    DOWNLOAD_TEMPLATE_FAILED: 'Failed to download holiday template.',
  },

  ORGANIZATION: {
    CREATE_FAILED: 'Failed to create organization. Please try again.',
    UPDATE_FAILED: 'Failed to update organization. Please try again.',
    FETCH_FAILED: 'Failed to load organization details. Please try again.',
    NOT_FOUND: 'Organization not found.',
  },

  LEAVE: {
    CREATE_REQUEST_FAILED: 'Failed to submit leave request. Please try again.',
    UPDATE_REQUEST_FAILED: 'Failed to update leave request. Please try again.',
    CANCEL_REQUEST_FAILED: 'Failed to cancel leave request. Please try again.',
    APPROVE_REQUEST_FAILED: 'Failed to approve leave request. Please try again.',
    REJECT_REQUEST_FAILED: 'Failed to reject leave request. Please try again.',
    DELETE_ALLOCATION_FAILED: 'Failed to delete leave allocation. Please try again.',
    ADD_BALANCE_FAILED: 'Failed to add leave balance. Please try again.',
    UPDATE_BALANCE_FAILED: 'Failed to update leave balance. Please try again.',
    DELETE_BALANCE_FAILED: 'Failed to delete leave balance. Please try again.',
    USER_NOT_SELECTED: 'User not selected.',
    NO_AVAILABLE_TYPES: 'No available leave types.',
  },

  AUTH: {
    PENDING_APPROVAL: 'Organization pending approval.',
    ORGANIZATION_REJECTED: 'Organization has been rejected.',
    SEND_OTP_FAILED: 'Failed to send OTP. Please try again.',
    INVALID_OTP: 'Please enter a valid 6-digit OTP.',
    VERIFY_OTP_FAILED: 'Failed to verify OTP. Please try again.',
    PASSWORD_RESET_FAILED: 'Invalid OTP or failed to reset password. Please try again.',
  },

  PROFILE: {
    UPDATE_FAILED: 'Failed to update profile. Please try again.',
    CHANGE_PASSWORD_FAILED: 'Failed to change password. Please try again.',
    SEND_OTP_FAILED: 'Failed to send OTP. Please try again.',
    UPDATE_EMAIL_FAILED: 'Failed to update email. Please try again.',
    UPDATE_PHONE_FAILED: 'Failed to update phone. Please try again.',
    PHOTO_UPLOAD_FAILED: 'Failed to upload profile photo. Please try again.',
    PHOTO_DELETE_FAILED: 'Failed to delete profile photo. Please try again.',
    PHOTO_FETCH_FAILED: 'Failed to load profile photo.',
  },

  LOCATION_UNAVAILABLE: 'Unable to get location.',
  FILE_NOT_SELECTED: 'Please select a file to upload.',

  // File upload errors
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload the correct file format.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',

  // Form validation errors
  FORM: {
    INVALID_INPUT: 'Please check your input and try again.',
    MISSING_REQUIRED: 'Please fill in all required fields.',
  },
} as const;

export const ToastTitles = {
  ERROR: 'Error',
  VALIDATION_ERROR: 'Validation Error',
  SUCCESS: 'Success',
} as const;

export const CommonUiText = {
  CANCEL: 'Cancel',
  RESET: 'Reset',
  SAVE: 'Save',
  SAVE_CHANGES: 'Save Changes',
  SAVING: 'Saving...',
  RETRY: 'Retry',
  NO_CHANGES: 'No Changes',
  CHANGES_DISCARDED: 'Changes Discarded',
  DISCARD_CHANGES: 'Discard Changes',
  SEND_OTP: 'Send OTP',
  UPDATE_EMAIL: 'Update Email',
  UPDATE_PHONE: 'Update Phone',
  CHANGE_PASSWORD: 'Change Password',
  SIGN_IN: 'Sign In',
  FORGOT_PASSWORD: 'Forgot password?',
  LOADING: 'Loading...',
  SUBMITTING: 'Submitting...',
  GETTING_LOCATION: 'Getting location...',
} as const;

export const FormPlaceholders = {
  SELECT_LEAVE_TYPE: 'Select leave type',
  SELECT_STATUS: 'Select status',
  SELECT_USER: 'Select user',
  ALL_LEAVE_TYPES: 'All leave types',
  SELECT_LEAVE_ALLOCATION_POLICY: 'Select a leave allocation policy...',
  SEARCH_LEAVE_TYPES: 'Search leave types...',
  SEARCH_CLASSES: 'Search classes...',
  SEARCH_USERS: 'Search users...',
  SELECT_OPTION: 'Select an option',
  SELECT_OPTIONS: 'Select options',
  SELECT_SATURDAY_PATTERN: 'Select Saturday pattern',
  ACADEMIC_YEAR_EXAMPLE: 'e.g., 2025-26',
  SELECT_CLASS: 'Select class',
  SELECT_ADDRESS_TYPE: 'Select address type',
  SELECT_SUBJECT: 'Select subject',
  SELECT_TEACHER: 'Select teacher',
  SELECT_CLASS_TEACHER: 'Select class teacher',
  SELECT_RELATIONSHIP: 'Select relationship',
  SELECT_SUPERVISOR: 'Select supervisor',
  ENTER_LEAVE_REASON: 'Enter reason for leave...',
  SELECT_START_DATE: 'Select start date',
  SELECT_END_DATE: 'Select end date',
  SELECT_HOLIDAY_TYPE: 'Select holiday type',
  HOLIDAY_DESCRIPTION_EXAMPLE: 'e.g., Independence Day, Diwali, etc.',
  ENTER_EMPLOYEE_ID: 'Enter employee ID',
  ENTER_EMAIL: 'Enter email',
  ENTER_FIRST_NAME: 'Enter first name',
  ENTER_LAST_NAME: 'Enter last name',
  ENTER_PHONE_NUMBER: 'Enter phone number',
  ENTER_ROLL_NUMBER: 'Enter roll number',
  ENTER_ADMISSION_NUMBER: 'Enter admission number',
  ENTER_GUARDIAN_NAME: 'Enter guardian name',
  ENTER_GUARDIAN_PHONE: 'Enter guardian phone',
  ENTER_GUARDIAN_EMAIL: 'Enter guardian email',
  PROVIDE_CANCELLATION_REASON: 'Provide a reason for cancellation...',
  LEAVE_POLICY_NAME_EXAMPLE: 'e.g., Annual Leave 2025-26',
  LEAVE_POLICY_DETAILS: 'Add any additional details about this policy...',
  MAX_CARRY_FORWARD_DAYS: 'Max carry forward days',
  PICK_A_DATE: 'Pick a date',
  ENTER_ALLOCATED_DAYS: 'Enter number of days (e.g., 10 or 10.5)',
  ENTER_CARRY_FORWARD_DAYS: 'Enter carry forward days (e.g., 5)',
  ENTER_CONTACT_NAME: 'Enter contact name',
  ENTER_CONTACT_PHONE: 'Enter contact phone',
  ENTER_YEARS_OF_EXPERIENCE: 'Enter years of experience',
  ENTER_CLASS_CAPACITY: 'Enter class capacity',
  CLASS_SECTION_EXAMPLE: 'e.g., A, B, Section A',
  ENTER_ADDITIONAL_NOTES: 'Enter additional notes',
  ENTER_PREVIOUS_SCHOOL_NAME: 'Enter previous school name',
  ENTER_PREVIOUS_CLASS: 'Enter previous class',
  ENTER_PREVIOUS_SCHOOL_ADDRESS: 'Enter previous school address',
  DESIGNATION_EXAMPLE: 'e.g., Senior Teacher',
  QUALIFICATION_EXAMPLE: 'e.g., M.Ed, B.Sc',
  SPECIALIZATION_EXAMPLE: 'e.g., Mathematics, Science',
  SUBJECT_INFO: 'Enter any additional information about this subject',
  CLASS_INFO: 'Enter any additional information about this class section',
  MEDICAL_CONDITIONS: 'Enter any medical conditions or allergies',
  ENTER_USERNAME_OR_EMAIL: 'Enter your username or email',
  ENTER_PASSWORD: 'Enter your password',
  EMAIL_EXAMPLE: 'newemail@example.com',
  ADMIN_EMAIL_EXAMPLE: 'admin@example.com',
  SCHOOL_EMAIL_EXAMPLE: 'school@example.com',
  ORG_EMAIL_EXAMPLE: 'info@organization.com',
  PHONE_EXAMPLE: '+1234567890',
  ORG_NAME_EXAMPLE: 'Adharsha International High School',
  REGISTRATION_NUMBER_EXAMPLE: 'REG123456',
  CIN_EXAMPLE: 'U12345AB2020PTC123456',
  GSTIN_EXAMPLE: '22AAAAA0000A1Z5',
  WEBSITE_EXAMPLE: 'https://www.organization.com',
  WEBSITE_GENERIC_EXAMPLE: 'https://www.example.com',
  ENTER_SCHOOL_NAME: 'Enter school/institution name',
  OTP_MASK: '• • • • • •',
  CONFIRM_NEW_PASSWORD: 'Confirm new password',
  CREATE_STRONG_PASSWORD: 'Create a strong password (min 8 characters)',
  ENTER_OTP_6_DIGIT: 'Enter 6-digit OTP',
  ENTER_CURRENT_PASSWORD: 'Enter current password',
  ENTER_NEW_PASSWORD: 'Enter new password (min 8 characters)',
  REENTER_NEW_PASSWORD: 'Re-enter new password',
  FIRST_NAME_EXAMPLE: 'John',
  LAST_NAME_EXAMPLE: 'Doe',
} as const;

export const AttendanceUiText = {
  SELECT_CLASS: 'Please select a class',
  SELECT_CLASS_PLACEHOLDER: 'Select a class',
  SELECT_DATE: 'Please select a date',
  SELECT_DATE_PLACEHOLDER: 'Select date',
  NOT_WORKING_DAY: 'This is not a working day',
  LOADING_ATTENDANCE: 'Loading attendance data...',
  ALREADY_MARKED: 'Attendance has already been marked for this date.',
  EDIT_ATTENDANCE: 'Edit Attendance',
  MARK_ALL_PRESENT: 'Mark All Present',
  MARK_ALL_ABSENT: 'Mark All Absent',
  TOTAL_STUDENTS: 'Total Students',
  ON_LEAVE: 'On Leave',
  SUBMIT_ATTENDANCE: 'Submit Attendance',
  CLASS_LABEL: 'Class *',
  DATE_LABEL: 'Date *',
  PERIOD_LABEL: 'Period *',
  PERIOD_MORNING: 'Morning',
  PERIOD_AFTERNOON: 'Afternoon',
  PERIOD_FULL_DAY: 'Full Day',
  ROLL_NO: 'Roll No',
  STUDENT_NAME: 'Student Name',
  REMARKS: 'Remarks',
  NO_STUDENTS: 'No students found in this class',
  LEAVE_PENDING: 'Leave Pending',
  ADD_REMARKS: 'Add remarks...',
  MARK_PAGE_TITLE: 'Mark Attendance',
  MARK_PAGE_DESC: 'Mark daily attendance for students in your classes',
  SUMMARY_PAGE_TITLE: 'Attendance Summary',
  SUMMARY_PAGE_DESC: 'View attendance summary and statistics',
  MONTHLY_PAGE_TITLE: 'Monthly Attendance Report',
  MONTHLY_PAGE_DESC: 'View monthly attendance reports and analytics',
  COMING_SOON: 'Coming soon...',
  FEATURE_IN_PROGRESS: 'This feature is under development and will be available soon.',
} as const;

/**
 * Success messages for CRUD operations
 */
export const SuccessMessages = {
  // Generic success
  SUCCESS: 'Operation completed successfully.',

  // CRUD operation success
  CREATE_SUCCESS: 'Created successfully.',
  UPDATE_SUCCESS: 'Updated successfully.',
  DELETE_SUCCESS: 'Deleted successfully.',

  // Feature-specific success messages
  STUDENT: {
    CREATE_SUCCESS: 'Student created successfully.',
    UPDATE_SUCCESS: 'Student updated successfully.',
    DELETE_SUCCESS: 'Student deleted successfully.',
    BULK_UPLOAD_SUCCESS: 'Students uploaded successfully.',
    REACTIVATE_SUCCESS: 'Student reactivated successfully.',
  },

  TEACHER: {
    CREATE_SUCCESS: 'Teacher created successfully.',
    UPDATE_SUCCESS: 'Teacher updated successfully.',
    DELETE_SUCCESS: 'Teacher deleted successfully.',
    BULK_UPLOAD_SUCCESS: 'Teachers uploaded successfully.',
    REACTIVATE_SUCCESS: 'Teacher reactivated successfully.',
  },

  CLASS: {
    CREATE_SUCCESS: 'Class created successfully.',
    UPDATE_SUCCESS: 'Class updated successfully.',
    DELETE_SUCCESS: 'Class deleted successfully.',
    BULK_UPLOAD_SUCCESS: 'Classes uploaded successfully.',
    REACTIVATE_SUCCESS: 'Class reactivated successfully.',
  },

  SUBJECT: {
    CREATE_SUCCESS: 'Subject created successfully.',
    UPDATE_SUCCESS: 'Subject updated successfully.',
    DELETE_SUCCESS: 'Subject deleted successfully.',
    BULK_UPLOAD_SUCCESS: 'Subjects uploaded successfully.',
    REACTIVATE_SUCCESS: 'Subject reactivated successfully.',
  },

  ATTENDANCE: {
    MARK_SUCCESS: 'Attendance marked successfully.',
    BULK_MARK_SUCCESS: 'Attendance marked for all students successfully.',
    APPROVE_SUCCESS: 'Attendance approved successfully.',
    UPDATE_SUCCESS: 'Attendance updated successfully.',
    TIMESHEET_SUBMIT_SUCCESS: 'Timesheet submitted successfully.',
    TIMESHEET_APPROVE_SUCCESS: 'Timesheet approved successfully.',
    TIMESHEET_REJECT_SUCCESS: 'Timesheet rejected successfully.',
    TIMESHEET_REVIEW_SUCCESS: 'Timesheet reviewed successfully.',
  },

  HOLIDAY: {
    CREATE_SUCCESS: 'Holiday created successfully.',
    UPDATE_SUCCESS: 'Holiday updated successfully.',
    DELETE_SUCCESS: 'Holiday deleted successfully.',
    BULK_UPLOAD_SUCCESS: 'Holidays uploaded successfully.',
  },

  ORGANIZATION: {
    CREATE_SUCCESS: 'Organization created successfully.',
    UPDATE_SUCCESS: 'Organization updated successfully.',
    ADDRESS_UPDATE_SUCCESS: 'Organization address updated successfully.',
  },

  PREFERENCES: {
    UPDATED: 'Preferences updated successfully.',
    ACADEMIC_YEAR_UPDATED: 'Academic year settings have been updated successfully.',
    WORKING_DAY_POLICY_UPDATED: 'Working day policy has been updated successfully.',
  },

  EXCEPTIONAL_WORK: {
    CREATED: 'Calendar exception has been created successfully.',
    UPDATED: 'Calendar exception has been updated successfully.',
    DELETED: 'Calendar exception has been deleted successfully.',
  },

  DASHBOARD: {
    OPEN_ADD_TEACHER: 'Opening Add Teacher form...',
    OPEN_ADD_EVENT: 'Opening Add Event form...',
    OPEN_BULK_UPLOAD: 'Opening Bulk Upload...',
    LEAVE_APPROVED: 'Approved leave request for',
    LEAVE_REJECTED: 'Rejected leave request for',
  },

  FILES: {
    TEMPLATE_DOWNLOADED: 'Template downloaded successfully.',
  },

  LOCATION: {
    AUTO_FILLED: 'Location detected. Address fields filled automatically.',
  },

  LEAVE: {
    REQUEST_SUBMITTED: 'Leave request submitted successfully.',
    REQUEST_UPDATED: 'Leave request updated successfully.',
    REQUEST_CANCELLED: 'Leave request cancelled successfully.',
    REQUEST_APPROVED: 'Leave request approved successfully.',
    REQUEST_REJECTED: 'Leave request rejected successfully.',
    ALLOCATION_DELETED: 'Leave allocation deleted successfully.',
    BALANCE_ADDED: 'Leave balance added successfully.',
    BALANCE_UPDATED: 'Leave balance updated successfully.',
    BALANCE_DELETED: 'Leave balance deleted successfully.',
  },

  PROFILE: {
    UPDATED: 'Profile updated successfully.',
    PASSWORD_CHANGED: 'Password changed successfully. Logging out...',
    EMAIL_UPDATED: 'Email updated successfully.',
    PHONE_UPDATED: 'Phone updated successfully.',
    OTP_SENT: 'OTP sent successfully.',
    PHOTO_UPLOADED: 'Profile photo uploaded successfully.',
    PHOTO_DELETED: 'Profile photo removed successfully.',
  },

  AUTH: {
    OTP_SENT: 'OTP sent successfully.',
    PASSWORD_RESET_SUCCESS: 'Password reset successful.',
    ADMIN_EMAIL_VERIFIED: 'Administrator email verified successfully.',
    ORG_EMAIL_VERIFIED: 'Organization email verified successfully.',
    EMAIL_VERIFICATION_COMPLETE: 'Email verification complete!',
  },

  // Authentication success
  LOGIN_SUCCESS: 'Logged in successfully.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  PASSWORD_RESET_SUCCESS: 'Password reset email sent successfully.',
  PASSWORD_CHANGE_SUCCESS: 'Password changed successfully.',
} as const;

/**
 * Informational messages for user guidance
 */
export const InfoMessages = {
  CLASS_TEACHER: {
    BULK_UPLOAD_STUDENTS:
      'As a class teacher, you can bulk upload students only for classes where you are assigned as the class teacher. Please ensure the class information in your template matches your assigned class.',
    BULK_UPLOAD_SUBJECTS:
      'As a class teacher, you can bulk upload subjects only for classes where you are assigned as the class teacher. Please ensure the class information in your template matches your assigned class.',
  },
} as const;

/**
 * Confirmation messages for user actions
 */
export const ConfirmationMessages = {
  DELETE: 'Are you sure you want to delete this item?',
  DELETE_MULTIPLE: 'Are you sure you want to delete these items?',
  CANCEL: 'Are you sure you want to cancel? Any unsaved changes will be lost.',
  LOGOUT: 'Are you sure you want to logout?',

  STUDENT: {
    DELETE: 'Are you sure you want to delete this student?',
    REACTIVATE: 'Are you sure you want to reactivate this student?',
  },

  TEACHER: {
    DELETE: 'Are you sure you want to delete this teacher?',
    REACTIVATE: 'Are you sure you want to reactivate this teacher?',
  },

  CLASS: {
    DELETE: 'Are you sure you want to delete this class?',
    REACTIVATE: 'Are you sure you want to reactivate this class?',
  },

  SUBJECT: {
    DELETE: 'Are you sure you want to delete this subject?',
    REACTIVATE: 'Are you sure you want to reactivate this subject?',
  },

  HOLIDAY: {
    DELETE: 'Are you sure you want to delete this holiday?',
  },
} as const;
