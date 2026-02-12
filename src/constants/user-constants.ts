/**
 * User-related constants
 * Constants for user data that match backend API values
 */

/**
 * Gender values as used by backend API
 */
export const GENDER = {
  MALE: 'M',
  FEMALE: 'F',
  OTHER: 'O',
} as const;

export type GenderValue = (typeof GENDER)[keyof typeof GENDER];

/**
 * Gender options for form dropdowns
 */
export const GENDER_OPTIONS = [
  { value: GENDER.MALE, label: 'Male' },
  { value: GENDER.FEMALE, label: 'Female' },
  { value: GENDER.OTHER, label: 'Other' },
];

/**
 * Helper function to get gender label from value
 */
export function getGenderLabel(value: string): string {
  const option = GENDER_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

/**
 * Blood group values as used by backend API
 */
export const BLOOD_GROUP = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-',
} as const;

export type BloodGroupValue = (typeof BLOOD_GROUP)[keyof typeof BLOOD_GROUP];

/**
 * Blood group options for form dropdowns
 */
export const BLOOD_GROUP_OPTIONS = [
  { value: BLOOD_GROUP.A_POSITIVE, label: 'A+' },
  { value: BLOOD_GROUP.A_NEGATIVE, label: 'A-' },
  { value: BLOOD_GROUP.B_POSITIVE, label: 'B+' },
  { value: BLOOD_GROUP.B_NEGATIVE, label: 'B-' },
  { value: BLOOD_GROUP.AB_POSITIVE, label: 'AB+' },
  { value: BLOOD_GROUP.AB_NEGATIVE, label: 'AB-' },
  { value: BLOOD_GROUP.O_POSITIVE, label: 'O+' },
  { value: BLOOD_GROUP.O_NEGATIVE, label: 'O-' },
];

/**
 * Helper function to get blood group label from value
 */
export function getBloodGroupLabel(value: string): string {
  const option = BLOOD_GROUP_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}
