/**
 * Generic Bulk Upload Component
 * Reusable component for downloading templates and uploading bulk data
 * Can be used for Students, Teachers, Holidays, and other modules
 */

import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Download, Loader2, Upload, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Generic error type for bulk uploads
export interface BulkUploadError {
  row: number;
  error: string;
  data?: Record<string, unknown> | null;
}

// Generic result type for bulk uploads
export interface BulkUploadResult {
  success?: boolean;
  created_count?: number;
  successful_count?: number; // Some APIs use this instead of created_count
  failed_count: number;
  total_rows?: number;
  errors: BulkUploadError[];
}

// Generic API response wrapper
export interface BulkUploadResponse {
  success: boolean;
  message: string;
  data: BulkUploadResult;
  code: number;
}

interface BulkUploadDialogProps {
  // Display configuration
  title: string;
  description: string;
  triggerLabel?: string;
  triggerVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  triggerClassName?: string;

  // API functions
  downloadTemplate: () => Promise<Blob>;
  uploadFile: (file: File) => Promise<BulkUploadResponse>;

  // Cache configuration
  invalidateQueryKeys: string[];

  // Optional customization
  templateFileName?: string;
  acceptedFileTypes?: string;

  // Optional minimal fields functionality
  showMinimalFieldsCheckbox?: boolean;
  isMinimalFields?: boolean;
  onMinimalFieldsChange?: (checked: boolean) => void;
  minimalFieldsLabel?: string;

  // Optional callback after successful upload
  onUploadSuccess?: (result: BulkUploadResult) => void;
}

export function BulkUploadDialog({
  title,
  description,
  triggerLabel = 'Bulk Upload',
  triggerVariant = 'outline',
  triggerClassName = '',
  downloadTemplate,
  uploadFile,
  invalidateQueryKeys,
  templateFileName = 'bulk_upload_template.xlsx',
  acceptedFileTypes = '.xlsx,.xls',
  showMinimalFieldsCheckbox = false,
  isMinimalFields = false,
  onMinimalFieldsChange,
  minimalFieldsLabel = 'Minimal Fields Only',
  onUploadSuccess,
}: BulkUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Reset file selection
  const resetFileInput = useCallback(() => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Download template handler
  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const blob = await downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = templateFileName;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success('Template downloaded successfully');
    } catch (error) {
      const err = error as Error;
      toast.error(err?.message || 'Failed to download template');
    } finally {
      setIsDownloading(false);
    }
  };

  // File change handler
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  // Allow re-selecting the same file
  const handleFileInputClick = (event: React.MouseEvent<HTMLInputElement>) => {
    event.currentTarget.value = '';
  };

  const transformErrors = (errors: unknown): BulkUploadError[] => {
    if (!errors) {
      return [];
    }

    if (typeof errors === 'object' && !Array.isArray(errors)) {
      return Object.entries(errors).map(([rowKey, errorData]: [string, unknown]) => {
        const rowMatch = rowKey.match(/Row (\d+)/i);
        const rowNumber = rowMatch ? parseInt(rowMatch[1], 10) : 0;

        let errorMessage = 'Validation error';
        let data: Record<string, unknown> | null = null;
        if (typeof errorData === 'object' && errorData !== null) {
          data = errorData as Record<string, unknown>;
          const firstKey = Object.keys(data)[0];
          errorMessage =
            typeof data[firstKey] === 'string' ? (data[firstKey] as string) : errorMessage;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }

        return {
          row: rowNumber,
          error: errorMessage,
          data,
        };
      });
    }

    // Handle array format
    if (Array.isArray(errors)) {
      if (errors.length === 0) {
        return [];
      }

      return errors.map((error) => {
        // Handle new backend format: { row_number, errors: {...} } or { row, errors: {...} }
        const rowNum = error.row_number ?? error.row;
        if (rowNum !== undefined && error.errors && typeof error.errors === 'object') {
          // For file-level errors (row: 0), extract the file error message
          if (rowNum === 0 && error.errors.file) {
            return {
              row: 0,
              error: error.errors.file,
              data: {},
            };
          }
          // Extract first error message from errors object
          const errorKeys = Object.keys(error.errors);
          const firstErrorKey = errorKeys[0];
          const errorMessage =
            errorKeys.length > 1
              ? `${errorKeys.length} validation errors`
              : error.errors[firstErrorKey] || 'Validation error';

          return {
            row: rowNum,
            error: errorMessage,
            data: error.errors,
          };
        }
        // Handle old format: { row, error, data }
        return {
          row: error.row || 0,
          error: error.error || 'Unknown error',
          data: error.data || {},
        };
      });
    }

    return [];
  };

  // Upload handler
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploadResult(null);
    setIsUploading(true);
    try {
      const response = await uploadFile(selectedFile);
      const result = response.data;

      // Normalize the result format
      if (result.successful_count !== undefined && result.created_count === undefined) {
        result.created_count = result.successful_count;
      }

      if (result.total_rows === undefined) {
        result.total_rows = (result.created_count || 0) + (result.failed_count || 0);
      }

      if (result.errors) {
        result.errors = transformErrors(result.errors);
      } else if (result.errors === null) {
        result.errors = [];
      }

      setUploadResult(result);

      // Invalidate cache
      invalidateQueryKeys.forEach((key) => {
        queryClient.invalidateQueries({
          queryKey: [key],
        });
      });

      // Show success/partial success toast
      const createdCount = result.created_count ?? 0;
      const failedCount = result.failed_count ?? 0;
      const message =
        failedCount === 0
          ? `${createdCount} record${createdCount > 1 ? 's' : ''} uploaded successfully`
          : `Created: ${createdCount}, Failed: ${failedCount}`;

      if (failedCount === 0) {
        toast.success(message);
      } else {
        toast.error(message);
      }

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (error) {
      const err = error as {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data?: any;
        response?: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data?: any;
        };
      };

      // Try to get result from different response structures
      let rawResult = err?.data || err?.response?.data;

      // Handle BulkUploadResponse wrapper (with nested data)
      if (rawResult && 'data' in rawResult && typeof rawResult.data === 'object') {
        rawResult = rawResult.data;
      }

      if (rawResult) {
        // Check for top-level error message (like "Excel file is empty")
        const topLevelError = rawResult.error;

        const result: BulkUploadResult = {
          failed_count: 0,
          errors: [],
        };

        if (topLevelError) {
          // Create a file-level error (row 0) for top-level errors
          result.errors = [
            {
              row: 0,
              error: topLevelError,
              data: null,
            },
          ];
          result.failed_count = 1;
          result.created_count = 0;
          result.total_rows = 0;
          toast.error(topLevelError);
        } else {
          // Normalize the result format
          result.created_count = rawResult.created_count ?? rawResult.successful_count ?? 0;
          result.failed_count = rawResult.failed_count ?? 0;
          result.total_rows =
            rawResult.total_rows ?? (result.created_count ?? 0) + result.failed_count;

          if (rawResult.errors) {
            result.errors = transformErrors(rawResult.errors);
          } else {
            result.errors = [];
          }

          const failedCount = result.failed_count;
          const message = failedCount > 0 ? 'Upload failed with errors' : 'Upload failed';
          toast.error(message);
        }

        setUploadResult(result);
      } else {
        const errorMessage = (error as Error)?.message || 'Failed to upload file';
        toast.error(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    resetFileInput();
  };

  const hasErrors = uploadResult && uploadResult.failed_count > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          className={`gap-2 shadow-md hover:shadow-lg transition-all duration-200 ${triggerClassName}`}
        >
          <Upload className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden border-0 p-0 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        {/* Header with gradient background */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-6 py-8">
          {/* Decorative circles */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>

          <DialogHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">{title}</DialogTitle>
                <DialogDescription className="text-purple-50 mt-1">{description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content area */}
        <div className="overflow-y-auto max-h-[calc(90vh-280px)] px-6 py-6">
          <div className="space-y-4">
            {/* Minimal Fields Checkbox */}
            {showMinimalFieldsCheckbox && (
              <div className="flex items-center space-x-2 rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4 shadow-sm">
                <Checkbox
                  id="minimal-fields-checkbox"
                  checked={isMinimalFields}
                  onCheckedChange={(checked) => onMinimalFieldsChange?.(checked as boolean)}
                  className="border-purple-400"
                />
                <Label
                  htmlFor="minimal-fields-checkbox"
                  className="cursor-pointer text-sm font-medium leading-none text-purple-900"
                >
                  {minimalFieldsLabel}
                </Label>
              </div>
            )}

            {/* Download Template */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <h3 className="text-base font-bold text-purple-900">Download Template</h3>
                </div>
                <p className="mt-1 text-sm text-purple-700 ml-10">
                  Get the Excel template with the correct format
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                disabled={isDownloading}
                className="w-full sm:w-auto gap-2 border-purple-300 bg-white hover:bg-purple-50 hover:border-purple-400 transition-all flex-shrink-0"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                ) : (
                  <Download className="h-4 w-4 text-purple-600" />
                )}
                <span className="text-purple-900">Download Template</span>
              </Button>
            </div>

            {/* Upload File */}
            <div className="space-y-3 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-pink-50 to-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-600 text-white font-bold text-sm">
                  2
                </div>
                <h3 className="text-base font-bold text-purple-900">Upload Filled Template</h3>
              </div>
              <p className="text-sm text-purple-700 ml-10 mb-3">Select the Excel file with data</p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 ml-10">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedFileTypes}
                  onChange={handleFileChange}
                  onClick={handleFileInputClick}
                  className="w-full sm:flex-1 cursor-pointer rounded-lg border-2 border-dashed border-purple-300 bg-white p-3 text-sm transition-all hover:border-purple-400 hover:bg-purple-50 file:mr-2 sm:file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-purple-600 file:to-pink-600 file:px-3 sm:file:px-4 file:py-2 file:text-xs sm:file:text-sm file:font-semibold file:text-white file:transition-all hover:file:from-purple-700 hover:file:to-pink-700 break-all"
                />
                {selectedFile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetFileInput}
                    className="hover:bg-red-100 hover:text-red-600 self-center sm:self-auto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {selectedFile && (
                <div className="ml-10 mt-2 rounded-lg bg-purple-100 px-3 py-2 text-sm text-purple-900">
                  <span className="font-semibold">Selected:</span> {selectedFile.name}
                </div>
              )}
            </div>

            {/* Upload Result Summary */}
            {uploadResult && (
              <Alert
                variant={hasErrors ? 'destructive' : 'default'}
                className={
                  hasErrors
                    ? 'border-2 border-red-300 bg-gradient-to-br from-red-50 to-white shadow-md'
                    : 'border-2 border-green-300 bg-gradient-to-br from-green-50 to-white shadow-md'
                }
              >
                {hasErrors ? (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                <AlertTitle className={hasErrors ? 'text-red-900' : 'text-green-900'}>
                  Upload Result
                </AlertTitle>
                <AlertDescription>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-gray-900 border border-gray-300"
                    >
                      Total: {uploadResult.total_rows}
                    </Badge>
                    <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">
                      Created: {uploadResult.created_count}
                    </Badge>
                    {hasErrors && (
                      <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">
                        Failed: {uploadResult.failed_count}
                      </Badge>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Error Details */}
            {uploadResult?.errors && uploadResult.errors.length > 0 && (
              <div className="space-y-3 rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-white p-5 shadow-sm">
                <h3 className="text-base font-bold text-red-900 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Errors ({uploadResult.errors.length})
                </h3>
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {uploadResult.errors.map((error, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-red-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start gap-2">
                        {error.row !== 0 && (
                          <Badge variant="destructive" className="mt-0.5 bg-red-500">
                            Row {error.row}
                          </Badge>
                        )}
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-red-900">{error.error}</p>
                          {error.data &&
                            typeof error.data === 'object' &&
                            Object.keys(error.data).length > 0 && (
                              <div className="space-y-0.5 text-xs text-red-700 bg-red-50 rounded p-2 mt-2">
                                {Object.entries(error.data).map(([key, value]) => (
                                  <div key={key}>
                                    <span className="font-semibold capitalize">
                                      {key.replace(/_/g, ' ')}:
                                    </span>{' '}
                                    {String(value)}
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with gradient */}
        <DialogFooter className="border-t bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-gray-300 hover:bg-white"
          >
            Close
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200 min-w-[120px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
