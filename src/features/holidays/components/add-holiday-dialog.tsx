/**
 * Add Holiday Dialog Component
 * Allows adding a single holiday at a time with modern UI
 */

import { useState, useEffect } from 'react';
import { Calendar, Loader2, Sparkles, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { CreateHolidayPayload } from '../types';
import { getDefaultHolidayFormData, validateHolidayForm } from '../utils/holiday-utils';
import { useCreateHoliday } from '../hooks/use-holiday-mutations';
import { HolidayFormFields } from './holiday-form-fields';

interface AddHolidayDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultDate?: string;
}

export function AddHolidayDialog({
  open: controlledOpen,
  onOpenChange,
  defaultDate,
}: AddHolidayDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [formData, setFormData] = useState(getDefaultHolidayFormData());

  // Pre-fill date when defaultDate is provided
  useEffect(() => {
    if (defaultDate && open) {
      setFormData({
        ...getDefaultHolidayFormData(),
        start_date: defaultDate,
      });
    }
  }, [defaultDate, open]);

  // Mutation
  const createMutation = useCreateHoliday({
    onSuccess: () => {
      setOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData(getDefaultHolidayFormData());
  };

  const updateField = (field: keyof CreateHolidayPayload, value: string | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'end_date' && value === '' ? { end_date: undefined } : {}),
    }));
  };

  const handleSubmit = () => {
    const validation = validateHolidayForm(formData);
    if (!validation.isValid) {
      validation.errors.forEach((error) => {
        toast.error('Validation Error', {
          description: error.message,
        });
      });
      return;
    }

    // Prepare payload
    const payload: CreateHolidayPayload = {
      start_date: formData.start_date,
      end_date: formData.end_date || formData.start_date,
      holiday_type: formData.holiday_type,
      description: formData.description.trim(),
    };

    createMutation.mutate(payload);
  };

  const isLoading = createMutation.isPending;

  // Check if dialog is controlled (open prop provided) or uncontrolled
  const isControlled = controlledOpen !== undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Only render trigger button in uncontrolled mode */}
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200">
            <Calendar className="h-4 w-4" />
            Add Holiday
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden border-0 p-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        {/* Header with gradient background */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 px-6 py-8">
          {/* Decorative circles */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>

          <DialogHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  Add Organization Holiday
                </DialogTitle>
                <DialogDescription className="text-emerald-50 mt-1">
                  Create a new holiday entry for your organization
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content area */}
        <div className="overflow-y-auto max-h-[calc(90vh-280px)] px-6 py-6">
          {/* Info card */}
          <Card className="mb-6 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm">
            <CardContent className="flex items-start gap-3 p-4">
              <div className="rounded-lg bg-emerald-100 p-2">
                <Sparkles className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-emerald-900 mb-1">Quick Tip</h4>
                <p className="text-sm text-emerald-700">
                  For adding multiple holidays at once, use the{' '}
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-1 bg-emerald-600 text-white"
                  >
                    <Upload className="h-3 w-3" />
                    Bulk Upload
                  </Badge>{' '}
                  feature with an Excel file.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Form fields in a card */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <HolidayFormFields
                startDate={formData.start_date}
                endDate={formData.end_date || ''}
                holidayType={formData.holiday_type}
                description={formData.description}
                onStartDateChange={(value) => updateField('start_date', value)}
                onEndDateChange={(value) => updateField('end_date', value)}
                onHolidayTypeChange={(value) => updateField('holiday_type', value)}
                onDescriptionChange={(value) => updateField('description', value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Footer with gradient */}
        <DialogFooter className="border-t bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
            className="border-gray-300 hover:bg-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200 min-w-[140px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Create Holiday
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
