/**
 * Teachers Module Exports
 */

// Components
export { TeachersManagement } from './components/teachers-management';
export { TeacherFormDialog } from './components/teacher-form-dialog';
export { BulkUploadTeachersDialog } from './components/bulk-upload-dialog';

// Hooks
export { useTeachers, useTeacher } from './hooks/use-teachers';
export {
  useCreateTeacher,
  useUpdateTeacher,
  useDeleteTeacher,
  useBulkUploadTeachers,
} from './hooks/mutations';

// Types
export type {
  Teacher,
  TeacherUser,
  Subject,
  CreateTeacherPayload,
  UpdateTeacherPayload,
  FetchTeachersParams,
} from './types';
