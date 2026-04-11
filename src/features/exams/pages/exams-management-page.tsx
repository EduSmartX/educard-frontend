/**
 * Exams Management Page
 * Main page with tabs: Exam Sessions, Exams, Marks Entry
 * Solid, grounded UI with clear structure
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ClipboardList, FileText, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { PageHeader, DeletedViewToggle, DeleteConfirmationDialog, ReactivateConfirmationDialog } from '@/components/common';
import { ROUTES } from '@/constants';
import { useExamSessions, useExams } from '../hooks/use-exams';
import { useDeleteExamSession, useReactivateExamSession, useDeleteExam, useReactivateExam } from '../hooks/mutations';
import { createExamSessionColumns } from '../components/exam-session-columns';
import { createExamColumns } from '../components/exam-columns';
import { useDeletedView } from '@/hooks/use-deleted-view';
import type { ExamSession, Exam } from '../types';

export function ExamsManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sessions');

  // ── Exam Sessions state ────────────────────────────────
  const [sessionPage, setSessionPage] = useState(1);
  const [sessionPageSize, setSessionPageSize] = useState(10);
  const [sessionSearch, setSessionSearch] = useState('');
  const [sessionToDelete, setSessionToDelete] = useState<ExamSession | undefined>();
  const [sessionToReactivate, setSessionToReactivate] = useState<ExamSession | undefined>();

  const { showDeleted: showDeletedSessions, toggleDeletedView: toggleDeletedSessions } = useDeletedView({
    onPageChange: setSessionPage,
  });

  const { data: sessionsData, isLoading: sessionsLoading } = useExamSessions({
    page: sessionPage,
    page_size: sessionPageSize,
    search: sessionSearch,
    is_deleted: showDeletedSessions,
  });

  const sessions = sessionsData?.data || [];
  const sessionsPagination = sessionsData?.pagination;

  // ── Exams state ────────────────────────────────────────
  const [examPage, setExamPage] = useState(1);
  const [examPageSize, setExamPageSize] = useState(10);
  const [examSearch, setExamSearch] = useState('');
  const [examToDelete, setExamToDelete] = useState<Exam | undefined>();
  const [examToReactivate, setExamToReactivate] = useState<Exam | undefined>();

  const { showDeleted: showDeletedExams, toggleDeletedView: toggleDeletedExams } = useDeletedView({
    onPageChange: setExamPage,
  });

  const { data: examsData, isLoading: examsLoading } = useExams({
    page: examPage,
    page_size: examPageSize,
    search: examSearch,
    is_deleted: showDeletedExams,
  });

  const exams = examsData?.data || [];
  const examsPagination = examsData?.pagination;

  // ── Mutations ──────────────────────────────────────────
  const deleteSessionMutation = useDeleteExamSession({
    onSuccess: () => setSessionToDelete(undefined),
  });
  const reactivateSessionMutation = useReactivateExamSession({
    onSuccess: () => setSessionToReactivate(undefined),
  });
  const deleteExamMutation = useDeleteExam({
    onSuccess: () => setExamToDelete(undefined),
  });
  const reactivateExamMutation = useReactivateExam({
    onSuccess: () => setExamToReactivate(undefined),
  });

  // ── Column configurations ──────────────────────────────
  const sessionColumns = useMemo(
    () =>
      createExamSessionColumns({
        onView: (s) => navigate(ROUTES.EXAM_SESSIONS_VIEW.replace(':id', s.public_id)),
        onEdit: (s) => navigate(ROUTES.EXAM_SESSIONS_EDIT.replace(':id', s.public_id)),
        onDelete: (s) => {
          if (showDeletedSessions) setSessionToReactivate(s);
          else setSessionToDelete(s);
        },
        isDeletedView: showDeletedSessions,
      }),
    [navigate, showDeletedSessions]
  );

  const examColumns = useMemo(
    () =>
      createExamColumns({
        onView: (e) => navigate(ROUTES.EXAMS_VIEW.replace(':id', e.public_id)),
        onEdit: (e) => navigate(ROUTES.EXAMS_EDIT.replace(':id', e.public_id)),
        onDelete: (e) => {
          if (showDeletedExams) setExamToReactivate(e);
          else setExamToDelete(e);
        },
        isDeletedView: showDeletedExams,
      }),
    [navigate, showDeletedExams]
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Exams & Marks">
        <Button onClick={() => navigate(ROUTES.EXAM_SESSIONS_NEW)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Session
        </Button>
        <Button variant="outline" onClick={() => navigate(ROUTES.EXAMS_NEW)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Exam
        </Button>
        <Button variant="outline" onClick={() => navigate(ROUTES.MARKS_ENTRY)} className="gap-2">
          <GraduationCap className="h-4 w-4" />
          Enter Marks
        </Button>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 border bg-muted/40">
          <TabsTrigger value="sessions" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Exam Sessions
          </TabsTrigger>
          <TabsTrigger value="exams" className="gap-2">
            <FileText className="h-4 w-4" />
            Exams
          </TabsTrigger>
          <TabsTrigger value="marks" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Marks Overview
          </TabsTrigger>
        </TabsList>

        {/* ── Exam Sessions Tab ─────────────────────────── */}
        <TabsContent value="sessions" className="mt-4 space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Exam Sessions</h3>
                <p className="text-sm text-gray-500">
                  Manage exam terms like Unit Tests, Quarterly, Half Yearly, Annual exams
                </p>
              </div>
              <div className="flex items-center gap-3">
                <DeletedViewToggle showDeleted={showDeletedSessions} onToggle={toggleDeletedSessions} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                columns={sessionColumns}
                data={sessions}
                isLoading={sessionsLoading}
                pagination={sessionsPagination}
                onPageChange={setSessionPage}
                onPageSizeChange={(size) => {
                  setSessionPageSize(size);
                  setSessionPage(1);
                }}
                emptyMessage={
                  showDeletedSessions
                    ? 'No deleted exam sessions found.'
                    : 'No exam sessions yet. Create your first exam session to get started.'
                }
                emptyAction={
                  !showDeletedSessions && sessions.length === 0
                    ? { label: 'Create Exam Session', onClick: () => navigate(ROUTES.EXAM_SESSIONS_NEW) }
                    : undefined
                }
                getRowKey={(row: ExamSession) => row.public_id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Exams Tab ─────────────────────────────────── */}
        <TabsContent value="exams" className="mt-4 space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Exams</h3>
                <p className="text-sm text-gray-500">
                  Individual exams within sessions, each applicable to multiple classes
                </p>
              </div>
              <div className="flex items-center gap-3">
                <DeletedViewToggle showDeleted={showDeletedExams} onToggle={toggleDeletedExams} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                columns={examColumns}
                data={exams}
                isLoading={examsLoading}
                pagination={examsPagination}
                onPageChange={setExamPage}
                onPageSizeChange={(size) => {
                  setExamPageSize(size);
                  setExamPage(1);
                }}
                emptyMessage={
                  showDeletedExams
                    ? 'No deleted exams found.'
                    : 'No exams yet. Create an exam within an exam session.'
                }
                emptyAction={
                  !showDeletedExams && exams.length === 0
                    ? { label: 'Create Exam', onClick: () => navigate(ROUTES.EXAMS_NEW) }
                    : undefined
                }
                getRowKey={(row: Exam) => row.public_id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Marks Overview Tab ────────────────────────── */}
        <TabsContent value="marks" className="mt-4 space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="border-b bg-muted/30 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Marks Overview</h3>
                  <p className="text-sm text-gray-500">
                    Enter and review student marks for each exam subject
                  </p>
                </div>
                <Button onClick={() => navigate(ROUTES.MARKS_ENTRY)} className="gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Enter Marks
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <GraduationCap className="mb-4 h-12 w-12 text-gray-300" />
                <h4 className="text-lg font-medium text-gray-700">Marks Entry</h4>
                <p className="mt-1 max-w-md text-sm text-gray-500">
                  Select an exam and subject to enter marks for students. You can enter marks
                  individually or in bulk for an entire class.
                </p>
                <Button
                  onClick={() => navigate(ROUTES.MARKS_ENTRY)}
                  className="mt-4 gap-2"
                  variant="outline"
                >
                  <GraduationCap className="h-4 w-4" />
                  Go to Marks Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Session Dialogs ──────────────────────────────── */}
      {!showDeletedSessions && (
        <DeleteConfirmationDialog
          open={!!sessionToDelete}
          onOpenChange={(open) => !open && setSessionToDelete(undefined)}
          onConfirm={() => sessionToDelete && deleteSessionMutation.mutate(sessionToDelete.public_id)}
          title="Delete Exam Session"
          itemName={sessionToDelete?.name}
          isSoftDelete={true}
          isDeleting={deleteSessionMutation.isPending}
        />
      )}
      {showDeletedSessions && (
        <ReactivateConfirmationDialog
          open={!!sessionToReactivate}
          onOpenChange={(open) => !open && setSessionToReactivate(undefined)}
          onConfirm={() => sessionToReactivate && reactivateSessionMutation.mutate(sessionToReactivate.public_id)}
          title="Restore Exam Session"
          itemName={sessionToReactivate?.name}
          isReactivating={reactivateSessionMutation.isPending}
        />
      )}

      {/* ── Exam Dialogs ─────────────────────────────────── */}
      {!showDeletedExams && (
        <DeleteConfirmationDialog
          open={!!examToDelete}
          onOpenChange={(open) => !open && setExamToDelete(undefined)}
          onConfirm={() => examToDelete && deleteExamMutation.mutate(examToDelete.public_id)}
          title="Delete Exam"
          itemName={examToDelete?.name}
          isSoftDelete={true}
          isDeleting={deleteExamMutation.isPending}
        />
      )}
      {showDeletedExams && (
        <ReactivateConfirmationDialog
          open={!!examToReactivate}
          onOpenChange={(open) => !open && setExamToReactivate(undefined)}
          onConfirm={() => examToReactivate && reactivateExamMutation.mutate(examToReactivate.public_id)}
          title="Restore Exam"
          itemName={examToReactivate?.name}
          isReactivating={reactivateExamMutation.isPending}
        />
      )}
    </div>
  );
}

export default ExamsManagement;
