/**
 * Leave Allocation Feature Banner Component
 * Displays information about automatic leave balance creation
 */

import { Info, CheckCircle2 } from 'lucide-react';

export function LeaveAllocationFeatureBanner() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 ring-4 ring-blue-50">
            <Info className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">✨ Smart Automation Enabled</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            Leave balances are <strong className="text-blue-700">automatically created</strong> for
            all staff and students when you add a new policy. Simply define the policy, select
            applicable roles, and the system instantly provisions leave balances—
            <span className="text-green-700 font-medium"> zero manual work required!</span>
          </p>
          <div className="flex items-center gap-2 pt-1">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">Role-based auto-assignment</span>
            <span className="text-gray-300">•</span>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">Instant balance creation</span>
            <span className="text-gray-300">•</span>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">No manual intervention</span>
          </div>
        </div>
      </div>
    </div>
  );
}
