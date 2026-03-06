/**
 * Leave Request Dialog Component
 * Allows employees to submit leave requests from the timesheet page
 */

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarDays, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { calculateWorkingDays } from '@/features/leave/api/leave-api';
import { createLeaveRequest } from '@/features/leave/api/leave-api';
import { fetchMyLeaveBalances } from '@/features/leave/api/leave-api';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date | null;
  onSuccess?: () => void;
}

export function LeaveRequestDialog({
  open,
  onOpenChange,
  selectedDate,
  onSuccess,
}: LeaveRequestDialogProps) {
  const queryClient = useQueryClient();
  const [leaveBalanceId, setLeaveBalanceId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(selectedDate || null);
  const [endDate, setEndDate] = useState<Date | null>(selectedDate || null);
  const [reason, setReason] = useState('');
  const [workingDays, setWorkingDays] = useState<number | null>(null);
  const [calculatingDays, setCalculatingDays] = useState(false);

  // Fetch leave balances
  const { data: leaveBalancesData, isLoading: loadingBalances } = useQuery({
    queryKey: ['leave-balances', 'my'],
    queryFn: () => fetchMyLeaveBalances({ page_size: 100 }),
    enabled: open,
  });

  const leaveBalances = useMemo(
    () => leaveBalancesData?.data || [],
    [leaveBalancesData]
  );

  // Calculate working days when dates change
  useEffect(() => {
    if (startDate && endDate && startDate <= endDate) {
      setCalculatingDays(true);
      calculateWorkingDays({
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      })
        .then((response) => {
          setWorkingDays(response.data?.working_days || 0);
        })
        .catch(() => {
          setWorkingDays(null);
          toast.error('Failed to calculate working days');
        })
        .finally(() => {
          setCalculatingDays(false);
        });
    } else {
      setWorkingDays(null);
    }
  }, [startDate, endDate]);

  // Reset form when dialog opens with selected date
  useEffect(() => {
    if (open && selectedDate) {
      setStartDate(selectedDate);
      setEndDate(selectedDate);
    }
  }, [open, selectedDate]);

  // Create leave request mutation
  const createMutation = useMutation({
    mutationFn: createLeaveRequest,
    onSuccess: () => {
      toast.success('Leave application submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['timesheet'] });
      handleClose();
      onSuccess?.();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.join(', ') ||
        'Failed to submit leave application';
      toast.error(message);
    },
  });

  const handleSubmit = () => {
    if (!leaveBalanceId) {
      toast.error('Please select a leave type');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }
    if (startDate > endDate) {
      toast.error('End date must be after start date');
      return;
    }
    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    if (workingDays === null || workingDays <= 0) {
      toast.error('Invalid number of working days');
      return;
    }

    createMutation.mutate({
      leave_balance: leaveBalanceId,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      number_of_days: workingDays,
      reason: reason.trim(),
    });
  };

  const handleClose = () => {
    setLeaveBalanceId('');
    setStartDate(null);
    setEndDate(null);
    setReason('');
    setWorkingDays(null);
    onOpenChange(false);
  };

  const selectedBalance = leaveBalances.find((lb) => lb.public_id === leaveBalanceId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[95vh] overflow-y-auto bg-white shadow-2xl border-2 border-gray-300">
        <DialogHeader className="space-y-3 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-gray-900">Apply for Leave</DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Submit a leave application for your timesheet. Approved leaves will be automatically marked
            in your attendance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-6">
          {/* Leave Type Selection */}
          <div className="space-y-3">
            <Label htmlFor="leave-type" className="text-base font-semibold text-gray-900">Leave Type *</Label>
            {loadingBalances ? (
              <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading leave types...</span>
              </div>
            ) : leaveBalances.length === 0 ? (
              <Alert className="border-2 border-orange-400 bg-orange-50">
                <AlertDescription className="text-orange-900 font-semibold text-base">
                  ⚠ No leave balances available. Please contact your administrator to set up your leave allocations.
                </AlertDescription>
              </Alert>
            ) : (
              <Select value={leaveBalanceId} onValueChange={setLeaveBalanceId}>
                <SelectTrigger id="leave-type" className="h-12 text-base border-2 border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveBalances.map((balance) => (
                    <SelectItem key={balance.public_id} value={balance.public_id} className="text-base py-3">
                      {balance.leave_type_name} - Available: {balance.available_balance} days
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Selected Balance Info */}
          {selectedBalance && (
            <Alert className="border-2 border-blue-400 bg-blue-50">
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-900 font-semibold text-base">Available Balance:</span>
                    <span className="font-bold text-xl text-blue-900">{selectedBalance.available_balance} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800 font-medium">Used:</span>
                    <span className="font-semibold text-lg text-blue-800">{selectedBalance.used_balance} days</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-3">
              <Label htmlFor="start-date" className="text-base font-semibold text-gray-900">Start Date *</Label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                minDate={new Date()}
                placeholder="Select start date"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="end-date" className="text-base font-semibold text-gray-900">End Date *</Label>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                minDate={startDate || new Date()}
                placeholder="Select end date"
              />
            </div>
          </div>

          {/* Working Days Display */}
          {calculatingDays ? (
            <Alert className="border-2 border-gray-400 bg-gray-50">
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin mr-3 text-blue-600" />
                <AlertDescription className="text-gray-700 font-medium text-base">Calculating working days...</AlertDescription>
              </div>
            </Alert>
          ) : workingDays !== null && workingDays > 0 ? (
            <Alert className={selectedBalance && workingDays > selectedBalance.available_balance ? "border-2 border-red-400 bg-red-50" : "border-2 border-green-400 bg-green-50"}>
              <div className="flex items-start">
                <CalendarDays className="h-6 w-6 mt-1 mr-3 text-green-700" />
                <AlertDescription className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-900 text-base">Working Days:</span>
                    <span className="font-bold text-2xl text-green-900">{workingDays} days</span>
                  </div>
                  {selectedBalance && workingDays > selectedBalance.available_balance && (
                    <div className="text-red-800 font-semibold text-base mt-3 bg-red-100 p-3 rounded border border-red-300">
                      ⚠ Insufficient balance! You only have {selectedBalance.available_balance} days available.
                    </div>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          ) : null}

          {/* Reason */}
          <div className="space-y-3">
            <Label htmlFor="reason" className="text-base font-semibold text-gray-900">Reason *</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for your leave request"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              maxLength={500}
              className="text-base border-2 border-gray-300 focus:border-blue-500 resize-none"
            />
            <div className="text-sm text-gray-600 text-right font-medium">
              {reason.length}/500 characters
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-6 border-t">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleClose} 
            disabled={createMutation.isPending}
            className="h-12 px-8 text-base font-semibold border-2"
          >
            Cancel
          </Button>
          <Button
            size="lg"
            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 font-bold text-base shadow-lg"
            onClick={handleSubmit}
            disabled={
              createMutation.isPending ||
              !leaveBalanceId ||
              !startDate ||
              !endDate ||
              !reason.trim() ||
              workingDays === null ||
              workingDays <= 0 ||
              (selectedBalance && workingDays > selectedBalance.available_balance)
            }
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting Application...
              </>
            ) : (
              'Submit Leave Application'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
