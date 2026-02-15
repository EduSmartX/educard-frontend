/**
 * Organization API
 * API functions for organization management
 */

import api from '@/lib/api';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code: number;
}

export interface OrganizationAddress {
  public_id?: string;
  street_address: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  full_address?: string;
}

export interface Organization {
  public_id: string;
  name: string;
  organization_type: string;
  email: string;
  phone: string;
  registration_number?: string;
  corporate_identification_number?: string;
  tax_id?: string;
  website_url?: string;
  board_affiliation?: string;
  address?: OrganizationAddress;
  administrative?: {
    public_id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateOrganizationPayload {
  name?: string;
  organization_type?: string;
  email?: string;
  phone?: string;
  registration_number?: string;
  corporate_identification_number?: string;
  tax_id?: string;
  website?: string;
  board_affiliation?: string;
}

export interface UpdateOrganizationAddressPayload {
  street_address?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

/**
 * Get organization details
 */
export async function getOrganization(publicId: string): Promise<ApiResponse<Organization>> {
  const response = await api.get<ApiResponse<Organization>>(`/organizations/${publicId}/`);
  return response.data;
}

/**
 * Update organization information
 */
export async function updateOrganization(
  publicId: string,
  payload: UpdateOrganizationPayload
): Promise<ApiResponse<Organization>> {
  const response = await api.patch<ApiResponse<Organization>>(
    `/organizations/${publicId}/`,
    payload
  );
  return response.data;
}

/**
 * Update organization address
 */
export async function updateOrganizationAddress(
  publicId: string,
  payload: UpdateOrganizationAddressPayload
): Promise<ApiResponse<{ address_info: OrganizationAddress }>> {
  const response = await api.patch<ApiResponse<{ address_info: OrganizationAddress }>>(
    `/organizations/${publicId}/update-address/`,
    payload
  );
  return response.data;
}
