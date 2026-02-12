/**
 * Form Enum Constants
 * Centralized enum values for form fields
 */

/**
 * Gender enum values
 */
export const GENDER_VALUES = {
  MALE: 'M',
  FEMALE: 'F',
  OTHER: 'O',
} as const;

export type GenderValue = (typeof GENDER_VALUES)[keyof typeof GENDER_VALUES];

/**
 * Blood group enum values
 */
export const BLOOD_GROUP_VALUES = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-',
} as const;

export type BloodGroupValue = (typeof BLOOD_GROUP_VALUES)[keyof typeof BLOOD_GROUP_VALUES];

/**
 * Array of all gender values for validation/dropdown
 */
export const GENDER_ENUM = [GENDER_VALUES.MALE, GENDER_VALUES.FEMALE, GENDER_VALUES.OTHER] as const;

/**
 * Array of all blood group values for validation/dropdown
 */
export const BLOOD_GROUP_ENUM = [
  BLOOD_GROUP_VALUES.A_POSITIVE,
  BLOOD_GROUP_VALUES.A_NEGATIVE,
  BLOOD_GROUP_VALUES.B_POSITIVE,
  BLOOD_GROUP_VALUES.B_NEGATIVE,
  BLOOD_GROUP_VALUES.AB_POSITIVE,
  BLOOD_GROUP_VALUES.AB_NEGATIVE,
  BLOOD_GROUP_VALUES.O_POSITIVE,
  BLOOD_GROUP_VALUES.O_NEGATIVE,
] as const;
