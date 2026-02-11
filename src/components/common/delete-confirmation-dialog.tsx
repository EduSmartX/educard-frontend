/**
 * Reusable Delete Confirmation Dialog
 * Modern styled confirmation dialog for delete operations throughout the application
 */

import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  description?: string;
  isDeleting?: boolean;
  deleteButtonText?: string;
  cancelButtonText?: string;
  isSoftDelete?: boolean; // New prop for soft delete
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Delete Item',
  itemName,
  description,
  isDeleting = false,
  deleteButtonText = 'Delete',
  cancelButtonText = 'Cancel',
  isSoftDelete = false, // Default to hard delete
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="overflow-hidden border-0 p-0 bg-gradient-to-br from-orange-50/50 via-white to-amber-50/50">
        {/* Header with gradient background */}
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-6 py-6">
          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5 blur-2xl"></div>
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/5 blur-2xl"></div>

          <AlertDialogHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-bold text-white">
                  {title}
                </AlertDialogTitle>
              </div>
            </div>
          </AlertDialogHeader>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <AlertDialogDescription className="text-base text-gray-700">
            {description || (
              <>
                Are you sure you want to delete{' '}
                {itemName && <strong className="text-gray-900 font-semibold">{itemName}</strong>}?
                <span className="block mt-2 text-orange-600 font-medium">
                  {isSoftDelete
                    ? 'This item will be archived and can be restored later.'
                    : 'This action cannot be undone.'}
                </span>
              </>
            )}
          </AlertDialogDescription>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-orange-50/30 to-amber-50/30 px-6 py-4 border-t border-orange-100">
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-orange-200 hover:bg-orange-50"
            >
              {cancelButtonText}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirm}
              disabled={isDeleting}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isDeleting ? (
                <>
                  <span className="mr-2">Deleting...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleteButtonText}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
