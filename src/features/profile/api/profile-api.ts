/**
 * Profile API
 * API functions for profile management
 */

import api from '@/lib/api';
import type {
  ApiResponse,
  ChangePasswordPayload,
  SendOTPPayload,
  UpdateEmailPayload,
  UpdatePhonePayload,
  UpdateProfilePayload,
  UserProfile,
} from '../types/profile.types';

/**
 * Get current user profile
 */
export async function getUserProfile(): Promise<ApiResponse<UserProfile>> {
  const response = await api.get<ApiResponse<UserProfile>>('/users/profile/me/');
  return response.data;
}

/**
 * Update user profile information (including address)
 */
export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<ApiResponse<UserProfile>> {
  const response = await api.patch<ApiResponse<UserProfile>>('/users/profile/me/', payload);
  return response.data;
}

/**
 * Change password
 */
export async function changePassword(
  payload: ChangePasswordPayload
): Promise<ApiResponse<{ message: string }>> {
  const response = await api.post<ApiResponse<{ message: string }>>(
    '/auth/change-password/',
    payload
  );
  return response.data;
}

/**
 * Send OTP for email/phone verification
 */
export async function sendOTP(
  payload: SendOTPPayload
): Promise<ApiResponse<{ message: string; expires_in_minutes: number }>> {
  const response = await api.post<ApiResponse<{ message: string; expires_in_minutes: number }>>(
    '/users/send-otp/',
    payload
  );
  return response.data;
}

/**
 * Update email with OTP verification
 */
export async function updateEmail(payload: UpdateEmailPayload): Promise<ApiResponse<UserProfile>> {
  const response = await api.post<ApiResponse<UserProfile>>('/users/update-email/', payload);
  return response.data;
}

/**
 * Update phone with OTP verification
 */
export async function updatePhone(payload: UpdatePhonePayload): Promise<ApiResponse<UserProfile>> {
  const response = await api.post<ApiResponse<UserProfile>>('/users/update-phone/', payload);
  return response.data;
}
