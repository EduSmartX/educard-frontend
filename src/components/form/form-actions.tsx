/**
 * Form Actions Component
 * Reusable form action buttons (Cancel, Delete, Save/Create/Update)
 * Provides consistent styling and behavior across all forms
 */

import { ArrowRight, Loader2, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface FormActionsProps {
  mode: 'create' | 'edit' | 'view';
  isSubmitting?: boolean;
  onCancel?: () => void;
  onDelete?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  deleteLabel?: string;
  showDelete?: boolean;
  className?: string;
}

export function FormActions({
  mode,
  isSubmitting = false,
  onCancel,
  onDelete,
  submitLabel,
  cancelLabel = 'Cancel',
  deleteLabel = 'Delete',
  showDelete = false,
  className,
}: FormActionsProps) {
  // Don't show anything in view mode
  if (mode === 'view') {
    return null;
  }

  const getDefaultSubmitLabel = () => {
    if (isSubmitting) {
      return mode === 'create' ? 'Creating...' : 'Updating...';
    }
    return mode === 'create' ? 'Create' : 'Update';
  };

  const finalSubmitLabel = submitLabel || getDefaultSubmitLabel();

  return (
    <Card
      className={cn(
        'border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50',
        className
      )}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-3">
          {/* Delete button on the left (if enabled) */}
          {showDelete && onDelete && mode === 'edit' && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isSubmitting}
              className="shadow-md hover:shadow-lg transition-all"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteLabel}
            </Button>
          )}

          {/* Spacer to push right buttons to the right */}
          <div className="flex-1" />

          {/* Cancel and Submit buttons on the right */}
          <div className="flex gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="shadow-sm hover:shadow-md transition-all"
              >
                {cancelLabel}
              </Button>
            )}

            <Button
              type="submit"
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg transition-all font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {finalSubmitLabel}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  {finalSubmitLabel}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
