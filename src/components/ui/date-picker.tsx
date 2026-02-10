/**
 * Professional Date Picker Component
 * Using react-datepicker for excellent UX with month/year dropdowns
 */
import React from 'react';
import ReactDatePicker from 'react-datepicker';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  minDate,
  maxDate,
  className,
}: DatePickerProps) {
  const CustomInput = React.forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(
    ({ value, onClick }, ref) => (
      <Button
        ref={ref}
        type="button"
        variant="outline"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'w-full justify-start text-left font-normal bg-white',
          !value && 'text-muted-foreground',
          className
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value || placeholder}
      </Button>
    )
  );
  CustomInput.displayName = 'CustomInput';

  return (
    <ReactDatePicker
      selected={value}
      onChange={onChange}
      customInput={<CustomInput />}
      dateFormat="MMMM d, yyyy"
      minDate={minDate}
      maxDate={maxDate}
      disabled={disabled}
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      yearDropdownItemNumber={100}
      scrollableYearDropdown
      placeholderText={placeholder}
      className="w-full"
      calendarClassName="professional-calendar"
      popperClassName="date-picker-popper"
      showPopperArrow={false}
    />
  );
}
