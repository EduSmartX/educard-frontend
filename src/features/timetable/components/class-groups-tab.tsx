/**
 * Class Groups Tab — Colorful card-based CRUD
 * Create/edit class groups and map classes to them
 */

import { useState } from 'react';
import { Plus, Trash2, X, Users, Pencil, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClassGroups } from '../hooks/queries';
import {
  useCreateClassGroup,
  useUpdateClassGroup,
  useDeleteClassGroup,
  useAddClassToGroup,
  useRemoveClassFromGroup,
} from '../hooks/mutations';
import { useClasses } from '@/features/classes/hooks/use-classes';
import type { ClassGroup, ClassGroupMapping } from '../types';

// ── Group colors (rotate through) ──────────────────────────

const GROUP_COLORS = [
  {
    bg: 'from-emerald-500 to-teal-500',
    light: 'bg-emerald-50',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  {
    bg: 'from-blue-500 to-indigo-500',
    light: 'bg-blue-50',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    bg: 'from-violet-500 to-purple-500',
    light: 'bg-violet-50',
    text: 'text-violet-700',
    badge: 'bg-violet-100 text-violet-700 border-violet-200',
  },
  {
    bg: 'from-amber-500 to-orange-500',
    light: 'bg-amber-50',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  {
    bg: 'from-rose-500 to-pink-500',
    light: 'bg-rose-50',
    text: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
  },
  {
    bg: 'from-cyan-500 to-sky-500',
    light: 'bg-cyan-50',
    text: 'text-cyan-700',
    badge: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  },
];

// ── Create/Edit Group Dialog ────────────────────────────────

function GroupFormDialog({
  open,
  onOpenChange,
  editGroup,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editGroup?: ClassGroup | null;
}) {
  const [name, setName] = useState(editGroup?.name ?? '');
  const [description, setDescription] = useState(editGroup?.description ?? '');
  const [displayOrder, setDisplayOrder] = useState(editGroup?.display_order ?? 0);

  const createMutation = useCreateClassGroup();
  const updateMutation = useUpdateClassGroup();
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    const data = { name, description, display_order: displayOrder };
    if (editGroup) {
      updateMutation.mutate(
        { publicId: editGroup.public_id, data },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
              <Users className="h-4 w-4" />
            </div>
            {editGroup ? 'Edit' : 'Create'} Class Group
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="group-name" className="text-sm font-medium">
              Group Name
            </Label>
            <Input
              id="group-name"
              placeholder="e.g., Pre-Primary, Primary, Senior"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="group-desc" className="text-sm font-medium">
              Description <span className="text-slate-400">(optional)</span>
            </Label>
            <Input
              id="group-desc"
              placeholder="e.g., Classes that end at 3 PM"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="group-order" className="text-sm font-medium">
              Display Order
            </Label>
            <Input
              id="group-order"
              type="number"
              min={0}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className="mt-1 w-24"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || isLoading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? 'Saving...' : editGroup ? 'Update' : 'Create Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Class to Group Dialog ───────────────────────────────

function AddClassDialog({
  open,
  onOpenChange,
  groupPublicId,
  existingClassIds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupPublicId: string;
  existingClassIds: Set<string>;
}) {
  const [selectedClassId, setSelectedClassId] = useState('');
  const { data: classesData, isLoading: classesLoading } = useClasses({
    page_size: 200,
    is_deleted: false,
  });
  const addMutation = useAddClassToGroup();

  const availableClasses = (classesData?.data ?? []).filter(
    (cls) => !existingClassIds.has(cls.public_id)
  );

  const handleAdd = () => {
    if (!selectedClassId) {
      return;
    }
    addMutation.mutate(
      { groupPublicId, classPublicId: selectedClassId },
      {
        onSuccess: () => {
          setSelectedClassId('');
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-500" />
            Add Class to Group
          </DialogTitle>
        </DialogHeader>
        <div className="py-2">
          {classesLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : availableClasses.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-4 py-6 text-center">
              <p className="text-sm font-medium text-slate-500">
                All classes are already assigned to a group.
              </p>
            </div>
          ) : (
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {availableClasses.map((cls) => (
                  <SelectItem key={cls.public_id} value={cls.public_id}>
                    {cls.class_master?.name} - {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!selectedClassId || addMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {addMutation.isPending ? 'Adding...' : 'Add Class'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Single Group Card ───────────────────────────────────────

function GroupCard({
  group,
  colorIdx,
  onEdit,
}: {
  group: ClassGroup;
  colorIdx: number;
  onEdit: (group: ClassGroup) => void;
}) {
  const [showAddClass, setShowAddClass] = useState(false);
  const deleteMutation = useDeleteClassGroup();
  const removeMutation = useRemoveClassFromGroup();
  const colors = GROUP_COLORS[colorIdx % GROUP_COLORS.length];

  const existingClassIds = new Set(
    (group.classes ?? []).map((c: ClassGroupMapping) => c.class_public_id)
  );

  const handleRemoveClass = (classPublicId: string) => {
    removeMutation.mutate({
      groupPublicId: group.public_id,
      classPublicId,
    });
  };

  return (
    <>
      <Card className="group overflow-hidden rounded-2xl border-0 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg">
        {/* Colored header */}
        <div className={`bg-gradient-to-r ${colors.bg} px-5 py-4`}>
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-bold text-white">{group.name}</h3>
              {group.description && (
                <p className="mt-0.5 truncate text-xs text-white/75">{group.description}</p>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 rounded-lg p-0 text-white/80 hover:bg-white/20 hover:text-white"
                onClick={() => onEdit(group)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 rounded-lg p-0 text-white/80 hover:bg-red-500/30 hover:text-white"
                onClick={() => deleteMutation.mutate(group.public_id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Badge className="border-0 bg-white/20 text-xs text-white">
              {group.class_count} {group.class_count === 1 ? 'class' : 'classes'}
            </Badge>
            <Badge className="border-0 bg-white/20 text-xs text-white">
              Order: {group.display_order}
            </Badge>
          </div>
        </div>

        {/* Class list */}
        <CardContent className="p-5">
          <p className="mb-2.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Assigned Classes
          </p>
          <div className="mb-4 flex min-h-[40px] flex-wrap gap-2">
            {(group.classes ?? []).length === 0 ? (
              <p className="py-1 text-xs text-slate-400 italic">No classes assigned yet</p>
            ) : (
              (group.classes ?? []).map((mapping: ClassGroupMapping) => (
                <Badge
                  key={mapping.public_id}
                  variant="outline"
                  className={`gap-1.5 rounded-lg border px-2.5 py-1.5 whitespace-nowrap ${colors.badge}`}
                >
                  <GraduationCap className="h-3 w-3 shrink-0" />
                  {mapping.class_name}
                  <button
                    className="ml-0.5 shrink-0 rounded-full p-0.5 hover:bg-black/10"
                    onClick={() => handleRemoveClass(mapping.class_public_id)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-9 rounded-lg border-dashed text-xs font-medium"
            onClick={() => setShowAddClass(true)}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Class
          </Button>
        </CardContent>
      </Card>

      <AddClassDialog
        open={showAddClass}
        onOpenChange={setShowAddClass}
        groupPublicId={group.public_id}
        existingClassIds={existingClassIds}
      />
    </>
  );
}

// ── Main Tab Component ──────────────────────────────────────

export function ClassGroupsTab() {
  const { data: groups, isLoading } = useClassGroups();
  const [showCreate, setShowCreate] = useState(false);
  const [editGroup, setEditGroup] = useState<ClassGroup | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Class Groups</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Group classes that share the same period structure (e.g., same start/end times)
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          size="lg"
          className="bg-emerald-600 shadow-md hover:bg-emerald-700"
        >
          <Plus className="mr-1.5 h-4 w-4" /> New Group
        </Button>
      </div>

      {!groups || groups.length === 0 ? (
        <div className="mx-auto max-w-lg">
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/60 px-8 py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
              <Users className="h-10 w-10" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-slate-800">No Class Groups Yet</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              Create a class group (e.g., &quot;Primary&quot;, &quot;Senior&quot;) and assign
              classes to it. Classes in the same group share the same period timings.
            </p>
            <Button
              size="lg"
              className="mt-6 bg-emerald-600 shadow-md hover:bg-emerald-700"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" /> Create First Group
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {groups.map((group, idx) => (
            <GroupCard
              key={group.public_id}
              group={group}
              colorIdx={idx}
              onEdit={(g) => setEditGroup(g)}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <GroupFormDialog open={showCreate} onOpenChange={(open) => setShowCreate(open)} />

      {/* Edit Dialog */}
      {editGroup && (
        <GroupFormDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setEditGroup(null);
            }
          }}
          editGroup={editGroup}
        />
      )}
    </div>
  );
}
