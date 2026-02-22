import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AttendancePeriod } from '../types';

interface StudentAttendanceRow {
  public_id: string;
  user: {
    public_id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  roll_number: string | null;
  morning_present: boolean;
  afternoon_present: boolean;
  remarks: string;
  attendance_status?: string;
  leave_info?: {
    leave_status: 'approved' | 'pending' | null;
    leave_type: string | null;
    leave_reason: string | null;
  };
}

interface StudentAttendanceTableProps {
  students: StudentAttendanceRow[];
  period: AttendancePeriod;
  isViewMode: boolean;
  onStudentChange: (
    studentId: string,
    field: 'morning_present' | 'afternoon_present' | 'remarks',
    value: boolean | string
  ) => void;
  onMarkAllPresent?: () => void;
  onMarkAllAbsent?: () => void;
}

export function StudentAttendanceTable({
  students,
  period,
  isViewMode,
  onStudentChange,
}: StudentAttendanceTableProps) {
  const showMorning = period === 'morning' || period === 'full_day';
  const showAfternoon = period === 'afternoon' || period === 'full_day';

  const AttendanceToggle = ({
    present,
    disabled,
    onChange,
  }: {
    present: boolean;
    disabled: boolean;
    onChange: (value: boolean) => void;
  }) => (
    <div className="flex gap-2 justify-center">
      <Button
        type="button"
        size="sm"
        variant={present ? 'default' : 'outline'}
        className={cn('h-8 w-8 p-0', present && 'bg-green-500 hover:bg-green-600 text-white')}
        onClick={() => onChange(true)}
        disabled={disabled}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={!present ? 'default' : 'outline'}
        className={cn('h-8 w-8 p-0', !present && 'bg-red-500 hover:bg-red-600 text-white')}
        onClick={() => onChange(false)}
        disabled={disabled}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: '#E8F5E9' }}>
              <TableHead className="w-[100px] font-bold text-gray-900">Roll No</TableHead>
              <TableHead className="font-bold text-gray-900">Student Name</TableHead>
              {showMorning && (
                <TableHead className="text-center w-[150px] font-bold text-gray-900">
                  Morning
                </TableHead>
              )}
              {showAfternoon && (
                <TableHead className="text-center w-[150px] font-bold text-gray-900">
                  Afternoon
                </TableHead>
              )}
              <TableHead className="w-[200px] font-bold text-gray-900">Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No students found in this class
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => {
                const canEdit = !isViewMode && student.leave_info?.leave_status !== 'approved';

                return (
                  <TableRow
                    key={student.public_id}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium">{student.roll_number}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {student.user.first_name} {student.user.last_name}
                        </div>
                        {/* email removed intentionally - show only student name */}
                        {student.leave_info && student.leave_info.leave_status && (
                          <div className="mt-1">
                            {student.leave_info.leave_status === 'approved' ? (
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200"
                              >
                                On Leave
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-yellow-50 text-yellow-700 border-yellow-200"
                              >
                                Leave Pending
                              </Badge>
                            )}
                            {student.leave_info.leave_type && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({student.leave_info.leave_type})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    {showMorning && (
                      <TableCell className="text-center">
                        <AttendanceToggle
                          present={student.morning_present}
                          disabled={!canEdit}
                          onChange={(value) =>
                            onStudentChange(student.public_id, 'morning_present', value)
                          }
                        />
                      </TableCell>
                    )}
                    {showAfternoon && (
                      <TableCell className="text-center">
                        <AttendanceToggle
                          present={student.afternoon_present}
                          disabled={!canEdit}
                          onChange={(value) =>
                            onStudentChange(student.public_id, 'afternoon_present', value)
                          }
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <Input
                        type="text"
                        value={student.remarks}
                        onChange={(e) =>
                          onStudentChange(student.public_id, 'remarks', e.target.value)
                        }
                        placeholder="Add remarks..."
                        disabled={!canEdit}
                        className="text-sm"
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
