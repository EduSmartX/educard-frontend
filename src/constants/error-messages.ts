/**
 * Centralized error messages for the application
 * Use these constants instead of hardcoding error messages
 */

export const ErrorMessages = {
  // Generic errors
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access forbidden.',
  NOT_FOUND: 'The requested resource was not found.',

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
    FETCH_FAILED: 'Failed to load students. Please try again.',
    BULK_UPLOAD_FAILED: 'Failed to upload students. Please try again.',
    DOWNLOAD_TEMPLATE_FAILED: 'Failed to download student template.',
    NOT_FOUND: 'Student not found.',
  },

  TEACHER: {
    CREATE_FAILED: 'Failed to create teacher. Please try again.',
    UPDATE_FAILED: 'Failed to update teacher. Please try again.',
    DELETE_FAILED: 'Failed to delete teacher. Please try again.',
    FETCH_FAILED: 'Failed to load teachers. Please try again.',
    BULK_UPLOAD_FAILED: 'Failed to upload teachers. Please try again.',
    DOWNLOAD_TEMPLATE_FAILED: 'Failed to download teacher template.',
    NOT_FOUND: 'Teacher not found.',
  },

  CLASS: {
    CREATE_FAILED: 'Failed to create class. Please try again.',
    UPDATE_FAILED: 'Failed to update class. Please try again.',
    DELETE_FAILED: 'Failed to delete class. Please try again.',
    FETCH_FAILED: 'Failed to load classes. Please try again.',
    NOT_FOUND: 'Class not found.',
  },

  SUBJECT: {
    CREATE_FAILED: 'Failed to create subject. Please try again.',
    UPDATE_FAILED: 'Failed to update subject. Please try again.',
    DELETE_FAILED: 'Failed to delete subject. Please try again.',
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
  },

  // Authentication success
  LOGIN_SUCCESS: 'Logged in successfully.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  PASSWORD_RESET_SUCCESS: 'Password reset email sent successfully.',
  PASSWORD_CHANGE_SUCCESS: 'Password changed successfully.',
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
