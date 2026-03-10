import { useState } from 'react';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { bulkSubmitEmployeeAttendance } from '@/features/attendance/api/attendance-api';

interface SingleDayAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
}

type AttendanceSession = 'MORNING' | 'AFTERNOON';

export function SingleDayAttendanceDialog({
  open,
  onOpenChange,
  date,
}: SingleDayAttendanceDialogProps) {
  const [selectedSessions, setSelectedSessions] = useState<AttendanceSession[]>([]);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Determine attendance status based on selected sessions
      let status: 'P' | 'HP' | 'A';
      if (selectedSessions.length === 2) {
        status = 'P'; // Full day present
      } else if (selectedSessions.length === 1) {
        status = 'HP'; // Half day present
      } else {
        status = 'A'; // Absent (no sessions selected)
      }

      const submission = {
        timesheet: {
          week_start_date: dateStr,
          week_end_date: dateStr,
        },
        attendance_records: [
          {
            date: dateStr,
            attendance_status: status,
            morning_present: selectedSessions.includes('MORNING'),
            afternoon_present: selectedSessions.includes('AFTERNOON'),
          },
        ],
      };

      return bulkSubmitEmployeeAttendance(submission);
    },
    onSuccess: () => {
      toast.success('Attendance submitted successfully', {
        description: `Submitted for ${format(date, 'MMMM d, yyyy')}`,
      });
      
      // Invalidate attendance queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['timesheet', 'attendance'] });
      
      // Reset and close
      setSelectedSessions([]);
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { detail?: string } }; message?: string };
      const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to submit attendance';
      toast.error('Submission Failed', {
        description: errorMessage,
        duration: 6000,
      });
    },
  });

  const toggleSession = (session: AttendanceSession) => {
    setSelectedSessions((prev) =>
      prev.includes(session)
        ? prev.filter((s) => s !== session)
        : [...prev, session]
    );
  };

  const handleSubmit = () => {
    if (selectedSessions.length === 0) {
      toast.error('Please select at least one session');
      return;
    }
    mutation.mutate();
  };

  const handleClose = () => {
    if (!mutation.isPending) {
      setSelectedSessions([]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Submit Attendance</DialogTitle>
          <DialogDescription>
            Mark your attendance for {format(date, 'EEEE, MMMM d, yyyy')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 bg-white">
          <div className="text-sm text-gray-600 mb-2">
            Select the sessions you were present:
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={selectedSessions.includes('MORNING') ? 'default' : 'outline'}
              className={`h-20 flex flex-col gap-2 ${
                selectedSessions.includes('MORNING') 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => toggleSession('MORNING')}
              disabled={mutation.isPending}
            >
              <Sun className="h-6 w-6" />
              <span className="text-sm font-medium">Morning</span>
            </Button>

            <Button
              type="button"
              variant={selectedSessions.includes('AFTERNOON') ? 'default' : 'outline'}
              className={`h-20 flex flex-col gap-2 ${
                selectedSessions.includes('AFTERNOON') 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => toggleSession('AFTERNOON')}
              disabled={mutation.isPending}
            >
              <Moon className="h-6 w-6" />
              <span className="text-sm font-medium">Afternoon</span>
            </Button>
          </div>

          {selectedSessions.length > 0 && (
            <div className="text-sm text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              {selectedSessions.length === 2 ? (
                <span className="text-blue-700 font-medium">✓ Full Day Present</span>
              ) : (
                <span className="text-blue-700 font-medium">✓ Half Day Present ({selectedSessions[0].toLowerCase()})</span>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={mutation.isPending}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={mutation.isPending || selectedSessions.length === 0}
            className="flex-1"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
