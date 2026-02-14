// Address type constants synced with backend (edusphere/users/constants.py)
// Backend: USER_CURRENT = "user_current", USER_PERMANENT = "user_permanent", ORGANIZATION = "organization"

export const ADDRESS_TYPE = {
  USER_CURRENT: 'user_current',
  USER_PERMANENT: 'user_permanent',
  ORGANIZATION: 'organization',
} as const;

export type AddressTypeValue = (typeof ADDRESS_TYPE)[keyof typeof ADDRESS_TYPE];

export const ADDRESS_TYPE_OPTIONS = [
  { value: ADDRESS_TYPE.USER_CURRENT, label: 'Current Address' },
  { value: ADDRESS_TYPE.USER_PERMANENT, label: 'Permanent Address' },
  { value: ADDRESS_TYPE.ORGANIZATION, label: 'Organization Address' },
];

export function getAddressTypeLabel(value: string): string {
  const option = ADDRESS_TYPE_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}
