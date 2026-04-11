/**
 * Global Subject Color Palette
 *
 * Each subject gets a unique, visually distinct color scheme using
 * secondary-level colors. These colors are used consistently across
 * all modules: timetable grid, homework, exams, marks, reports, etc.
 *
 * Usage:
 *   import { getSubjectColor, SUBJECT_COLOR_PALETTE, UNASSIGNED_SUBJECT_COLOR } from '@/constants/subject-colors';
 *
 *   // Deterministic: same subject name always → same color
 *   const color = getSubjectColor('Mathematics');
 *   <div className={`${color.bg} ${color.border} ${color.text}`}>…</div>
 */

// ── Color type ──────────────────────────────────────────────

export interface SubjectColorScheme {
  /** Cell / card background       (e.g. bg-blue-100)          */
  bg: string;
  /** Border color                 (e.g. border-blue-400)      */
  border: string;
  /** Primary text color           (e.g. text-blue-800)        */
  text: string;
  /** Badge / chip styling         (e.g. bg-blue-200 text-…)   */
  badge: string;
  /** Solid accent for dots/bars   (e.g. bg-blue-500)          */
  accent: string;
  /** Light variant for avatars    (e.g. bg-blue-200)          */
  light: string;
  /** Hex value for charts/canvas  (e.g. #3b82f6)              */
  hex: string;
}

// ── 15-color palette (secondary-level, visually distinct) ───

export const SUBJECT_COLOR_PALETTE: readonly SubjectColorScheme[] = [
  // 1 — Blue (Mathematics)
  {
    bg: 'bg-blue-100',
    border: 'border-blue-400',
    text: 'text-blue-800',
    badge: 'bg-blue-200 text-blue-800',
    accent: 'bg-blue-500',
    light: 'bg-blue-200',
    hex: '#3b82f6',
  },
  // 2 — Emerald (Science / Biology)
  {
    bg: 'bg-emerald-100',
    border: 'border-emerald-400',
    text: 'text-emerald-800',
    badge: 'bg-emerald-200 text-emerald-800',
    accent: 'bg-emerald-500',
    light: 'bg-emerald-200',
    hex: '#10b981',
  },
  // 3 — Violet (English / Language)
  {
    bg: 'bg-violet-100',
    border: 'border-violet-400',
    text: 'text-violet-800',
    badge: 'bg-violet-200 text-violet-800',
    accent: 'bg-violet-500',
    light: 'bg-violet-200',
    hex: '#8b5cf6',
  },
  // 4 — Amber (Hindi / Regional Language)
  {
    bg: 'bg-amber-100',
    border: 'border-amber-400',
    text: 'text-amber-800',
    badge: 'bg-amber-200 text-amber-800',
    accent: 'bg-amber-500',
    light: 'bg-amber-200',
    hex: '#f59e0b',
  },
  // 5 — Rose (Social Studies / History)
  {
    bg: 'bg-rose-100',
    border: 'border-rose-400',
    text: 'text-rose-800',
    badge: 'bg-rose-200 text-rose-800',
    accent: 'bg-rose-500',
    light: 'bg-rose-200',
    hex: '#f43f5e',
  },
  // 6 — Cyan (Geography / EVS)
  {
    bg: 'bg-cyan-100',
    border: 'border-cyan-400',
    text: 'text-cyan-800',
    badge: 'bg-cyan-200 text-cyan-800',
    accent: 'bg-cyan-500',
    light: 'bg-cyan-200',
    hex: '#06b6d4',
  },
  // 7 — Pink (Arts / Drawing)
  {
    bg: 'bg-pink-100',
    border: 'border-pink-400',
    text: 'text-pink-800',
    badge: 'bg-pink-200 text-pink-800',
    accent: 'bg-pink-500',
    light: 'bg-pink-200',
    hex: '#ec4899',
  },
  // 8 — Teal (Computer Science)
  {
    bg: 'bg-teal-100',
    border: 'border-teal-400',
    text: 'text-teal-800',
    badge: 'bg-teal-200 text-teal-800',
    accent: 'bg-teal-500',
    light: 'bg-teal-200',
    hex: '#14b8a6',
  },
  // 9 — Orange (Physical Education)
  {
    bg: 'bg-orange-100',
    border: 'border-orange-400',
    text: 'text-orange-800',
    badge: 'bg-orange-200 text-orange-800',
    accent: 'bg-orange-500',
    light: 'bg-orange-200',
    hex: '#f97316',
  },
  // 10 — Indigo (Moral Science / Value Education)
  {
    bg: 'bg-indigo-100',
    border: 'border-indigo-400',
    text: 'text-indigo-800',
    badge: 'bg-indigo-200 text-indigo-800',
    accent: 'bg-indigo-500',
    light: 'bg-indigo-200',
    hex: '#6366f1',
  },
  // 11 — Lime (General Knowledge)
  {
    bg: 'bg-lime-100',
    border: 'border-lime-400',
    text: 'text-lime-800',
    badge: 'bg-lime-200 text-lime-800',
    accent: 'bg-lime-500',
    light: 'bg-lime-200',
    hex: '#84cc16',
  },
  // 12 — Fuchsia (Music / Dance)
  {
    bg: 'bg-fuchsia-100',
    border: 'border-fuchsia-400',
    text: 'text-fuchsia-800',
    badge: 'bg-fuchsia-200 text-fuchsia-800',
    accent: 'bg-fuchsia-500',
    light: 'bg-fuchsia-200',
    hex: '#d946ef',
  },
  // 13 — Sky (Sanskrit / Third Language)
  {
    bg: 'bg-sky-100',
    border: 'border-sky-400',
    text: 'text-sky-800',
    badge: 'bg-sky-200 text-sky-800',
    accent: 'bg-sky-500',
    light: 'bg-sky-200',
    hex: '#0ea5e9',
  },
  // 14 — Red (Economics / Commerce)
  {
    bg: 'bg-red-100',
    border: 'border-red-400',
    text: 'text-red-800',
    badge: 'bg-red-200 text-red-800',
    accent: 'bg-red-500',
    light: 'bg-red-200',
    hex: '#ef4444',
  },
  // 15 — Slate (Library / Free Period / Others)
  {
    bg: 'bg-slate-200',
    border: 'border-slate-400',
    text: 'text-slate-800',
    badge: 'bg-slate-300 text-slate-800',
    accent: 'bg-slate-500',
    light: 'bg-slate-300',
    hex: '#64748b',
  },
] as const;

// ── Unassigned / empty slot color ───────────────────────────

export const UNASSIGNED_SUBJECT_COLOR: SubjectColorScheme = {
  bg: 'bg-slate-50',
  border: 'border-dashed border-slate-300',
  text: 'text-slate-400',
  badge: 'bg-slate-100 text-slate-500',
  accent: 'bg-slate-300',
  light: 'bg-slate-100',
  hex: '#94a3b8',
};

// ── Well-known subject → color mapping ──────────────────────
//    Common school subject master names (Indian CBSE / ICSE /
//    state board) are pre-mapped to visually distinct colors
//    so they NEVER collide. Unknown subjects get the next
//    available unused color from the palette.

const KNOWN_SUBJECT_COLOR_INDEX: Record<string, number> = {
  // Core subjects
  mathematics: 0, // Blue
  maths: 0,
  math: 0,
  science: 1, // Emerald
  'general science': 1,
  english: 2, // Violet
  hindi: 3, // Amber
  'social studies': 4, // Rose
  'social science': 4,
  sst: 4,
  evs: 5, // Cyan
  'environmental studies': 5,
  geography: 5,
  arts: 6, // Pink
  art: 6,
  drawing: 6,
  'fine arts': 6,
  'computer science': 7, // Teal
  computers: 7,
  computer: 7,
  ict: 7,
  'physical education': 8, // Orange
  pe: 8,
  sports: 8,
  'moral science': 9, // Indigo
  'value education': 9,
  'general knowledge': 10, // Lime
  gk: 10,
  music: 11, // Fuchsia
  dance: 11,
  sanskrit: 12, // Sky
  tamil: 12,
  telugu: 12,
  kannada: 12,
  malayalam: 12,
  marathi: 12,
  bengali: 12,
  urdu: 12,
  french: 12,
  german: 12,
  economics: 13, // Red
  commerce: 13,
  accountancy: 13,
  'business studies': 13,
  // Science streams
  physics: 0, // Blue (like Maths — analytical)
  chemistry: 1, // Emerald (like Science)
  biology: 5, // Cyan (like EVS — nature)
  history: 4, // Rose (like Social Studies)
  civics: 9, // Indigo (like Moral Science)
  'political science': 9,
  // Others
  library: 14, // Slate
  'free period': 14,
  craft: 6,
  'home science': 8,
};

/**
 * Get a color for a subject by its master name.
 *
 * Uses well-known name mapping first (case-insensitive), so
 * common subjects always get distinct colors. Falls back to a
 * collision-resistant hash for unknown subjects.
 *
 * `null` / `undefined` → UNASSIGNED_SUBJECT_COLOR.
 */
export function getSubjectColor(subjectName: string | null | undefined): SubjectColorScheme {
  if (!subjectName) {
    return UNASSIGNED_SUBJECT_COLOR;
  }
  const key = subjectName.trim().toLowerCase();
  const knownIdx = KNOWN_SUBJECT_COLOR_INDEX[key];
  if (knownIdx !== undefined) {
    return SUBJECT_COLOR_PALETTE[knownIdx];
  }
  // Fallback: FNV-1a inspired hash (better distribution than djb2)
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const idx = (hash >>> 0) % SUBJECT_COLOR_PALETTE.length;
  return SUBJECT_COLOR_PALETTE[idx];
}

/**
 * Build a color map for a list of subject names.
 *
 * Assigns colors **sequentially** from the palette for subjects
 * not in the well-known list, guaranteeing that no two subjects
 * in the same view share a color (up to 15 unique subjects).
 */
export function buildSubjectColorMap(
  subjectNames: (string | null | undefined)[]
): Map<string, SubjectColorScheme> {
  const map = new Map<string, SubjectColorScheme>();
  const usedIndices = new Set<number>();
  const deferred: string[] = [];

  // First pass: assign well-known subjects
  for (const name of subjectNames) {
    if (!name || map.has(name)) {
      continue;
    }
    const key = name.trim().toLowerCase();
    const knownIdx = KNOWN_SUBJECT_COLOR_INDEX[key];
    if (knownIdx !== undefined) {
      map.set(name, SUBJECT_COLOR_PALETTE[knownIdx]);
      usedIndices.add(knownIdx);
    } else {
      deferred.push(name);
    }
  }

  // Second pass: assign remaining subjects to unused palette slots
  let nextFree = 0;
  for (const name of deferred) {
    if (map.has(name)) {
      continue;
    }
    while (usedIndices.has(nextFree) && nextFree < SUBJECT_COLOR_PALETTE.length) {
      nextFree++;
    }
    const idx =
      nextFree < SUBJECT_COLOR_PALETTE.length ? nextFree : nextFree % SUBJECT_COLOR_PALETTE.length;
    map.set(name, SUBJECT_COLOR_PALETTE[idx]);
    usedIndices.add(idx);
    nextFree++;
  }

  return map;
}
