/**
 * Holiday Form Fields Component
 * Reusable form fields for holiday creation and editing
 */

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { HolidayType } from '../types';
import { formatHolidayType } from '../utils/holiday-utils';

interface HolidayFormFieldsProps {
  startDate: string;
  endDate: string;
  holidayType: Exclude<HolidayType, 'SUNDAY' | 'SATURDAY'>;
  description: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onHolidayTypeChange: (value: Exclude<HolidayType, 'SUNDAY' | 'SATURDAY'>) => void;
  onDescriptionChange: (value: string) => void;
  errors?: {
    start_date?: string;
    end_date?: string;
    holiday_type?: string;
    description?: string;
  };
}

const HOLIDAY_TYPES: Array<Exclude<HolidayType, 'SUNDAY' | 'SATURDAY'>> = [
  'NATIONAL_HOLIDAY',
  'FESTIVAL',
  'ORGANIZATION_HOLIDAY',
  'SECOND_SATURDAY',
  'OTHER',
];

export function HolidayFormFields({
  startDate,
  endDate,
  holidayType,
  description,
  onStartDateChange,
  onEndDateChange,
  onHolidayTypeChange,
  onDescriptionChange,
  errors,
}: HolidayFormFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Start Date */}
      <div className="space-y-2">
        <Label htmlFor="start-date" className="text-sm font-medium">
          Start Date <span className="text-red-500">*</span>
        </Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className={errors?.start_date ? 'border-red-500' : ''}
        />
        {errors?.start_date && <p className="text-xs text-red-500">{errors.start_date}</p>}
      </div>

      {/* End Date */}
      <div className="space-y-2">
        <Label htmlFor="end-date" className="text-sm font-medium">
          End Date <span className="text-xs text-gray-500">(Optional)</span>
        </Label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          min={startDate}
          className={errors?.end_date ? 'border-red-500' : ''}
        />
        <p className="text-xs text-gray-500">Leave empty for single-day holiday</p>
        {errors?.end_date && <p className="text-xs text-red-500">{errors.end_date}</p>}
      </div>

      {/* Holiday Type */}
      <div className="space-y-2">
        <Label htmlFor="holiday-type" className="text-sm font-medium">
          Holiday Type <span className="text-red-500">*</span>
        </Label>
        <Select
          value={holidayType}
          onValueChange={(value) =>
            onHolidayTypeChange(value as Exclude<HolidayType, 'SUNDAY' | 'SATURDAY'>)
          }
        >
          <SelectTrigger id="holiday-type" className={errors?.holiday_type ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select holiday type" />
          </SelectTrigger>
          <SelectContent>
            {HOLIDAY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {formatHolidayType(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.holiday_type && <p className="text-xs text-red-500">{errors.holiday_type}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="e.g., Independence Day, Diwali, etc."
          rows={3}
          maxLength={255}
          className={errors?.description ? 'border-red-500' : ''}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{description.length}/255 characters</p>
          {errors?.description && <p className="text-xs text-red-500">{errors.description}</p>}
        </div>
      </div>
    </div>
  );
}
