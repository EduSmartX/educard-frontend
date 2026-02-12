/**
 * Bulk Upload Subjects Dialog
 * Uses the reusable BulkUploadDialog component
 */

import api from '@/lib/api';
import { BulkUploadDialog } from '@/components/common/bulk-upload-dialog';

const SUBJECTS_API = '/subjects';

// Download template function
async function downloadSubjectsTemplate(): Promise<Blob> {
  const response = await api.get(`${SUBJECTS_API}/download-template/`, {
    responseType: 'blob',
  });
  return response.data;
}

// Upload file function
async function uploadSubjectsFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(`${SUBJECTS_API}/bulk-upload/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export function BulkUploadSubjectsDialog() {
  return (
    <BulkUploadDialog
      title="Bulk Upload Subjects"
      description="Upload multiple subjects at once using an Excel template"
      triggerLabel="Bulk Upload"
      triggerVariant="outline"
      downloadTemplate={downloadSubjectsTemplate}
      uploadFile={uploadSubjectsFile}
      invalidateQueryKeys={['subjects']}
      templateFileName="subjects_template.xlsx"
      acceptedFileTypes=".xlsx,.xls"
    />
  );
}
