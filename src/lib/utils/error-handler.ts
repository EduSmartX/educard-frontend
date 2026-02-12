/**
 * Error Handling Utilities
 * Single-pass parsing with normalized error model
 * Handles Django REST Framework error responses with nested structures
 */

import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';

// ============================================================================
// Types
// ============================================================================

/**
 * Backend error response structure (what Django sends in response.data)
 * This is the actual backend format
 */
interface BackendErrorResponse {
  success?: boolean;
  status?: string;
  message?: string;
  data?: unknown;
  errors?: Record<string, ErrorValue>;
  code?: number;
  detail?: string;
}

/**
 * Axios error wrapper (what we receive in catch block)
 */
interface AxiosErrorWrapper {
  response?: {
    data?: BackendErrorResponse;
    status?: number;
  };
  message?: string;
}

/**
 * Error values in the errors object can be:
 * - string[] (field error array)
 * - string (single error)
 * - nested object (for nested structures like student_data.email)
 */
type ErrorValue = string | string[] | Record<string, string | string[]>;

/**
 * Normalized error model - single source of truth
 */
export interface NormalizedError {
  message: string;
  fieldErrors: Record<string, string>;
  nonFieldErrors: string[];
  statusCode?: number;
  isValidation: boolean;
}

// ============================================================================
// Core Parser - Parse Once, Use Everywhere
// ============================================================================

/**
 * Recursively flatten nested error objects
 * Handles cases like: { student_data: { email: ["error"] } }
 * Returns: { "student_data.email": "error" }
 */
function flattenErrors(
  errors: Record<string, ErrorValue>,
  prefix = ''
): { fieldErrors: Record<string, string>; nonFieldErrors: string[] } {
  const result = {
    fieldErrors: {} as Record<string, string>,
    nonFieldErrors: [] as string[],
  };

  Object.entries(errors).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    // Check if this is a non-field error key
    if (key === 'non_field_errors' || key === 'non_field_error') {
      // Add to non-field errors
      if (Array.isArray(value)) {
        result.nonFieldErrors.push(...(value as string[]));
      } else if (typeof value === 'string') {
        result.nonFieldErrors.push(value);
      }
      return;
    }

    // Handle array of strings (simple field error)
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'string') {
        result.fieldErrors[fullKey] = value[0];
      }
      return;
    }

    // Handle single string
    if (typeof value === 'string') {
      result.fieldErrors[fullKey] = value;
      return;
    }

    // Handle nested object (recurse)
    if (typeof value === 'object' && value !== null) {
      const nested = flattenErrors(value as Record<string, ErrorValue>, fullKey);
      Object.assign(result.fieldErrors, nested.fieldErrors);
      result.nonFieldErrors.push(...nested.nonFieldErrors);
    }
  });

  return result;
}

/**
 * Parse any error into normalized structure
 * This is the ONLY function that touches raw errors
 * All other functions consume NormalizedError
 */
export function parseError(error: unknown): NormalizedError {
  const result: NormalizedError = {
    message: 'An unexpected error occurred',
    fieldErrors: {},
    nonFieldErrors: [],
    isValidation: false,
  };

  // Handle null/undefined
  if (!error) return result;

  // Handle string errors
  if (typeof error === 'string') {
    result.message = error;
    return result;
  }

  // Handle Error instances
  if (error instanceof Error) {
    // Check if it's an axios error with response data
    if ('response' in error && typeof error === 'object') {
      const axiosError = error as AxiosErrorWrapper;
      if (axiosError.response?.data) {
        // Recursively parse the response data
        return parseError(axiosError.response.data);
      }
    }
    result.message = error.message;
    return result;
  }

  // Handle object errors (axios response or backend error)
  if (typeof error === 'object') {
    // Try to extract as axios wrapper first
    const possibleAxiosError = error as AxiosErrorWrapper;
    const possibleBackendError = error as BackendErrorResponse;

    // If it has response.data, it's an axios wrapper
    const errorData = possibleAxiosError.response?.data || possibleBackendError;

    // Debug logging (remove in production)
    if (import.meta.env.DEV) {
      console.info('[Error Handler] Parsing error:', {
        hasResponse: !!possibleAxiosError.response,
        errorData,
        errors: errorData.errors,
      });
    }

    // Get status code
    if (possibleAxiosError.response?.status) {
      result.statusCode = possibleAxiosError.response.status;
    } else if (errorData.code) {
      result.statusCode = errorData.code;
    }

    // Extract main message
    result.message = errorData.message || errorData.detail || result.message;

    // Check for simple detail-only errors (like auth errors or 404s)
    if (errorData.detail && !errorData.errors) {
      result.message = errorData.detail;
      return result;
    }

    // Check if errors object contains a detail field (e.g., {"errors": {"detail": "..."}})
    if (errorData.errors && typeof errorData.errors === 'object') {
      const errorsObj = errorData.errors as Record<string, ErrorValue>;
      if ('detail' in errorsObj && typeof errorsObj.detail === 'string') {
        result.message = errorsObj.detail;
        // If detail is the only error, return early
        if (Object.keys(errorsObj).length === 1) {
          return result;
        }
      }
    }

    // Parse errors object (supports nested structures)
    if (errorData.errors && typeof errorData.errors === 'object') {
      result.isValidation = true;

      const flattened = flattenErrors(errorData.errors);
      result.fieldErrors = flattened.fieldErrors;
      result.nonFieldErrors = flattened.nonFieldErrors;

      // Debug logging
      if (import.meta.env.DEV) {
        console.info('[Error Handler] Flattened errors:', {
          fieldErrors: result.fieldErrors,
          nonFieldErrors: result.nonFieldErrors,
        });
      }
    }

    // If we have validation errors but no message, set a better default
    if (result.isValidation && result.message === 'An unexpected error occurred') {
      result.message = 'Validation error occurred';
    }

    // Special case: If success=false but no other message, use that
    if (errorData.success === false && result.message === 'An unexpected error occurred') {
      result.message = 'Request failed';
    }
  }

  return result;
}

// ============================================================================
// Public API - All functions consume NormalizedError
// ============================================================================

/**
 * Get user-friendly error message for display
 * Use this for toast messages
 */
export function getErrorMessage(error: unknown, fallback?: string): string {
  const normalized = parseError(error);

  // Priority: non-field errors > field errors > message > fallback
  if (normalized.nonFieldErrors.length > 0) {
    return normalized.nonFieldErrors[0];
  }

  const fieldErrorKeys = Object.keys(normalized.fieldErrors);
  if (fieldErrorKeys.length > 0 && Object.keys(normalized.fieldErrors).length === 1) {
    // Single field error - show it
    return normalized.fieldErrors[fieldErrorKeys[0]];
  }

  return normalized.message || fallback || 'An unexpected error occurred';
}

/**
 * Apply field errors to react-hook-form
 * Sets errors on form fields and returns summary for toast
 */
export function applyFieldErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  fieldMap?: Record<string, string>
): {
  /** Whether any field errors were set */
  hasFieldErrors: boolean;
  /** Number of fields with errors */
  fieldErrorCount: number;
  /** Message to show in toast (non-field errors or summary) */
  toastMessage: string;
  /** All field error messages */
  fieldErrorMessages: string[];
} {
  const normalized = parseError(error);

  const result = {
    hasFieldErrors: false,
    fieldErrorCount: 0,
    toastMessage: '',
    fieldErrorMessages: [] as string[],
  };

  // Apply field errors to form
  Object.entries(normalized.fieldErrors).forEach(([field, message]) => {
    try {
      const formField = (fieldMap?.[field] || field) as Path<TFieldValues>;
      setError(formField, {
        type: 'manual',
        message: message,
      });
      result.hasFieldErrors = true;
      result.fieldErrorCount++;
      result.fieldErrorMessages.push(message);
    } catch (err) {
      // If field doesn't exist in form, treat as non-field error
      console.warn(`Failed to set error on field "${field}":`, err);
      normalized.nonFieldErrors.push(`${field}: ${message}`);
    }
  });

  // Determine toast message
  if (normalized.nonFieldErrors.length > 0) {
    // Show non-field errors in toast
    result.toastMessage = normalized.nonFieldErrors[0];
  } else if (result.hasFieldErrors) {
    // Show validation summary if only field errors
    result.toastMessage = normalized.message || 'Please check the form fields for errors';
  } else {
    // Show generic message
    result.toastMessage = normalized.message;
  }

  return result;
}

/**
 * Get field errors without react-hook-form
 * Use for vanilla state management
 */
export function getFieldErrors(error: unknown): Record<string, string> {
  const normalized = parseError(error);
  return normalized.fieldErrors;
}

/**
 * Get non-field errors
 * Use when you need just the general validation errors
 */
export function getNonFieldErrors(error: unknown): string[] {
  const normalized = parseError(error);
  return normalized.nonFieldErrors;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  const normalized = parseError(error);
  return normalized.isValidation;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes('network') || msg.includes('fetch') || msg.includes('connection');
  }
  return false;
}

/**
 * Get error title based on status code
 */
export function getErrorTitle(error: unknown): string {
  const normalized = parseError(error);
  const code = normalized.statusCode;

  if (!code) return 'Error';
  if (code >= 500) return 'Server Error';
  if (code === 404) return 'Not Found';
  if (code === 403) return 'Access Denied';
  if (code === 401) return 'Authentication Required';
  if (code === 400 && normalized.isValidation) return 'Validation Error';
  if (code >= 400) return 'Request Error';

  return 'Error';
}

// ============================================================================
// Backward Compatibility (deprecated, use new API above)
// ============================================================================

/**
 * @deprecated Use getErrorMessage() instead
 */
export function parseApiError(error: unknown, defaultMessage?: string): string {
  return getErrorMessage(error, defaultMessage);
}

/**
 * @deprecated Use applyFieldErrors() instead
 */
export function setFormFieldErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  fieldMap?: Record<string, Path<TFieldValues>>
): {
  hasFieldError: boolean;
  fieldErrors: string[];
  nonFieldErrors: string[];
  allErrors: string[];
  shouldShowToast: boolean;
} {
  const result = applyFieldErrors(error, setError, fieldMap);
  const normalized = parseError(error);

  return {
    hasFieldError: result.hasFieldErrors,
    fieldErrors: result.fieldErrorMessages,
    nonFieldErrors: normalized.nonFieldErrors,
    allErrors: [...result.fieldErrorMessages, ...normalized.nonFieldErrors],
    shouldShowToast: result.hasFieldErrors || normalized.nonFieldErrors.length > 0,
  };
}

/**
 * @deprecated Use getFieldErrors() instead
 */
export function extractFieldErrors(error: unknown): Record<string, string> {
  return getFieldErrors(error);
}

/**
 * @deprecated Use parseError() instead
 */
export function extractValidationErrors(error: unknown): {
  fieldErrors: Record<string, string>;
  nonFieldErrors: string[];
  message: string;
} {
  const normalized = parseError(error);
  return {
    fieldErrors: normalized.fieldErrors,
    nonFieldErrors: normalized.nonFieldErrors,
    message: normalized.message,
  };
}

// ============================================================================
// Deleted Duplicate Error Helpers
// ============================================================================

/**
 * Check if error indicates a deleted duplicate record exists
 */
export function isDeletedDuplicateError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const axiosError = error as AxiosErrorWrapper;
  const data = axiosError.response?.data;

  if (!data || !data.errors) {
    return false;
  }

  const errors = data.errors;

  // Check for has_deleted_duplicate flag
  const hasDuplicate = errors.has_deleted_duplicate;
  if (
    hasDuplicate === 'true' ||
    hasDuplicate === 'True' ||
    (Array.isArray(hasDuplicate) &&
      hasDuplicate.length > 0 &&
      (hasDuplicate[0] === 'True' || hasDuplicate[0] === 'true'))
  ) {
    return true;
  }

  return false;
}

/**
 * Extract user-friendly message from deleted duplicate error
 */
export function getDeletedDuplicateMessage(error: unknown): string {
  const axiosError = error as AxiosErrorWrapper;
  const data = axiosError.response?.data;

  if (!data || !data.errors) {
    return 'A deleted record with the same details already exists.';
  }

  const errors = data.errors;

  // Check non_field_errors for the message
  if (Array.isArray(errors.non_field_errors) && errors.non_field_errors.length > 0) {
    return errors.non_field_errors[0];
  }

  if (typeof errors.non_field_errors === 'string') {
    return errors.non_field_errors;
  }

  // Check detail field
  if (typeof errors.detail === 'string') {
    return errors.detail;
  }

  if (Array.isArray(errors.detail) && errors.detail.length > 0) {
    return errors.detail[0] as string;
  }

  return 'A deleted record with the same details already exists.';
}

/**
 * Extract deleted record ID from deleted duplicate error
 */
export function getDeletedRecordId(error: unknown): string | null {
  const axiosError = error as AxiosErrorWrapper;
  const data = axiosError.response?.data;

  if (!data || !data.errors) {
    return null;
  }

  const errors = data.errors;

  // Check for deleted_record_id field
  if (typeof errors.deleted_record_id === 'string') {
    return errors.deleted_record_id;
  }

  if (Array.isArray(errors.deleted_record_id) && errors.deleted_record_id.length > 0) {
    return errors.deleted_record_id[0] as string;
  }

  return null;
}
