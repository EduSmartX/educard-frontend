/**
 * Leave Name Helper Utility
 * Provides consistent leave name display across all components
 */

interface LeaveBalanceSummary {
  leave_type_name: string;
}

interface LeaveWithName {
  leave_name?: string;
  leave_allocation?: {
    display_name?: string;
    leave_type_name: string;
  };
}

interface LeaveBalance {
  leave_name?: string;
  leave_allocation: {
    display_name?: string;
    leave_type_name: string;
  };
}

type LeaveObject = LeaveWithName | LeaveBalance | LeaveBalanceSummary;

// Type guards
function isLeaveBalanceSummary(obj: LeaveObject): obj is LeaveBalanceSummary {
  return 'leave_type_name' in obj && !('leave_allocation' in obj);
}

function hasLeaveAllocation(obj: LeaveObject): obj is LeaveBalance | LeaveWithName {
  return 'leave_allocation' in obj;
}

/**
 * Get proper leave type name with priority:
 * 1. Custom name (leave_name) if set
 * 2. Display name (leave_allocation.display_name) if set
 * 3. Master name (leave_allocation.leave_type_name or leave_type_name) as fallback
 */
export function getLeaveTypeName(leave: LeaveObject): string {
  // Handle simple summary object with just leave_type_name
  if (isLeaveBalanceSummary(leave)) {
    return leave.leave_type_name || 'Unknown';
  }

  // Handle objects with leave_allocation structure
  if (hasLeaveAllocation(leave)) {
    // Check custom name first
    if (leave.leave_name?.trim()) {
      return leave.leave_name.trim();
    }

    // Check display name
    if (leave.leave_allocation?.display_name?.trim()) {
      return leave.leave_allocation.display_name.trim();
    }

    // Fallback to master name
    return leave.leave_allocation?.leave_type_name || 'Unknown';
  }

  return 'Unknown';
}
