/**
 * Leave Allocation Delete Dialog Component
 * Confirmation dialog for deleting leave allocation policies
 */

import { Loader2 } from 'lucide-react';
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
import type { LeaveAllocation } from '@/lib/api/leave-api';

interface LeaveAllocationDeleteDialogProps {
  open: boolean;
  allocation: LeaveAllocation | null;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function LeaveAllocationDeleteDialog({
  open,
  allocation,
  isPending,
  onOpenChange,
  onConfirm,
}: LeaveAllocationDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-white">
            Delete Leave Allocation Policy?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-gray-100 space-y-3 pt-2">
            <p>
              Are you sure you want to delete the{' '}
              <span className="font-bold text-red-400 text-lg">
                {allocation?.display_name || allocation?.leave_type_name}
              </span>{' '}
              policy?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel
            disabled={isPending}
            className="border-2 border-gray-500 bg-transparent hover:bg-gray-700 font-semibold text-white"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-gradient-to-r from-red-400 to-rose-400 hover:from-red-500 hover:to-rose-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
