import { MarkAttendanceForm } from '../components/mark-attendance-form';

export function MarkAttendancePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mark Attendance</h1>
        <p className="text-muted-foreground">Mark daily attendance for students in your classes</p>
      </div>

      <MarkAttendanceForm />
    </div>
  );
}
