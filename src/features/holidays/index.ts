/**
 * Holidays Feature - Main Export
 * Organization Holiday Calendar feature
 */

// Main component
export { HolidayCalendar } from './components/holiday-calendar';

// Sub-components
export {
  CalendarView,
  TableView,
  AddHolidayDialog,
  EditHolidayDialog,
  BulkUploadDialog,
  DateActionDialog,
} from './components';

// API functions
export * from './api/holidays-api';

// Types
export type * from './types';

// Hooks
export {
  useCreateHoliday,
  useCreateHolidaysBulk,
  useUpdateHoliday,
  useDeleteHoliday,
  useBulkUploadHolidays,
} from './hooks/use-holiday-mutations';

// Utilities
export * from './utils/holiday-utils';
