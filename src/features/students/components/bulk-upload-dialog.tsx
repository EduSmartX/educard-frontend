/**
 * Bulk Upload Students Dialog
 * Uses the reusable BulkUploadDialog component
 */

import api from '@/lib/api';
import { BulkUploadDialog } from '@/components/common/bulk-upload-dialog';

const STUDENTS_API = '/students/bulk-operations';

// Download template function
async function downloadStudentsTemplate(): Promise<Blob> {
  const response = await api.get(`${STUDENTS_API}/download-template/`, {
    responseType: 'blob',
  });
  return response.data;
}

// Upload file function
async function uploadStudentsFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`${STUDENTS_API}/bulk-upload/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export function BulkUploadStudentsDialog() {
  return (
    <BulkUploadDialog
      title="Bulk Upload Students"
      description="Upload multiple students at once using an Excel template"
      triggerLabel="Bulk Upload"
      triggerVariant="outline"
      downloadTemplate={downloadStudentsTemplate}
      uploadFile={uploadStudentsFile}
      invalidateQueryKeys={['students']}
      templateFileName="students_template.xlsx"
      acceptedFileTypes=".xlsx,.xls"
    />
  );
}
