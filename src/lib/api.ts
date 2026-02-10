import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

// API Base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Define proper types for API error responses
interface ApiErrorResponse {
  detail?: string;
  non_field_errors?: string[];
  errors?: Array<{ email: string; error: string }> | Record<string, string | string[]>;
  [key: string]: unknown;
}

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    handleApiError(error);
    return Promise.reject(error);
  }
);

/**
 * Handle API errors and show toast notifications
 */
function handleApiError(error: AxiosError): void {
  if (error.response) {
    // Server responded with error
    const status = error.response.status;
    const data = error.response.data as ApiErrorResponse;

    // Skip toast for OTP validation errors (will be handled by form)
    const isOtpError =
      error.config?.url?.includes('/otp/') &&
      status === 400 &&
      data.detail &&
      data.errors &&
      Array.isArray(data.errors);

    if (isOtpError) {
      // Don't show toast for OTP errors - they'll be displayed on the form
      return;
    }

    const hasFieldErrors = status === 400 && data.errors && typeof data.errors === 'object';
    if (hasFieldErrors) {
      return;
    }

    switch (status) {
      case 400:
        // Bad Request - Show validation errors
        if (data.detail) {
          toast.error(data.detail);
        } else if (data.non_field_errors) {
          toast.error(data.non_field_errors[0]);
        } else {
          toast.error('Invalid request. Please check your input.');
        }
        break;

      case 401:
        toast.error('Authentication required. Please login again.');
        break;

      case 403:
        toast.error('You do not have permission to perform this action.');
        break;

      case 404:
        toast.error('The requested resource was not found.');
        break;

      case 409:
        toast.error(data.detail || 'A conflict occurred.');
        break;

      case 422:
        toast.error('Validation error. Please check your input.');
        break;

      case 429:
        toast.error('Too many requests. Please try again later.');
        break;

      case 500:
        toast.error('Server error. Please try again later.');
        break;

      case 503:
        toast.error('Service unavailable. Please try again later.');
        break;

      default:
        toast.error(data.detail || 'An error occurred. Please try again.');
    }
  } else if (error.request) {
    // Request made but no response
    toast.error('No response from server. Please check your internet connection.');
  } else {
    // Error in request setup
    toast.error('An error occurred. Please try again.');
  }
}

/**
 * Parse error response to get field-specific errors
 */
export function parseApiErrors(error: AxiosError): Record<string, string> {
  const errors: Record<string, string> = {};

  if (error.response?.data) {
    const data = error.response.data as ApiErrorResponse;

    // Django REST Framework error format
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (Array.isArray(value)) {
        errors[key] = value[0];
      } else if (typeof value === 'string') {
        errors[key] = value;
      }
    });
  }

  return errors;
}

/**
 * Parse OTP validation errors from backend
 * Handles the specific format: { detail: string, errors: Array<{ email: string, error: string }> }
 */
export interface OtpValidationError {
  email: string;
  error: string;
}

export function parseOtpErrors(error: AxiosError): {
  detail: string | null;
  errors: OtpValidationError[];
} {
  if (error.response?.data) {
    const data = error.response.data as ApiErrorResponse;

    // Check if it's the OTP validation error format
    if (data.detail && data.errors && Array.isArray(data.errors)) {
      return {
        detail: data.detail,
        errors: data.errors as OtpValidationError[],
      };
    }
  }

  return {
    detail: null,
    errors: [],
  };
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: AxiosError): boolean {
  return !error.response && Boolean(error.request);
}

/**
 * Check if error is a server error (5xx)
 */
export function isServerError(error: AxiosError): boolean {
  return Boolean(error.response && error.response.status >= 500);
}

/**
 * Check if error is a client error (4xx)
 */
export function isClientError(error: AxiosError): boolean {
  return Boolean(error.response && error.response.status >= 400 && error.response.status < 500);
}

export default apiClient;
