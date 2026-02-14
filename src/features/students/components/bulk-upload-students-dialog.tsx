/**
 * Bulk Upload Teachers Dialog
 * Uses the reusable BulkUploadDialog component
 */

import { useState } from 'react';
import api from '@/lib/api';
import { BulkUploadDialog } from '@/components/common/bulk-upload-dialog';

const STUDENTS_API = '/students/';

// Download template function with minimal fields option
async function downloadStudentsTemplate(minimalFields: boolean = false): Promise<Blob> {
  const params = minimalFields ? { minimal_fields: 'true' } : {};
  const response = await api.get(`${STUDENTS_API}bulk-operations/download_template/`, {
    params,
    responseType: 'blob',
  });
  return response.data;
}

// Upload file function with minimal fields option
async function uploadStudentsFile(file: File, minimalFields: boolean = false) {
  const formData = new FormData();
  formData.append('file', file);

  const params = minimalFields ? { minimal_fields: 'true' } : {};
  const response = await api.post(`${STUDENTS_API}bulk-operations/bulk_upload/`, formData, {
    params,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export function BulkUploadStudentsDialog() {
  const [isMinimalFields, setIsMinimalFields] = useState(false);

  return (
    <BulkUploadDialog
      title="Bulk Upload Students"
      description="Upload multiple students at once using an Excel template"
      triggerLabel="Bulk Upload"
      triggerVariant="outline"
      triggerClassName="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
      downloadTemplate={() => downloadStudentsTemplate(isMinimalFields)}
      uploadFile={(file) => uploadStudentsFile(file, isMinimalFields)}
      invalidateQueryKeys={['students']}
      templateFileName={
        isMinimalFields ? 'students_template_minimal.xlsx' : 'students_template_full.xlsx'
      }
      acceptedFileTypes=".xlsx,.xls"
      showMinimalFieldsCheckbox={true}
      isMinimalFields={isMinimalFields}
      onMinimalFieldsChange={setIsMinimalFields}
      minimalFieldsLabel="Only Required Fields (Student ID, Name, Gender, Class)"
    />
  );
}
