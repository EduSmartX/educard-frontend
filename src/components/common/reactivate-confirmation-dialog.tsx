/**
 * Reactivate Confirmation Dialog Component
 * Reusable dialog for confirming reactivation of soft-deleted records
 */

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
import { RotateCcw } from 'lucide-react';

interface ReactivateConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  isReactivating?: boolean;
}

export function ReactivateConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Reactivate Record',
  description,
  itemName,
  isReactivating = false,
}: ReactivateConfirmationDialogProps) {
  const defaultDescription = itemName
    ? `Are you sure you want to reactivate "${itemName}"? This will restore the record and make it active again.`
    : 'Are you sure you want to reactivate this record? This will restore the record and make it active again.';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <RotateCcw className="h-5 w-5 text-green-600" />
            </div>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-white">
            {description || defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isReactivating}
            className="text-red-600 hover:text-red-700 border-red-600 hover:border-red-700"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isReactivating}
            className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
          >
            {isReactivating ? (
              <>
                <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                Reactivating...
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reactivate
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
