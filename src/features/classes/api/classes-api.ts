/**
 * Classes API
 * Temporary stub for fetching class data
 */

import api from '@/lib/api';

export interface Class {
  public_id: string;
  name: string;
  section?: string;
  class_master?: {
    name: string;
  };
}

export interface ClassListParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export interface ClassListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  data: Class[];
}

/**
 * Fetch paginated list of classes
 */
export async function fetchClasses(params?: ClassListParams): Promise<ClassListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.append('page', params.page.toString());
  }
  if (params?.page_size) {
    searchParams.append('page_size', params.page_size.toString());
  }
  if (params?.search) {
    searchParams.append('search', params.search);
  }

  const response = await api.get<ClassListResponse>(`/classes/?${searchParams.toString()}`);

  return response.data;
}
