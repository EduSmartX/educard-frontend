/**
 * API Client for Leave Management
 * Updated for role-based backend URL structure
 */
import apiClient from '@/lib/api';
import type {
  ApiListResponse,
  ApiSingleResponse,
  CalculateWorkingDaysPayload,
  CancelLeaveRequestPayload,
  CreateLeaveRequestPayload,
  LeaveBalance,
  LeaveBalanceQueryParams,
  LeaveBalanceSummary,
  LeaveRequest,
  LeaveRequestQueryParams,
  UpdateLeaveRequestPayload,
  WorkingDaysCalculation,
} from '../types';

// ===========================
// Leave Balance APIs (Employee/Teacher)
// ===========================

/**
 * Fetch leave balances for current user
 */
export async function fetchMyLeaveBalances(
  params?: LeaveBalanceQueryParams
): Promise<ApiListResponse<LeaveBalance>> {
  const response = await apiClient.get('/leave/employee/balances/', { params });
  return response.data;
}

/**
 * Fetch leave balance summary for dashboard
 */
export async function fetchMyLeaveBalancesSummary(): Promise<
  ApiSingleResponse<LeaveBalanceSummary[]>
> {
  const response = await apiClient.get('/leave/employee/balances/my-balance/');
  return response.data;
}

/**
 * Fetch leave balances for a specific user (manageable by current user)
 */
export async function fetchUserLeaveBalances(
  userPublicId: string,
  params?: LeaveBalanceQueryParams
): Promise<ApiListResponse<LeaveBalance>> {
  const response = await apiClient.get(`/leave/employee/balances/user/${userPublicId}/`, {
    params,
  });
  return response.data;
}

/**
 * Fetch leave balance summary for a specific user
 */
export async function fetchUserLeaveBalancesSummary(
  userPublicId: string
): Promise<ApiSingleResponse<LeaveBalanceSummary[]>> {
  const response = await apiClient.get(`/leave/employee/balances/user/${userPublicId}/`);
  return response.data;
}

/**
 * Fetch single leave balance by public_id
 */
export async function fetchLeaveBalance(
  publicId: string
): Promise<ApiSingleResponse<LeaveBalance>> {
  const response = await apiClient.get(`/leave/employee/balances/${publicId}/`);
  return response.data;
}

// ===========================
// Leave Request APIs (All School Users)
// ===========================

/**
 * Fetch leave requests for current user
 */
export async function fetchMyLeaveRequests(
  params?: LeaveRequestQueryParams
): Promise<ApiListResponse<LeaveRequest>> {
  const response = await apiClient.get('/leave/user/requests/', { params });
  return response.data;
}

/**
 * Fetch leave requests for a specific user (manageable by current user)
 */
export async function fetchUserLeaveRequests(
  userPublicId: string,
  params?: LeaveRequestQueryParams
): Promise<ApiListResponse<LeaveRequest>> {
  const response = await apiClient.get('/leave/user/requests/', {
    params: {
      ...params,
      user: userPublicId,
    },
  });
  return response.data;
}

/**
 * Fetch single leave request by public_id
 */
export async function fetchLeaveRequest(
  publicId: string,
  isDeleted = false
): Promise<ApiSingleResponse<LeaveRequest>> {
  const params = isDeleted ? { is_deleted: 'true' } : {};
  const response = await apiClient.get(`/leave/user/requests/${publicId}/`, { params });
  return response.data;
}

/**
 * Create a new leave request
 */
export async function createLeaveRequest(
  data: CreateLeaveRequestPayload
): Promise<ApiSingleResponse<LeaveRequest>> {
  const response = await apiClient.post('/leave/user/requests/', data);
  return response.data;
}

/**
 * Update an existing leave request (only pending requests)
 */
export async function updateLeaveRequest(
  publicId: string,
  data: UpdateLeaveRequestPayload
): Promise<ApiSingleResponse<LeaveRequest>> {
  const response = await apiClient.patch(`/leave/user/requests/${publicId}/`, data);
  return response.data;
}

/**
 * Cancel a leave request
 */
export async function cancelLeaveRequest(
  publicId: string,
  data?: CancelLeaveRequestPayload
): Promise<ApiSingleResponse<LeaveRequest>> {
  const response = await apiClient.post(`/leave/user/requests/${publicId}/cancel/`, data || {});
  return response.data;
}

/**
 * Calculate working days for a date range
 */
export async function calculateWorkingDays(
  data: CalculateWorkingDaysPayload
): Promise<ApiSingleResponse<WorkingDaysCalculation>> {
  const response = await apiClient.post('/leave/user/requests/calculate-working-days/', data);
  return response.data;
}

// ===========================
// Leave Review APIs (Employee/Teacher - Approve/Reject)
// ===========================

/**
 * Fetch leave requests for review (manageable users only)
 */
export async function fetchLeaveReviews(
  params?: LeaveRequestQueryParams
): Promise<ApiListResponse<LeaveRequest>> {
  const response = await apiClient.get('/leave/employee/reviews/', { params });
  return response.data;
}

/**
 * Fetch single leave request for review
 */
export async function fetchLeaveReview(publicId: string): Promise<ApiSingleResponse<LeaveRequest>> {
  const response = await apiClient.get(`/leave/employee/reviews/${publicId}/`);
  return response.data;
}

/**
 * Approve a leave request
 */
export async function approveLeaveRequest(
  publicId: string,
  data?: { review_comments?: string }
): Promise<ApiSingleResponse<LeaveRequest>> {
  const response = await apiClient.post(`/leave/employee/reviews/${publicId}/approve/`, data || {});
  return response.data;
}

/**
 * Reject a leave request
 */
export async function rejectLeaveRequest(
  publicId: string,
  data?: { review_comments?: string }
): Promise<ApiSingleResponse<LeaveRequest>> {
  const response = await apiClient.post(`/leave/employee/reviews/${publicId}/reject/`, data || {});
  return response.data;
}

// ===========================
// Deprecated/Removed APIs
// ===========================

/**
 * @deprecated Delete operation not supported in backend
 * Use cancelLeaveRequest instead
 */
export function deleteLeaveRequest(_publicId: string): Promise<void> {
  return Promise.reject(new Error('Delete operation not supported. Use cancel instead.'));
}

/**
 * @deprecated Reactivate operation not implemented in backend
 */
export function reactivateLeaveRequest(
  _publicId: string
): Promise<ApiSingleResponse<LeaveRequest>> {
  return Promise.reject(new Error('Reactivate operation not implemented in backend.'));
}
