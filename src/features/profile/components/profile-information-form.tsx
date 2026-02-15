/**
 * Profile Information Form
 * Update personal details (name, gender, blood group, DOB)
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import {
  BloodGroupField,
  DateInputField,
  GenderField,
  TextInputField,
} from '@/components/forms/form-fields';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useUserProfile } from '../hooks/queries';
import { useUpdateProfile } from '../hooks/mutations';
import {
  profileInformationSchema,
  type ProfileInformationFormData,
} from '../schemas/profile-schemas';

export function ProfileInformationForm() {
  const { data: profile, isLoading } = useUserProfile();
  const updateMutation = useUpdateProfile();

  const form = useForm<ProfileInformationFormData>({
    resolver: zodResolver(profileInformationSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      gender: undefined,
      blood_group: undefined,
      date_of_birth: '',
      notification_opt_in: true,
    },
  });

  useEffect(() => {
    if (profile) {
      const formData = {
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        gender: profile.gender || undefined,
        blood_group: profile.blood_group || undefined,
        date_of_birth: profile.date_of_birth || '',
        notification_opt_in: profile.notification_opt_in ?? true,
      };

      // Use reset with values and options to force update
      form.reset(formData, {
        keepDefaultValues: false,
        keepDirty: false,
        keepErrors: false,
      });
    }
  }, [profile, form]);

  const onSubmit = (values: ProfileInformationFormData) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextInputField
                control={form.control}
                name="first_name"
                label="First Name"
                placeholder="John"
                required
                validationType="name"
              />
              <TextInputField
                control={form.control}
                name="last_name"
                label="Last Name"
                placeholder="Doe"
                required
                validationType="name"
              />
              <TextInputField
                control={form.control}
                name="phone"
                label="Phone Number"
                placeholder="+1234567890"
                type="tel"
                validationType="phone"
              />
              <GenderField control={form.control} name="gender" required />
              <BloodGroupField control={form.control} name="blood_group" />
              <DateInputField
                control={form.control}
                name="date_of_birth"
                label="Date of Birth"
                max={new Date()}
              />
            </div>

            <FormField
              control={form.control}
              name="notification_opt_in"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Notification Preferences</FormLabel>
                    <FormDescription>
                      Receive email notifications about important updates
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={updateMutation.isPending || !form.formState.isDirty}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending || !form.formState.isDirty}
                className="bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/50 disabled:opacity-50 disabled:shadow-none"
              >
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
