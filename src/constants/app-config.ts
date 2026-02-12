// App Configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'EduCard';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Pagination
export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
export const MAX_PAGE_SIZE = 100;

// Date Formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATE_TIME_FORMAT = 'MMM dd, yyyy hh:mm a';
export const TIME_FORMAT = 'hh:mm a';
export const API_DATE_FORMAT = 'yyyy-MM-dd';

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Query Keys
export const QUERY_KEYS = {
  // Auth
  auth: {
    user: ['auth', 'user'],
    profile: ['auth', 'profile'],
  },
  // Students
  students: {
    all: ['students'],
    list: (filters?: unknown) => ['students', 'list', filters],
    detail: (id: string | number) => ['students', 'detail', id],
    deleted: (filters?: unknown) => ['students', 'deleted', filters],
  },
  // Teachers
  teachers: {
    all: ['teachers'],
    list: (filters?: unknown) => ['teachers', 'list', filters],
    detail: (id: string | number) => ['teachers', 'detail', id],
    deleted: (filters?: unknown) => ['teachers', 'deleted', filters],
  },
  // Classes
  classes: {
    all: ['classes'],
    list: (filters?: unknown) => ['classes', 'list', filters],
    detail: (id: string | number) => ['classes', 'detail', id],
    core: ['classes', 'core'],
  },
  // Subjects
  subjects: {
    all: ['subjects'],
    list: (filters?: unknown) => ['subjects', 'list', filters],
    detail: (id: string | number) => ['subjects', 'detail', id],
    core: ['subjects', 'core'],
  },
  // Attendance
  attendance: {
    student: (filters?: unknown) => ['attendance', 'student', filters],
    staff: (filters?: unknown) => ['attendance', 'staff', filters],
    my: (filters?: unknown) => ['attendance', 'my', filters],
    exceptions: (filters?: unknown) => ['attendance', 'exceptions', filters],
  },
  // Calendar Exceptions
  calendarExceptions: {
    list: (filters?: unknown) => ['calendar-exceptions', 'list', filters],
    detail: (id: string) => ['calendar-exception', id],
  },
  // Leave
  leave: {
    requests: (filters?: unknown) => ['leave', 'requests', filters],
    myRequests: (filters?: unknown) => ['leave', 'my-requests', filters],
    balance: (userId?: string | number) => ['leave', 'balance', userId],
    allocations: ['leave', 'allocations'],
  },
  // Organization
  organization: {
    profile: ['organization', 'profile'],
    preferences: ['organization', 'preferences'],
    holidays: (year?: number) => ['organization', 'holidays', year],
  },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  // Generic
  created: 'Created successfully',
  updated: 'Updated successfully',
  deleted: 'Deleted successfully',
  saved: 'Saved successfully',

  // Student
  studentCreated: 'Student created successfully',
  studentUpdated: 'Student updated successfully',
  studentDeleted: 'Student deleted successfully',
  studentReactivated: 'Student reactivated successfully',
  studentsBulkUploaded: 'Students uploaded successfully',

  // Teacher
  teacherCreated: 'Teacher created successfully',
  teacherUpdated: 'Teacher updated successfully',
  teacherDeleted: 'Teacher deleted successfully',
  teacherReactivated: 'Teacher reactivated successfully',
  teachersBulkUploaded: 'Teachers uploaded successfully',

  // Class
  classCreated: 'Class created successfully',
  classUpdated: 'Class updated successfully',
  classDeleted: 'Class deleted successfully',

  // Subject
  subjectCreated: 'Subject created successfully',
  subjectUpdated: 'Subject updated successfully',
  subjectDeleted: 'Subject deleted successfully',

  // Attendance
  attendanceMarked: 'Attendance marked successfully',
  attendanceUpdated: 'Attendance updated successfully',

  // Leave
  leaveRequested: 'Leave request submitted successfully',
  leaveApproved: 'Leave request approved',
  leaveRejected: 'Leave request rejected',
  leaveCancelled: 'Leave request cancelled',

  // Auth
  loginSuccess: 'Login successful',
  logoutSuccess: 'Logout successful',
  passwordChanged: 'Password changed successfully',

  // Profile
  profileUpdated: 'Profile updated successfully',
  emailUpdated: 'Email updated successfully',
  phoneUpdated: 'Phone number updated successfully',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Generic
  somethingWentWrong: 'Something went wrong. Please try again.',
  networkError: 'Network error. Please check your connection.',
  unauthorized: 'You are not authorized to perform this action.',
  notFound: 'Resource not found.',
  validationError: 'Please check your input and try again.',

  // Auth
  invalidCredentials: 'Invalid email or password',
  sessionExpired: 'Your session has expired. Please login again.',

  // File Upload
  fileTooLarge: 'File size is too large. Maximum size is 5MB.',
  invalidFileType: 'Invalid file type.',
  uploadFailed: 'File upload failed. Please try again.',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebar_state',
  TABLE_PREFERENCES: 'table_preferences',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    REGISTRATION_SUCCESS: '/auth/registration-success',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ORGANIZATION_NOT_APPROVED: '/auth/organization-not-approved',
  },
  DASHBOARD: '/dashboard',
  // Common routes (role-agnostic)
  ORGANIZATION: '/organization',
  STUDENTS: '/students',
  STUDENTS_NEW: '/students/new',
  STUDENTS_EDIT: '/students/:id/edit',
  TEACHERS: '/teachers',
  TEACHERS_NEW: '/teachers/new',
  TEACHERS_VIEW: '/teachers/:id',
  TEACHERS_EDIT: '/teachers/:id/edit',
  CLASSES: '/classes',
  CLASSES_NEW: '/classes/new',
  CLASSES_EDIT: '/classes/:id/edit',
  SUBJECTS: '/subjects',
  SUBJECTS_NEW: '/subjects/new',
  SUBJECTS_EDIT: '/subjects/:id/edit',
  ALLOCATIONS: '/allocations',
  CALENDAR: '/calendar',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  ATTENDANCE: {
    STUDENTS: '/attendance/students',
    STAFF: '/attendance/staff',
  },
  LEAVE: {
    REQUESTS: '/leave/requests',
    REVIEWS: '/leave/reviews',
    BALANCES: '/leave/balances',
    ALLOCATIONS: '/leave/allocations',
  },
  HOLIDAYS: '/holidays',
  PREFERENCES: '/preferences',
  EXCEPTIONAL_WORK: '/exceptional-work',
  // Role-specific routes (legacy - kept for backward compatibility)
  ADMIN: {
    ORGANIZATION: '/admin/organization',
    STUDENTS: '/admin/students',
    TEACHERS: '/admin/teachers',
    CLASSES: '/admin/classes',
    SUBJECTS: '/admin/subjects',
    ALLOCATIONS: '/admin/allocations',
    CALENDAR: '/admin/calendar',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
    ATTENDANCE: {
      STUDENTS: '/admin/attendance/students',
      STAFF: '/admin/attendance/staff',
    },
    LEAVE: {
      REQUESTS: '/admin/leave/requests',
      REVIEWS: '/admin/leave/reviews',
      BALANCES: '/admin/leave/balances',
      ALLOCATIONS: '/admin/leave/allocations',
    },
    PREFERENCES: '/admin/preferences',
  },
  TEACHER: {
    MY_CLASSES: '/teacher/classes',
    ATTENDANCE: '/teacher/attendance',
    LEAVE: '/teacher/leave',
  },
  PARENT: {
    MY_CHILDREN: '/parent/children',
    ATTENDANCE: '/parent/attendance',
  },
  PROFILE: '/profile',
} as const;
