/**
 * Reusable Form Field Components
 * Common form field patterns used across different forms
 */

import { useState } from 'react';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { getValidator, type ValidationResult } from '@/lib/utils/field-validators';

/**
 * Text Input Field Props
 */
interface TextInputFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'password';
  max?: string | Date;
  min?: string | Date;
  readOnly?: boolean;
  validationType?: 'email' | 'phone' | 'employeeId' | 'name' | 'numeric' | 'text' | 'alphanumeric';
  validationOptions?: {
    fieldName?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    allowDecimal?: boolean;
  };
}

export function TextInputField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  description,
  type = 'text',
  max,
  min,
  readOnly = false,
  validationType,
  validationOptions,
}: TextInputFieldProps<T>) {
  const [blurError, setBlurError] = useState<string | undefined>();

  const handleBlur = (value: string, onChange: (value: string) => void) => {
    // Clear previous blur error
    setBlurError(undefined);

    if (!validationType || !value || value.trim() === '') {
      return;
    }

    const validator = getValidator(validationType, validationOptions);
    const result: ValidationResult = validator(value);

    if (!result.isValid && result.error) {
      setBlurError(result.error);
      // Trigger form validation by setting the field value again
      onChange(value);
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              disabled={disabled}
              readOnly={readOnly}
              placeholder={placeholder}
              max={max instanceof Date ? max.toISOString().split('T')[0] : max}
              min={min instanceof Date ? min.toISOString().split('T')[0] : min}
              onBlur={(e) => {
                field.onBlur();
                handleBlur(e.target.value, field.onChange);
              }}
              className={
                readOnly
                  ? 'cursor-not-allowed bg-gray-50 text-gray-700'
                  : 'bg-gray-50 border-gray-300 focus:bg-white disabled:cursor-default disabled:opacity-100 transition-colors'
              }
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          {/* Show blur error if exists and no field error */}
          {blurError && !fieldState.error && (
            <p className="text-sm font-medium text-amber-600">{blurError}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Select Field Props
 */
interface SelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  options: Array<{ value: string; label: string }>;
}

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  description,
  options,
}: SelectFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <Select onValueChange={field.onChange} value={field.value as string} disabled={disabled}>
            <FormControl>
              <SelectTrigger className="bg-gray-50 border-gray-300 focus:bg-white disabled:cursor-default disabled:opacity-100 transition-colors">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Date Input Field
 */
interface DateInputFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  disabled?: boolean;
  required?: boolean;
  description?: string;
  max?: Date;
  min?: Date;
  validationType?: 'dateOfBirth' | 'joiningDate';
  validationOptions?: {
    minAge?: number;
    maxAge?: number;
  };
}

export function DateInputField<T extends FieldValues>({
  control,
  name,
  label,
  disabled = false,
  required = false,
  description,
  max,
  min,
  validationType,
  validationOptions,
}: DateInputFieldProps<T>) {
  const [blurError, setBlurError] = useState<string | undefined>();

  const handleDateChange = (date: Date | null, onChange: (value: string) => void) => {
    const dateString = date ? date.toISOString().split('T')[0] : '';
    onChange(dateString);

    // Clear previous error
    setBlurError(undefined);

    // Validate on change
    if (validationType && dateString) {
      const validator = getValidator(validationType, validationOptions);
      const result: ValidationResult = validator(dateString);

      if (!result.isValid && result.error) {
        setBlurError(result.error);
      }
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            <DatePicker
              value={field.value ? new Date(field.value) : null}
              onChange={(date) => handleDateChange(date, field.onChange)}
              placeholder={`Select ${label.toLowerCase()}`}
              disabled={disabled}
              minDate={min instanceof Date ? min : min ? new Date(min) : undefined}
              maxDate={max instanceof Date ? max : max ? new Date(max) : undefined}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          {/* Show blur error if exists and no field error */}
          {blurError && !fieldState.error && (
            <p className="text-sm font-medium text-amber-600">{blurError}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Blood Group Field
 */
const BLOOD_GROUP_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

interface BloodGroupFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  disabled?: boolean;
  required?: boolean;
}

export function BloodGroupField<T extends FieldValues>({
  control,
  name,
  disabled = false,
  required = false,
}: BloodGroupFieldProps<T>) {
  return (
    <SelectField
      control={control}
      name={name}
      label="Blood Group"
      placeholder="Select blood group"
      disabled={disabled}
      required={required}
      options={BLOOD_GROUP_OPTIONS}
    />
  );
}

/**
 * Gender Field
 */
const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' },
];

interface GenderFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  disabled?: boolean;
  required?: boolean;
}

export function GenderField<T extends FieldValues>({
  control,
  name,
  disabled = false,
  required = false,
}: GenderFieldProps<T>) {
  return (
    <SelectField
      control={control}
      name={name}
      label="Gender"
      placeholder="Select gender"
      disabled={disabled}
      required={required}
      options={GENDER_OPTIONS}
    />
  );
}
