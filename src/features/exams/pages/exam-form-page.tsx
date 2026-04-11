/**
 * Exam Form Page
 * Create / Edit / View an exam with class multi-select
 * Solid, grounded UI
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/common';
import { ROUTES } from '@/constants';
import { useExam, useExamSessions } from '../hooks/use-exams';
import { useCreateExam, useUpdateExam } from '../hooks/mutations';
import { useClasses } from '@/features/classes/hooks/use-classes';
import { EXAM_STATUS_OPTIONS } from '../types';
import type { ExamStatus, ExamCreatePayload, ExamUpdatePayload } from '../types';

export function ExamFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isEdit = location.pathname.includes('/edit');
  const isView = !!id && !isEdit;
  const isCreate = !id;

  const { data: existingExam, isLoading: isLoadingExam } = useExam(id);
  const { data: sessionsData } = useExamSessions({ page: 1, page_size: 100 });
  const { data: classesData } = useClasses({ page: 1, page_size: 100 });

  const sessionsList = sessionsData?.data || [];
  const classesList = classesData?.data || [];

  // Form state
  const [sessionId, setSessionId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ExamStatus>('draft');
  const [examDate, setExamDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (existingExam) {
      setSessionId(existingExam.session_public_id);
      setName(existingExam.name);
      setDescription(existingExam.description || '');
      setStatus(existingExam.status);
      setExamDate(existingExam.date || '');
      setStartTime(existingExam.start_time?.slice(0, 5) || '');
      setEndTime(existingExam.end_time?.slice(0, 5) || '');
      setSelectedClassIds(existingExam.classes_info.map((c) => c.public_id));
    }
  }, [existingExam]);

  const createMutation = useCreateExam({
    onSuccess: () => navigate(ROUTES.EXAMS),
    onError: (_err, errors) => {
      if (errors) setFieldErrors(errors as Record<string, string>);
    },
  });

  const updateMutation = useUpdateExam({
    onSuccess: () => navigate(ROUTES.EXAMS),
    onError: (_err, errors) => {
      if (errors) setFieldErrors(errors as Record<string, string>);
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleAddClass = (classId: string) => {
    if (!selectedClassIds.includes(classId)) {
      setSelectedClassIds([...selectedClassIds, classId]);
    }
  };

  const handleRemoveClass = (classId: string) => {
    setSelectedClassIds(selectedClassIds.filter((id) => id !== classId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Exam name is required.';
    if (!sessionId) errors.session_id = 'Please select an exam session.';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (isCreate) {
      const payload: ExamCreatePayload = {
        session_id: sessionId,
        name: name.trim(),
        description: description.trim(),
        status,
        date: examDate || null,
        start_time: startTime || null,
        end_time: endTime || null,
        class_ids: selectedClassIds,
      };
      createMutation.mutate(payload);
    } else if (isEdit && id) {
      const payload: ExamUpdatePayload = {
        name: name.trim(),
        description: description.trim(),
        status,
        date: examDate || null,
        start_time: startTime || null,
        end_time: endTime || null,
        class_ids: selectedClassIds,
      };
      updateMutation.mutate({ id, data: payload });
    }
  };

  const title = isCreate ? 'Create Exam' : isEdit ? 'Edit Exam' : 'View Exam';

  if (id && isLoadingExam) {
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-muted/30 px-6 py-4">
            <CardTitle className="text-lg">Exam Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Session */}
              <div className="space-y-2">
                <Label>
                  Exam Session <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={sessionId}
                  onValueChange={setSessionId}
                  disabled={isView || isEdit}
                >
                  <SelectTrigger className={fieldErrors.session_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionsList.map((s) => (
                      <SelectItem key={s.public_id} value={s.public_id}>
                        {s.name} ({s.academic_year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.session_id && (
                  <p className="text-sm text-red-500">{fieldErrors.session_id}</p>
                )}
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="exam_name">
                  Exam Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="exam_name"
                  placeholder="e.g., Mathematics Unit Test 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isView}
                  className={fieldErrors.name ? 'border-red-500' : ''}
                />
                {fieldErrors.name && (
                  <p className="text-sm text-red-500">{fieldErrors.name}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ExamStatus)} disabled={isView}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="exam_date">Exam Date</Label>
                <Input
                  id="exam_date"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  disabled={isView}
                />
              </div>

              {/* Start Time */}
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={isView}
                />
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={isView}
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 space-y-2">
              <Label htmlFor="exam_description">Description</Label>
              <Textarea
                id="exam_description"
                placeholder="Optional description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isView}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Class Selection */}
        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-muted/30 px-6 py-4">
            <CardTitle className="text-lg">Applicable Classes</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!isView && (
              <div className="mb-4 space-y-2">
                <Label>Add Class</Label>
                <Select onValueChange={handleAddClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class to add..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classesList
                      .filter((c) => !selectedClassIds.includes(c.public_id))
                      .map((c) => (
                        <SelectItem key={c.public_id} value={c.public_id}>
                          {c.class_master?.name || 'Class'} - {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedClassIds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedClassIds.map((classId) => {
                  const cls = classesList.find((c) => c.public_id === classId);
                  const label = cls
                    ? `${cls.class_master?.name || 'Class'} - ${cls.name}`
                    : classId;
                  return (
                    <Badge
                      key={classId}
                      variant="secondary"
                      className="gap-1 px-3 py-1.5 text-sm"
                    >
                      {label}
                      {!isView && (
                        <button
                          type="button"
                          onClick={() => handleRemoveClass(classId)}
                          className="ml-1 rounded-full p-0.5 hover:bg-gray-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No classes selected yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {!isView && (
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isCreate ? 'Create Exam' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.EXAMS)}>
              Cancel
            </Button>
          </div>
        )}

        {isView && (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => navigate(ROUTES.EXAMS_EDIT.replace(':id', id!))}
              className="gap-2"
            >
              Edit Exam
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.EXAMS)}>
              Back
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

export default ExamFormPage;
