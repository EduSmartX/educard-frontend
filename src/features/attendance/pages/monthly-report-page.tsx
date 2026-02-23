import { PageHeader } from '@/components/common';
import { AttendanceUiText } from '@/constants';
import { AttendanceComingSoonCard } from '../components/attendance-coming-soon-card';

export function MonthlyAttendanceReportPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title={AttendanceUiText.MONTHLY_PAGE_TITLE}
        description={AttendanceUiText.MONTHLY_PAGE_DESC}
      />

      <AttendanceComingSoonCard title={AttendanceUiText.MONTHLY_PAGE_TITLE} />
    </div>
  );
}
