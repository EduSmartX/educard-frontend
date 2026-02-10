import { z } from 'zod';

/**
 * Creates a Zod schema for address validation
 * @param required - Whether address fields are required
 * @returns Object with address field schemas
 */
export const createAddressSchema = (required: boolean) => ({
  streetAddress: required ? z.string().min(1, 'Street address is required') : z.string().optional(),
  addressLine2: z.string().optional(),
  city: required ? z.string().min(1, 'City is required') : z.string().optional(),
  state: required ? z.string().min(1, 'State is required') : z.string().optional(),
  zipCode: required ? z.string().min(1, 'ZIP code is required') : z.string().optional(),
  country: z.string().default('India'),
});

/**
 * Type definition for address form data
 */
export interface AddressFormData {
  streetAddress?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

/**
 * Helper to clear address form fields
 */
export const clearAddressFields = (
  form: {
    setValue: (field: string, value: string) => void;
    clearErrors: (fields: string[]) => void;
  },
  fieldPrefix = ''
) => {
  const getFieldName = (field: string) => (fieldPrefix ? `${fieldPrefix}.${field}` : field);

  form.setValue(getFieldName('streetAddress'), '');
  form.setValue(getFieldName('addressLine2'), '');
  form.setValue(getFieldName('city'), '');
  form.setValue(getFieldName('state'), '');
  form.setValue(getFieldName('zipCode'), '');
  form.clearErrors([
    getFieldName('streetAddress'),
    getFieldName('city'),
    getFieldName('state'),
    getFieldName('zipCode'),
  ]);
};
