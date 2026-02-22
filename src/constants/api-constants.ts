/**
 * API Query Keys
 * Centralized query keys for React Query
 */

export const QueryKeys = {
  // Authentication
  AUTH: {
    USER: ['auth', 'user'],
    SESSION: ['auth', 'session'],
  },

  // Students
  STUDENTS: {
    ALL: ['students'],
    LIST: (params?: Record<string, unknown>) => ['students', 'list', params],
    DETAIL: (id: string) => ['students', 'detail', id],
    ACTIVE: ['students', 'active'],
    DELETED: ['students', 'deleted'],
  },

  // Teachers
  TEACHERS: {
    ALL: ['teachers'],
    LIST: (params?: Record<string, unknown>) => ['teachers', 'list', params],
    DETAIL: (id: string) => ['teachers', 'detail', id],
    ACTIVE: ['teachers', 'active'],
    DELETED: ['teachers', 'deleted'],
  },

  // Classes
  CLASSES: {
    ALL: ['classes'],
    LIST: (params?: Record<string, unknown>) => ['classes', 'list', params],
    DETAIL: (id: string) => ['classes', 'detail', id],
    ACTIVE: ['classes', 'active'],
    DELETED: ['classes', 'deleted'],
    ELIGIBLE: (purpose?: string) => ['classes', 'eligible', purpose],
  },

  // Subjects
  SUBJECTS: {
    ALL: ['subjects'],
    LIST: (params?: Record<string, unknown>) => ['subjects', 'list', params],
    DETAIL: (id: string) => ['subjects', 'detail', id],
    ACTIVE: ['subjects', 'active'],
    DELETED: ['subjects', 'deleted'],
    CORE: ['subjects', 'core'],
  },

  // Attendance
  ATTENDANCE: {
    ALL: ['attendance'],
    LIST: (params?: Record<string, unknown>) => ['attendance', 'list', params],
    BY_DATE: (date: string, classId?: string) => ['attendance', 'date', date, classId],
    BY_STUDENT: (studentId: string, params?: Record<string, unknown>) => [
      'attendance',
      'student',
      studentId,
      params,
    ],
    VALIDATE_DATE: (date: string) => ['attendance', 'validate', date],
  },

  // Holidays
  HOLIDAYS: {
    ALL: ['holidays'],
    LIST: (params?: Record<string, unknown>) => ['holidays', 'list', params],
    DETAIL: (id: string) => ['holidays', 'detail', id],
    CALENDAR: (year?: number, month?: number) => ['holidays', 'calendar', year, month],
  },

  // Organization
  ORGANIZATION: {
    DETAILS: ['organization', 'details'],
    PREFERENCES: ['organization', 'preferences'],
    STATS: ['organization', 'stats'],
  },

  // Core/Master data
  CORE: {
    SUBJECTS: ['core', 'subjects'],
    CLASSES: ['core', 'classes'],
    DESIGNATIONS: ['core', 'designations'],
  },
} as const;

/**
 * API Status codes
 */
export const StatusCodes = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * HTTP Methods
 */
export const HttpMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

/**
 * Pagination defaults
 */
export const PaginationDefaults = {
  PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  INITIAL_PAGE: 1,
} as const;
