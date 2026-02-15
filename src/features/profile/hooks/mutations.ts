/**
 * Profile Mutations
 * React Query mutation hooks for profile updates
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  changePassword,
  sendOTP,
  updateEmail,
  updatePhone,
  updateProfile,
} from '../api/profile-api';
import { authApi } from '@/lib/api/auth-api';
import { ROUTES } from '@/constants/app-config';
import type {
  ChangePasswordPayload,
  SendOTPPayload,
  UpdateEmailPayload,
  UpdatePhonePayload,
  UpdateProfilePayload,
} from '../types/profile.types';

/**
 * Hook to update profile information (including address)
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', 'me'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}

/**
 * Hook to change password with cross-tab logout
 */
export function useChangePassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
    onSuccess: async () => {
      toast.success('Password changed successfully. Logging out...');

      // Wait a moment for user to see the message
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Logout (clears localStorage)
      await authApi.logout();

      // Trigger storage event for cross-tab logout
      window.localStorage.setItem('logout-event', Date.now().toString());
      window.localStorage.removeItem('logout-event');

      // Navigate to login
      navigate(ROUTES.AUTH.LOGIN, { replace: true });

      // Force reload to clear any cached state
      window.location.reload();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change password');
    },
  });
}

/**
 * Hook to send OTP
 */
export function useSendOTP() {
  return useMutation({
    mutationFn: (payload: SendOTPPayload) => sendOTP(payload),
    onSuccess: (data) => {
      toast.success(data.data?.message || 'OTP sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send OTP');
    },
  });
}

/**
 * Hook to update email with OTP
 */
export function useUpdateEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEmailPayload) => updateEmail(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', 'me'] });
      toast.success('Email updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update email');
    },
  });
}

/**
 * Hook to update phone with OTP
 */
export function useUpdatePhone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePhonePayload) => updatePhone(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', 'me'] });
      toast.success('Phone updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update phone');
    },
  });
}

// Deprecated - kept for backwards compatibility
export const useUpdateAddress = useUpdateProfile;
