/**
 * Timetable Setup Page — Admin only
 *
 * Step-based management with visual guide:
 *   1. Class Groups — create groups and map classes
 *   2. Time Slots — define period structure per group (multi-day)
 *   3. View Timetable — see the grid and assign entries
 */

import { useState } from 'react';
import {
  Users,
  Clock,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Lightbulb,
  ShieldAlert,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClassGroupsTab } from '../components/class-groups-tab';
import { TimeSlotsTab } from '../components/time-slots-tab';
import { TimetableViewTab } from '../components/timetable-view-tab';

// ── Step Config ──────────────────────────────────────────────

const STEPS = [
  {
    id: 'groups',
    label: 'Class Groups',
    icon: Users,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    ringColor: 'ring-emerald-400',
    description: 'Group classes that share the same schedule',
  },
  {
    id: 'slots',
    label: 'Time Slots',
    icon: Clock,
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    ringColor: 'ring-indigo-400',
    description: 'Define periods, breaks & timings',
  },
  {
    id: 'view',
    label: 'View Timetable',
    icon: Calendar,
    color: 'from-violet-500 to-pink-500',
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-700',
    borderColor: 'border-violet-200',
    ringColor: 'ring-violet-400',
    description: 'Preview & assign teachers/subjects',
  },
] as const;

// ── How It Works Guide ──────────────────────────────────────

function HowItWorksGuide() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 text-left"
      >
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <span className="text-sm font-semibold text-amber-900">How Timetable Setup Works</span>
        <ChevronRight
          className={`ml-auto h-4 w-4 text-amber-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
        />
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 pl-7">
          {/* Step 1 */}
          <div className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
              1
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Create Class Groups</p>
              <p className="text-xs text-slate-500">
                Group classes that share the same period structure. E.g., &quot;Primary&quot;
                (1st–5th), &quot;Senior&quot; (9th–10th). Classes in the same group have the same
                timings.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
              2
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Define Time Slots</p>
              <p className="text-xs text-slate-500">
                For each group, set up periods, breaks, and assemblies. You can apply the same slot
                structure to <strong>multiple days at once</strong> (e.g., Mon–Fri).
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
              3
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Assign Teachers & Subjects</p>
              <p className="text-xs text-slate-500">
                In the View Timetable tab, select a class and assign teachers/subjects to each
                period. Each class gets its own assignments even within the same group.
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="mt-2 flex gap-2 rounded-xl bg-red-50 px-3 py-2.5">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <div>
              <p className="text-xs font-semibold text-red-700">Teacher Conflict Prevention</p>
              <p className="text-[11px] text-red-600">
                The system automatically prevents assigning the same teacher to two classes at the
                same time. If a conflict is detected, the assignment will be rejected.
              </p>
            </div>
          </div>

          {/* Warning 2 */}
          <div className="flex gap-2 rounded-xl bg-amber-50/80 px-3 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div>
              <p className="text-xs font-semibold text-amber-700">Important Notes</p>
              <ul className="mt-0.5 list-inside list-disc text-[11px] text-amber-600">
                <li>
                  Each class can only belong to <strong>one</strong> group
                </li>
                <li>Changing slots will remove existing entries for affected days</li>
                <li>Breaks and assemblies cannot have teacher/subject assignments</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────

export default function TimetableSetupPage() {
  const [activeTab, setActiveTab] = useState('groups');

  const activeStep = STEPS.find((s) => s.id === activeTab) ?? STEPS[0];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            Timetable Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Set up class groups, define time slots, and manage your school timetable
          </p>
        </div>
      </div>

      {/* Guide */}
      <HowItWorksGuide />

      {/* Step indicator */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {STEPS.map((step, idx) => {
          const isActive = step.id === activeTab;
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex items-center gap-3">
              {idx > 0 && <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />}
              <button
                type="button"
                onClick={() => setActiveTab(step.id)}
                className={`flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? `${step.bgColor} ${step.textColor} ring-2 ${step.ringColor} shadow-sm`
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    isActive
                      ? `bg-gradient-to-br ${step.color} text-white shadow-sm`
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="hidden text-left sm:block">
                  <div className="text-xs leading-none font-bold">{step.label}</div>
                  <div className="mt-0.5 text-[10px] font-normal opacity-70">
                    {step.description}
                  </div>
                </div>
                <span className="sm:hidden">{step.label}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Tab Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-0">
        <TabsList className="sr-only">
          {STEPS.map((step) => (
            <TabsTrigger key={step.id} value={step.id}>
              {step.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div
          className={`rounded-2xl border-2 p-6 transition-colors sm:p-8 ${activeStep.borderColor} ${activeStep.bgColor}/30`}
        >
          <TabsContent value="groups" className="mt-0">
            <ClassGroupsTab />
          </TabsContent>

          <TabsContent value="slots" className="mt-0">
            <TimeSlotsTab />
          </TabsContent>

          <TabsContent value="view" className="mt-0">
            <TimetableViewTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
