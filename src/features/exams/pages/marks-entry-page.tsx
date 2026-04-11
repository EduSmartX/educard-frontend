/**
 * Marks Entry Page
 * Select exam session -> exam -> exam subject, then enter marks for students
 * Solid, grounded UI with structured table for bulk entry
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, GraduationCap, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/common';
import { ROUTES, SuccessMessages } from '@/constants';
import { useExamSessions, useExams, useExamSubjects, useMarks } from '../hooks/use-exams';
import { useBulkCreateMarks, useUpdateMark } from '../hooks/mutations';
import type { BulkMarkEntry, Mark as MarkType } from '../types';

interface StudentMarkEntry {
  student_id: string;
  student_name: string;
  admission_number: string;
  marks_obtained: string;
  is_absent: boolean;
  remarks: string;
  existing_mark?: MarkType;
}

export function MarksEntryPage() {
  const navigate = useNavigate();

  // Selection state
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedExamSubjectId, setSelectedExamSubjectId] = useState('');

  // Data queries
  const { data: sessionsData } = useExamSessions({ page: 1, page_size: 100 });
  const { data: examsData } = useExams({
    page: 1,
    page_size: 100,
    session: selectedSessionId || undefined,
  });
  const { data: examSubjectsData } = useExamSubjects({
    page: 1,
    page_size: 100,
    exam: selectedExamId || undefined,
  });
  const { data: existingMarksData, isLoading: marksLoading } = useMarks({
    page: 1,
    page_size: 200,
    exam_subject: selectedExamSubjectId || undefined,
  });

  const sessions = sessionsData?.data || [];
  const exams = examsData?.data || [];
  const examSubjects = examSubjectsData?.data || [];
  const existingMarks = existingMarksData?.data || [];

  // Selected exam subject info
  const selectedExamSubject = examSubjects.find((es) => es.public_id === selectedExamSubjectId);

  // Student marks entries — populated from existing marks
  const [markEntries, setMarkEntries] = useState<StudentMarkEntry[]>([]);

  useEffect(() => {
    if (existingMarks.length > 0 && selectedExamSubjectId) {
      setMarkEntries(
        existingMarks.map((m) => ({
          student_id: m.student_public_id,
          student_name: m.student_name,
          admission_number: m.student_admission_number,
          marks_obtained: String(m.marks_obtained),
          is_absent: m.is_absent,
          remarks: m.remarks,
          existing_mark: m,
        }))
      );
    } else if (selectedExamSubjectId && !marksLoading) {
      // No existing marks — show empty state
      setMarkEntries([]);
    }
  }, [existingMarks, selectedExamSubjectId, marksLoading]);

  // Reset downstream selections when parent changes
  useEffect(() => {
    setSelectedExamId('');
    setSelectedExamSubjectId('');
    setMarkEntries([]);
  }, [selectedSessionId]);

  useEffect(() => {
    setSelectedExamSubjectId('');
    setMarkEntries([]);
  }, [selectedExamId]);

  const bulkCreateMutation = useBulkCreateMarks({
    onSuccess: () => {
      toast.success(SuccessMessages.MARK.BULK_CREATE_SUCCESS);
    },
  });

  const updateMarkMutation = useUpdateMark();

  const handleMarkChange = (index: number, field: keyof StudentMarkEntry, value: string | boolean) => {
    setMarkEntries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveAll = () => {
    if (!selectedExamSubjectId) return;

    // Filter entries that have new data (no existing mark) for bulk create
    const newEntries = markEntries.filter((e) => !e.existing_mark && e.marks_obtained);
    if (newEntries.length > 0) {
      const marks: BulkMarkEntry[] = newEntries.map((e) => ({
        student_id: e.student_id,
        marks_obtained: Number(e.marks_obtained),
        is_absent: e.is_absent,
        remarks: e.remarks,
      }));
      bulkCreateMutation.mutate({ exam_subject_id: selectedExamSubjectId, marks });
    }

    // Update existing marks that changed
    markEntries
      .filter((e) => e.existing_mark)
      .forEach((e) => {
        const orig = e.existing_mark!;
        const changed =
          Number(e.marks_obtained) !== orig.marks_obtained ||
          e.is_absent !== orig.is_absent ||
          e.remarks !== orig.remarks;
        if (changed) {
          updateMarkMutation.mutate({
            id: orig.public_id,
            data: {
              marks_obtained: Number(e.marks_obtained),
              is_absent: e.is_absent,
              remarks: e.remarks,
            },
          });
        }
      });
  };

  const isPending = bulkCreateMutation.isPending || updateMarkMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader title="Enter Marks">
        <Button variant="outline" onClick={() => navigate(ROUTES.EXAMS)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Exams
        </Button>
      </PageHeader>

      {/* Selection Filters */}
      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-muted/30 px-6 py-4">
          <CardTitle className="text-lg">Select Exam & Subject</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Session */}
            <div className="space-y-2">
              <Label>Exam Session</Label>
              <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select session..." />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem key={s.public_id} value={s.public_id}>
                      {s.name} ({s.academic_year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exam */}
            <div className="space-y-2">
              <Label>Exam</Label>
              <Select
                value={selectedExamId}
                onValueChange={setSelectedExamId}
                disabled={!selectedSessionId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exam..." />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((e) => (
                    <SelectItem key={e.public_id} value={e.public_id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exam Subject */}
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select
                value={selectedExamSubjectId}
                onValueChange={setSelectedExamSubjectId}
                disabled={!selectedExamId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject..." />
                </SelectTrigger>
                <SelectContent>
                  {examSubjects.map((es) => (
                    <SelectItem key={es.public_id} value={es.public_id}>
                      {es.subject_name} ({es.class_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Info bar for selected subject */}
          {selectedExamSubject && (
            <div className="mt-4 flex items-center gap-4 rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-700">Max Marks:</span>
                <Badge variant="outline" className="font-mono">
                  {selectedExamSubject.max_marks}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-700">Passing Marks:</span>
                <Badge variant="outline" className="font-mono">
                  {selectedExamSubject.passing_marks}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-700">Entries:</span>
                <Badge variant="secondary">{markEntries.length}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Marks Table */}
      {selectedExamSubjectId && (
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-6 py-4">
            <CardTitle className="text-lg">Student Marks</CardTitle>
            <Button onClick={handleSaveAll} disabled={isPending || markEntries.length === 0} className="gap-2">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save All Marks
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {marksLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : markEntries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-sm font-medium text-gray-600">
                      <th className="px-4 py-3 w-12">#</th>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Admission No.</th>
                      <th className="px-4 py-3 w-32">Marks</th>
                      <th className="px-4 py-3 w-20 text-center">Absent</th>
                      <th className="px-4 py-3 w-20 text-center">Status</th>
                      <th className="px-4 py-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {markEntries.map((entry, index) => {
                      const marks = Number(entry.marks_obtained) || 0;
                      const passing = selectedExamSubject?.passing_marks || 0;
                      const isPass = !entry.is_absent && marks >= passing;
                      return (
                        <tr key={entry.student_id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-900">{entry.student_name}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm text-gray-600">
                              {entry.admission_number || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="0"
                              max={selectedExamSubject?.max_marks || 999}
                              step="0.5"
                              value={entry.marks_obtained}
                              onChange={(e) => handleMarkChange(index, 'marks_obtained', e.target.value)}
                              disabled={entry.is_absent}
                              className="h-9 w-28 font-mono"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Checkbox
                              checked={entry.is_absent}
                              onCheckedChange={(checked) =>
                                handleMarkChange(index, 'is_absent', !!checked)
                              }
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            {entry.is_absent ? (
                              <Badge variant="outline" className="bg-gray-50 text-gray-500">
                                Absent
                              </Badge>
                            ) : entry.marks_obtained ? (
                              isPass ? (
                                <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" />
                              ) : (
                                <XCircle className="mx-auto h-5 w-5 text-red-400" />
                              )
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              placeholder="Optional"
                              value={entry.remarks}
                              onChange={(e) => handleMarkChange(index, 'remarks', e.target.value)}
                              className="h-9"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <GraduationCap className="mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">
                  No marks entries found for this exam subject. Student marks will appear here once
                  they are recorded.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No subject selected */}
      {!selectedExamSubjectId && (
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <GraduationCap className="mb-4 h-12 w-12 text-gray-300" />
              <h4 className="text-lg font-medium text-gray-700">Select Subject to Enter Marks</h4>
              <p className="mt-1 max-w-md text-sm text-gray-500">
                Choose an exam session, exam, and subject above to view and enter student marks.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MarksEntryPage;
