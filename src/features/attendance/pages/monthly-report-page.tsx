import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function MonthlyAttendanceReportPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monthly Attendance Report</h1>
        <p className="text-muted-foreground">View monthly attendance reports and analytics</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Report</CardTitle>
          <CardDescription>Coming soon...</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This feature is under development and will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
