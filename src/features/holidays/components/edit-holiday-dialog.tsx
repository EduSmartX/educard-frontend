/**
 * Edit Holiday Dialog Component
 * Edit an existing holiday with modern UI
 */

import { useState, useEffect } from 'react';
import { Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import type { Holiday, CreateHolidayPayload } from '../types';
import { useUpdateHoliday } from '../hooks/use-holiday-mutations';
import { HolidayFormFields } from './holiday-form-fields';

interface EditHolidayDialogProps {
  holiday: Holiday | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditHolidayDialog({ holiday, open, onOpenChange }: EditHolidayDialogProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [holidayType, setHolidayType] =
    useState<Exclude<CreateHolidayPayload['holiday_type'], 'SUNDAY' | 'SATURDAY'>>(
      'NATIONAL_HOLIDAY'
    );
  const [description, setDescription] = useState('');

  // Load holiday data when dialog opens
  useEffect(() => {
    if (holiday && open) {
      setStartDate(holiday.start_date);
      setEndDate(holiday.end_date);
      setHolidayType(
        holiday.holiday_type as Exclude<CreateHolidayPayload['holiday_type'], 'SUNDAY' | 'SATURDAY'>
      );
      setDescription(holiday.description);
    }
  }, [holiday, open]);

  const updateMutation = useUpdateHoliday({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const handleSubmit = () => {
    if (!holiday) return;

    updateMutation.mutate({
      id: holiday.public_id,
      payload: {
        start_date: startDate,
        end_date: endDate || startDate,
        holiday_type: holidayType,
        description: description.trim(),
      },
    });
  };

  if (!holiday) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden border-0 p-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header with gradient background */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 px-6 py-8">
          {/* Decorative circles */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>

          <DialogHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Pencil className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">Edit Holiday</DialogTitle>
                <DialogDescription className="text-blue-50 mt-1">
                  Update holiday information
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content area */}
        <div className="px-6 py-6">
          {/* Form fields in a card */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <HolidayFormFields
                startDate={startDate}
                endDate={endDate}
                holidayType={holidayType}
                description={description}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onHolidayTypeChange={setHolidayType}
                onDescriptionChange={setDescription}
              />
            </CardContent>
          </Card>
        </div>

        {/* Footer with gradient */}
        <DialogFooter className="border-t bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateMutation.isPending}
            className="border-gray-300 hover:bg-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 min-w-[140px]"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                Update Holiday
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
