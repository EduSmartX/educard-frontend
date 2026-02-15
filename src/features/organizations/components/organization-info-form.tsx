/**
 * Organization Info Form
 * Update organization basic information
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { TextInputField } from '@/components/forms/form-fields';
import { SelectField } from '@/components/forms/form-fields';
import { useUpdateOrganization } from '../hooks/mutations';
import type { Organization } from '../api/organization-api';
import {
  ORGANIZATION_TYPE_OPTIONS,
  BOARD_AFFILIATION_OPTIONS,
} from '@/constants/organization-types';

const organizationInfoSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  organization_type: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  registration_number: z.string().optional(),
  corporate_identification_number: z.string().optional(),
  tax_id: z.string().optional(),
  website_url: z.string().url('Invalid website URL').optional().or(z.literal('')),
  board_affiliation: z.string().optional(),
});

type OrganizationInfoFormData = z.infer<typeof organizationInfoSchema>;

interface OrganizationInfoFormProps {
  organization: Organization | undefined;
  isLoading: boolean;
}

export function OrganizationInfoForm({ organization, isLoading }: OrganizationInfoFormProps) {
  const updateMutation = useUpdateOrganization(organization?.public_id || '');

  const form = useForm<OrganizationInfoFormData>({
    resolver: zodResolver(organizationInfoSchema),
    defaultValues: {
      name: '',
      organization_type: '',
      email: '',
      phone: '',
      registration_number: '',
      corporate_identification_number: '',
      tax_id: '',
      website_url: '',
      board_affiliation: '',
    },
  });

  useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name || '',
        organization_type: organization.organization_type || '',
        email: organization.email || '',
        phone: organization.phone || '',
        registration_number: organization.registration_number || '',
        corporate_identification_number: organization.corporate_identification_number || '',
        tax_id: organization.tax_id || '',
        website_url: organization.website_url || '',
        board_affiliation: organization.board_affiliation || '',
      });
    }
  }, [organization, form]);

  const onSubmit = (values: OrganizationInfoFormData) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <CardContent className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </CardContent>
    );
  }

  return (
    <CardContent className="pt-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <TextInputField
                control={form.control}
                name="name"
                label="Organization Name"
                placeholder="Adharsha International High School"
                required
              />
            </div>

            <SelectField
              control={form.control}
              name="organization_type"
              label="Organization Type"
              placeholder="Select organization type"
              options={ORGANIZATION_TYPE_OPTIONS}
            />

            <SelectField
              control={form.control}
              name="board_affiliation"
              label="Board Affiliation"
              placeholder="Select board affiliation"
              options={BOARD_AFFILIATION_OPTIONS}
            />

            <TextInputField
              control={form.control}
              name="email"
              label="Email Address"
              placeholder="info@organization.com"
              type="email"
              required
            />

            <TextInputField
              control={form.control}
              name="phone"
              label="Phone Number"
              placeholder="+1234567890"
              type="tel"
            />

            <TextInputField
              control={form.control}
              name="registration_number"
              label="Registration Number"
              placeholder="REG123456"
            />

            <TextInputField
              control={form.control}
              name="corporate_identification_number"
              label="Corporate Identification Number (CIN)"
              placeholder="U12345AB2020PTC123456"
            />

            <TextInputField
              control={form.control}
              name="tax_id"
              label="Tax ID / GSTIN"
              placeholder="22AAAAA0000A1Z5"
            />

            <TextInputField
              control={form.control}
              name="website_url"
              label="Website"
              placeholder="https://www.organization.com"
            />
          </div>

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
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </CardContent>
  );
}
