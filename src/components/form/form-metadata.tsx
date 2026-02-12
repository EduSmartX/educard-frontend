/**
 * Form Metadata Component
 * Displays created by/at and updated by/at information
 * Reusable across all forms that have audit trail data
 */

import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export interface FormMetadataProps {
  createdBy?: string | null;
  createdAt?: string;
  updatedBy?: string | null;
  updatedAt?: string;
  className?: string;
}

export function FormMetadata({
  createdBy,
  createdAt,
  updatedBy,
  updatedAt,
  className,
}: FormMetadataProps) {
  // Don't show if no data is available
  if (!createdBy && !createdAt && !updatedBy && !updatedAt) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  return (
    <Card className={cn('bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200', className)}>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Created Information */}
          {(createdBy || createdAt) && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Created
              </h4>
              <div className="space-y-1 pl-6">
                {createdBy && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    <span className="font-medium">{createdBy}</span>
                  </div>
                )}
                {createdAt && <div className="text-sm text-gray-500">{formatDate(createdAt)}</div>}
              </div>
            </div>
          )}

          {/* Updated Information */}
          {(updatedBy || updatedAt) && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                Last Updated
              </h4>
              <div className="space-y-1 pl-6">
                {updatedBy && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    <span className="font-medium">{updatedBy}</span>
                  </div>
                )}
                {updatedAt && <div className="text-sm text-gray-500">{formatDate(updatedAt)}</div>}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
