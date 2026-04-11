/**
 * Exam Session Form Page
 * Create / Edit / View exam session
 * Solid, grounded form layout with proper structure
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/common';
import { ROUTES } from '@/constants';
import { useExamSession } from '../hooks/use-exams';
import { useCreateExamSession, useUpdateExamSession } from '../hooks/mutations';
import { EXAM_SESSION_TYPE_OPTIONS } from '../types';
import type { ExamSessionType, ExamSessionCreatePayload, ExamSessionUpdatePayload } from '../types';

export function ExamSessionFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isEdit = location.pathname.includes('/edit');
  const isView = !!id && !isEdit;
  const isCreate = !id;

  const { data: existingSession, isLoading: isLoadingSession } = useExamSession(id);

  // Form state
  const [name, setName] = useState('');
  const [sessionType, setSessionType] = useState<ExamSessionType>('unit_test');
  const [academicYear, setAcademicYear] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (existingSession) {
      setName(existingSession.name);
      setSessionType(existingSession.session_type);
      setAcademicYear(existingSession.academic_year);
      setDescription(existingSession.description || '');
      setStartDate(existingSession.start_date || '');
      setEndDate(existingSession.end_date || '');
    }
  }, [existingSession]);

  const createMutation = useCreateExamSession({
    onSuccess: () => navigate(ROUTES.EXAMS),
    onError: (_err, errors) => {
      if (errors) setFieldErrors(errors as Record<string, string>);
    },
  });

  const updateMutation = useUpdateExamSession({
    onSuccess: () => navigate(ROUTES.EXAMS),
    onError: (_err, errors) => {
      if (errors) setFieldErrors(errors as Record<string, string>);
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // Basic client-side validation
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Session name is required.';
    if (!academicYear.trim()) errors.academic_year = 'Academic year is required.';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (isCreate) {
      const payload: ExamSessionCreatePayload = {
        name: name.trim(),
        session_type: sessionType,
        academic_year: academicYear.trim(),
        description: description.trim(),
        start_date: startDate || null,
        end_date: endDate || null,
      };
      createMutation.mutate(payload);
    } else if (isEdit && id) {
      const payload: ExamSessionUpdatePayload = {
        name: name.trim(),
        session_type: sessionType,
        academic_year: academicYear.trim(),
        description: description.trim(),
        start_date: startDate || null,
        end_date: endDate || null,
      };
      updateMutation.mutate({ id, data: payload });
    }
  };

  const title = isCreate ? 'Create Exam Session' : isEdit ? 'Edit Exam Session' : 'View Exam Session';

  if (id && isLoadingSession) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={title}>
        <Button variant="outline" onClick={() => navigate(ROUTES.EXAMS)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Exams
        </Button>
      </PageHeader>

      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-muted/30 px-6 py-4">
          <CardTitle className="text-lg">Session Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Session Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Unit Test 1, Half Yearly"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isView}
                  className={fieldErrors.name ? 'border-red-500' : ''}
                />
                {fieldErrors.name && (
                  <p className="text-sm text-red-500">{fieldErrors.name}</p>
                )}
              </div>

              {/* Session Type */}
              <div className="space-y-2">
                <Label htmlFor="session_type">
                  Session Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={sessionType}
                  onValueChange={(v) => setSessionType(v as ExamSessionType)}
                  disabled={isView}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_SESSION_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Academic Year */}
              <div className="space-y-2">
                <Label htmlFor="academic_year">
                  Academic Year <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="academic_year"
                  placeholder="e.g., 2025-26"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  disabled={isView}
                  className={fieldErrors.academic_year ? 'border-red-500' : ''}
                />
                {fieldErrors.academic_year && (
                  <p className="text-sm text-red-500">{fieldErrors.academic_year}</p>
                )}
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isView}
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isView}
                  className={fieldErrors.end_date ? 'border-red-500' : ''}
                />
                {fieldErrors.end_date && (
                  <p className="text-sm text-red-500">{fieldErrors.end_date}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description for this exam session..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isView}
                rows={3}
              />
            </div>

            {/* Actions */}
            {!isView && (
              <div className="flex items-center gap-3 border-t pt-6">
                <Button type="submit" disabled={isPending} className="gap-2">
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isCreate ? 'Create Session' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(ROUTES.EXAMS)}
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* View mode: Edit button */}
            {isView && (
              <div className="flex items-center gap-3 border-t pt-6">
                <Button
                  type="button"
                  onClick={() => navigate(ROUTES.EXAM_SESSIONS_EDIT.replace(':id', id!))}
                  className="gap-2"
                >
                  Edit Session
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(ROUTES.EXAMS)}
                >
                  Back
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ExamSessionFormPage;
