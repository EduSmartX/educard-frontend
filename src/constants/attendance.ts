/**
 * Attendance Module Constants
 */

export const SaturdayOffPattern = {
  ALL: 'ALL',
  SECOND_ONLY: 'SECOND_ONLY',
  SECOND_AND_FOURTH: 'SECOND_AND_FOURTH',
  NONE: 'NONE',
} as const;

export type SaturdayOffPatternType = (typeof SaturdayOffPattern)[keyof typeof SaturdayOffPattern];

export const SaturdayOffPatternLabels: Record<SaturdayOffPatternType, string> = {
  [SaturdayOffPattern.ALL]: 'All Saturdays Off',
  [SaturdayOffPattern.SECOND_ONLY]: 'Second Saturday Only',
  [SaturdayOffPattern.SECOND_AND_FOURTH]: 'Second and Fourth Saturday',
  [SaturdayOffPattern.NONE]: 'No Saturday Off',
};

export const HolidayType = {
  SUNDAY: 'SUNDAY',
  SATURDAY: 'SATURDAY',
  SECOND_SATURDAY: 'SECOND_SATURDAY',
  NATIONAL_HOLIDAY: 'NATIONAL_HOLIDAY',
  FESTIVAL: 'FESTIVAL',
  ORGANIZATION_HOLIDAY: 'ORGANIZATION_HOLIDAY',
  OTHER: 'OTHER',
} as const;

export type HolidayTypeValue = (typeof HolidayType)[keyof typeof HolidayType];

export const HolidayTypeLabels: Record<HolidayTypeValue, string> = {
  [HolidayType.SUNDAY]: 'Sunday',
  [HolidayType.SATURDAY]: 'Saturday',
  [HolidayType.SECOND_SATURDAY]: 'Second Saturday',
  [HolidayType.NATIONAL_HOLIDAY]: 'National Holiday',
  [HolidayType.FESTIVAL]: 'Festival',
  [HolidayType.ORGANIZATION_HOLIDAY]: 'Organization Holiday',
  [HolidayType.OTHER]: 'Other',
};
