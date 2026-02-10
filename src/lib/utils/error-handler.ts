/**
 * Error Handling Utilities
 * Provides comprehensive error parsing and user-friendly messaging
 */

import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';

/**
 * Backend validation error structure
 */
interface BackendError {
  status?: string;
  message?: string;
  data?: unknown;
  errors?: Record<string, string[] | string>;
  code?: number;
  detail?: string;
  non_field_errors?: string[];
}

/**
 * Parse backend error and extract meaningful message
 * Handles multiple error response formats from Django REST Framework
 */
export function parseApiError(
  error: unknown,
  defaultMessage = 'An unexpected error occurred'
): string {
  if (!error) return defaultMessage;

  // Handle string errors
  if (typeof error === 'string') {
    try {
      const parsed = JSON.parse(error);
      return extractErrorMessage(parsed, defaultMessage);
    } catch {
      return error || defaultMessage;
    }
  }

  // Handle Error instances
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  // Handle object errors
  if (typeof error === 'object') {
    return extractErrorMessage(error, defaultMessage);
  }

  return defaultMessage;
}

/**
 * Extract error message from error object
 */
function extractErrorMessage(errorObj: unknown, defaultMessage: string): string {
  const err = errorObj as BackendError;

  // Check for direct detail field
  if (err.detail && typeof err.detail === 'string') {
    return err.detail;
  }

  // Check for message field
  if (err.message) {
    return err.message;
  }

  // Check for non_field_errors
  if (err.non_field_errors && Array.isArray(err.non_field_errors)) {
    return err.non_field_errors[0] || defaultMessage;
  }

  // Check for errors object
  if (err.errors) {
    if (typeof err.errors === 'string') {
      return err.errors;
    }

    if (typeof err.errors === 'object') {
      const errorKeys = Object.keys(err.errors);
      if (errorKeys.length > 0) {
        const firstError = err.errors[errorKeys[0]];
        if (Array.isArray(firstError) && firstError.length > 0) {
          return `${formatFieldName(errorKeys[0])}: ${firstError[0]}`;
        }
        if (typeof firstError === 'string') {
          return firstError;
        }
      }
    }
  }

  return defaultMessage;
}

/**
 * Format field name from snake_case to Title Case
 */
function formatFieldName(field: string): string {
  return field.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Parse backend validation errors and set them on form fields
 * Returns comprehensive error information including field errors and non-field errors
 *
 * @returns Object containing:
 *  - hasFieldError: Whether any field-specific errors were found
 *  - fieldErrors: Array of field-specific error messages
 *  - nonFieldErrors: Array of non-field error messages (applies_to_all_roles, etc.)
 *  - allErrors: Combined array of all error messages
 *  - shouldShowToast: Whether to show a toast notification
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
  const errorData = parseBackendValidationError(error);

  if (!errorData || !errorData.errors) {
    return {
      hasFieldError: false,
      fieldErrors: [],
      nonFieldErrors: [],
      allErrors: [],
      shouldShowToast: true,
    };
  }

  let hasFieldError = false;
  const fieldErrors: string[] = [];
  const nonFieldErrors: string[] = [];

  Object.entries(errorData.errors).forEach(([field, messages]) => {
    const messageArray = Array.isArray(messages) ? messages : [messages];

    if (messageArray.length > 0) {
      const errorMessage = messageArray[0];

      // Try to set the error on the form field
      try {
        const formField = fieldMap?.[field] || (field as Path<TFieldValues>);

        setError(formField, {
          type: 'manual',
          message: errorMessage,
        });

        hasFieldError = true;
        fieldErrors.push(errorMessage);
      } catch {
        // If setting on field fails, treat as non-field error
        nonFieldErrors.push(errorMessage);
      }
    }
  });

  // Also check for non_field_errors from backend
  if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
    nonFieldErrors.push(...errorData.non_field_errors);
  }

  const allErrors = [...fieldErrors, ...nonFieldErrors];
  const shouldShowToast = nonFieldErrors.length > 0 || fieldErrors.length > 0;

  return {
    hasFieldError,
    fieldErrors,
    nonFieldErrors,
    allErrors,
    shouldShowToast,
  };
}

/**
 * Parse backend validation error response
 */
function parseBackendValidationError(error: unknown): BackendError | null {
  try {
    // Check if error has response.data structure (from axios)
    if (error && typeof error === 'object' && 'response' in error) {
      const responseError = error as { response?: { data?: BackendError } };
      if (responseError.response?.data?.errors) {
        return responseError.response.data;
      }
    }

    // Check if error directly has errors property
    if (error && typeof error === 'object' && 'errors' in error) {
      const errorObj = error as BackendError;
      if (errorObj.errors && typeof errorObj.errors === 'object') {
        return errorObj;
      }
    }

    // Try to parse from error message
    const errorText = (error as { message?: string })?.message || '';
    const jsonMatch = errorText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const errorData = JSON.parse(jsonMatch[0]) as BackendError;
      if (errorData.errors && typeof errorData.errors === 'object') {
        return errorData;
      }
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Get user-friendly error title based on HTTP status code
 */
export function getErrorTitle(code?: number): string {
  if (!code) return 'Error';

  if (code >= 500) return 'Server Error';
  if (code === 404) return 'Not Found';
  if (code === 403) return 'Access Denied';
  if (code === 401) return 'Authentication Required';
  if (code >= 400) return 'Request Error';

  return 'Error';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('fetch') ||
      error.message.toLowerCase().includes('connection')
    );
  }
  return false;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  const parsed = parseBackendValidationError(error);
  return parsed !== null && !!parsed.errors;
}
