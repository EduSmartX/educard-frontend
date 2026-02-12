/**
 * Supervisor Field Component (Reusable)
 * Dropdown to select a supervisor from organization users.
 * Auto-fetches users and formats them for display.
 * Used in Teacher and Student forms.
 */

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOrganizationUsers } from '@/hooks/use-supervisors';
import type { Control, FieldValues, Path } from 'react-hook-form';

interface SupervisorFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  description?: string;
}

/**
 * Reusable Supervisor Field Component
 * Displays a dropdown of organization users formatted as "Full Name (email)"
 */
export function SupervisorField<T extends FieldValues>({
  control,
  name,
  label = 'Supervisor',
  placeholder = 'Select supervisor',
  disabled = false,
  description = 'Optional: Assign a supervisor for this user',
}: SupervisorFieldProps<T>) {
  const { data: users = [], isLoading } = useOrganizationUsers();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value as string}
            disabled={disabled || isLoading}
          >
            <FormControl>
              <SelectTrigger className="bg-gray-50 border-gray-300 focus:bg-white disabled:cursor-default disabled:opacity-100 transition-colors">
                <SelectValue placeholder={isLoading ? 'Loading supervisors...' : placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              {users.map((user) => (
                <SelectItem key={user.public_id} value={user.email}>
                  {user.full_name} ({user.email})
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
