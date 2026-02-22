import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AttendanceSummaryPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance Summary</h1>
        <p className="text-muted-foreground">View attendance summary and statistics</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Summary</CardTitle>
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
