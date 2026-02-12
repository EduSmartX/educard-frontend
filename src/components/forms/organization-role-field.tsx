/**
 * Organization Role Select Field Component
 * Reusable dropdown for selecting organization roles
 * Fetches roles from API and provides default value option
 */

import { useEffect } from 'react';
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
import { useOrganizationRoles } from '@/hooks/use-organization-roles';
import type { Control, FieldValues, Path } from 'react-hook-form';

interface OrganizationRoleFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  defaultRoleCode?: string; // e.g., "TEACHER", "STUDENT"
}

/**
 * Organization Role Select Field
 * @param defaultRoleCode - The default role code to pre-fill (e.g., "TEACHER" for teachers, "STUDENT" for students)
 */
export function OrganizationRoleField<T extends FieldValues>({
  control,
  name,
  label = 'Organization Role',
  placeholder = 'Select organization role',
  required = false,
  disabled = false,
  defaultRoleCode = 'TEACHER',
}: OrganizationRoleFieldProps<T>) {
  const { data: orgRoles = [], isLoading, error } = useOrganizationRoles();

  // Debug logging
  useEffect(() => {
    if (orgRoles.length > 0) {
      console.info('Organization roles loaded:', orgRoles.length, 'roles');
    }
    if (error) {
      console.error('Error loading organization roles:', error);
    }
  }, [orgRoles, error]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Auto-fill with default role code when roles are loaded
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (!field.value && defaultRoleCode && orgRoles.length > 0) {
            const defaultRole = orgRoles.find((role) => role.code === defaultRoleCode);
            if (defaultRole) {
              console.info('Auto-filling organization role:', defaultRole.name);
              field.onChange(defaultRoleCode);
            }
          }
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [orgRoles.length, field.value]);

        return (
          <FormItem>
            <FormLabel>
              {label} {required && <span className="text-red-500">*</span>}
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              value={(field.value as string) || ''}
              disabled={disabled || isLoading}
            >
              <FormControl>
                <SelectTrigger className="bg-gray-50 border-gray-300 focus:bg-white disabled:cursor-default disabled:opacity-100 transition-colors">
                  <SelectValue placeholder={isLoading ? 'Loading roles...' : placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {orgRoles.map((role) => (
                  <SelectItem key={role.id} value={role.code}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {defaultRoleCode && <FormDescription>Organization role for this user</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
