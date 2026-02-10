/**
 * Reusable hook for handling form errors consistently across the application
 * Automatically handles both field-level and non-field errors from backend
 */

import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { type UseFormSetError, type FieldValues } from 'react-hook-form';
import { setFormFieldErrors, parseApiError } from '@/lib/utils/error-handler';

interface UseFormErrorHandlerOptions {
  /**
   * Default error message when no specific error is found
   */
  defaultErrorMessage?: string;

  /**
   * Custom field name mapping (backend field name -> form field name)
   */
  fieldMap?: Record<string, string>;

  /**
   * Whether to show toast notifications for errors
   * @default true
   */
  showToast?: boolean;

  /**
   * Toast duration in milliseconds
   * @default 5000
   */
  toastDuration?: number;

  /**
   * Custom toast title for validation errors
   * @default "Validation Error"
   */
  validationErrorTitle?: string;

  /**
   * Custom toast title for general errors
   * @default "Error"
   */
  generalErrorTitle?: string;
}

/**
 * Hook to handle form errors consistently
 *
 * @example
 * ```tsx
 * const handleError = useFormErrorHandler(form.setError, {
 *   defaultErrorMessage: 'Failed to create leave allocation',
 *   fieldMap: { backend_field: 'frontendField' },
 * });
 *
 * // In mutation onError:
 * onError: (error) => {
 *   handleError(error);
 * }
 * ```
 */
export function useFormErrorHandler<TFieldValues extends FieldValues>(
  setError: UseFormSetError<TFieldValues>,
  options: UseFormErrorHandlerOptions = {}
) {
  const {
    defaultErrorMessage = 'An error occurred',
    fieldMap,
    showToast = true,
    toastDuration = 5000,
    validationErrorTitle = 'Validation Error',
    generalErrorTitle = 'Error',
  } = options;

  return (error: unknown) => {
    // Try to parse and set field-level errors
    const errorResult = setFormFieldErrors(error, setError, fieldMap);

    if (!showToast) {
      return errorResult;
    }

    // Determine what to show in toast
    if (errorResult.shouldShowToast) {
      if (errorResult.allErrors.length > 0) {
        // Show the first error message (usually the most relevant)
        const primaryError = errorResult.allErrors[0];

        // If there are multiple errors, indicate that in the description
        const description =
          errorResult.allErrors.length > 1
            ? `${primaryError} (${errorResult.allErrors.length - 1} more error${errorResult.allErrors.length > 2 ? 's' : ''})`
            : primaryError;

        toast.error(validationErrorTitle, {
          description,
          icon: <AlertCircle className="h-4 w-4" />,
          duration: toastDuration,
        });
      } else {
        // No specific errors found, show generic message
        const errorMessage = parseApiError(error, defaultErrorMessage);
        toast.error(generalErrorTitle, {
          description: errorMessage,
          icon: <AlertCircle className="h-4 w-4" />,
          duration: toastDuration,
        });
      }
    }

    return errorResult;
  };
}

/**
 * Simplified version that just handles errors without requiring form setup
 * Useful for non-form API calls
 */
export function useApiErrorHandler(options: Omit<UseFormErrorHandlerOptions, 'fieldMap'> = {}) {
  const {
    defaultErrorMessage = 'An error occurred',
    showToast = true,
    toastDuration = 5000,
    generalErrorTitle = 'Error',
  } = options;

  return (error: unknown) => {
    if (!showToast) {
      return;
    }

    const errorMessage = parseApiError(error, defaultErrorMessage);
    toast.error(generalErrorTitle, {
      description: errorMessage,
      icon: <AlertCircle className="h-4 w-4" />,
      duration: toastDuration,
    });
  };
}
