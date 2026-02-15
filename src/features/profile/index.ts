/**
 * Profile Feature Exports
 * Central export point for profile feature
 */

// Pages
export { default as ProfilePage } from './pages/profile-page';

// Components
export { ProfileInformationForm } from './components/profile-information-form';
export { PasswordChangeForm } from './components/password-change-form';
export { EmailUpdateForm } from './components/email-update-form';
export { PhoneUpdateForm } from './components/phone-update-form';
export { AddressUpdateForm } from './components/address-update-form';

// Hooks
export { useUserProfile } from './hooks/queries';
export { useUpdateProfile, useUpdateAddress, useChangePassword } from './hooks/mutations';

// Types
export type {
  UserProfile,
  UpdateProfilePayload,
  ChangePasswordPayload,
  UpdateAddressPayload,
} from './types/profile.types';

// Schemas
export {
  profileInformationSchema,
  passwordChangeSchema,
  addressUpdateSchema,
  type ProfileInformationFormData,
  type PasswordChangeFormData,
  type AddressUpdateFormData,
} from './schemas/profile-schemas';
