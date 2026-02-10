import { useState } from 'react';

export interface User {
  public_id: string;
  username: string;
  email: string;
  role: string;
  full_name: string;
  profile_image?: string;
}

export interface Organization {
  public_id: string;
  name: string;
  organization_type: string;
  email: string;
  phone: string;
  website_url?: string;
  board_affiliation?: string;
  logo?: string;
  is_active: boolean;
  is_verified: boolean;
  is_approved: boolean;
}

export function useAuth() {
  const getUserFromStorage = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
    return null;
  };

  const getOrganizationFromStorage = () => {
    const orgStr = localStorage.getItem('organization');
    if (orgStr) {
      try {
        return JSON.parse(orgStr);
      } catch (e) {
        console.error('Failed to parse organization data:', e);
      }
    }
    return null;
  };

  const [user] = useState<User | null>(getUserFromStorage);
  const [organization] = useState<Organization | null>(getOrganizationFromStorage);

  return { user, organization };
}
