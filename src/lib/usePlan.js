import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useProfile } from '@/lib/useProfile';
import { GRADES } from '@/data/gradeGuide';

// The private planner: tasks with dates, and a college list.
//
// Everything is written to this device first and to the server second. A plan
// is something a student opens on a bus with no signal, so it must never show
// an empty page because a request failed. Rows that have not reached the
// server yet are kept with a local id and retried on the next load.

export const PLAN_CATEGORIES = {
  applications: { label: 'Applications', sign: 'green' },
  essays: { label: 'Essays', sign: 'blue' },
  testing: { label: 'Testing', sign: 'red' },
  money: { label: 'Paying for it', sign: 'yellow' },
  recs: { label: 'Recommendations', sign: 'brown' },
  visits: { label: 'Visits', sign: 'lime' },
  school: { label: 'School', sign: 'white' },
  other: { label: 'Other', sign: 'ink' },
};

export const COLLEGE_FITS = {
  likely: { label: 'Likely', sign: 'green', hint: 'Your grades sit above most admitted students and the price works.' },
  target: { label: 'Target', sign: 'blue', hint: 'You look like the students they usually admit.' },
  reach: { label: 'Reach', sign: 'sun', hint: 'Admits few people, or your numbers are below their usual range.' },
};

export const COLLEGE_ROUNDS = {
  unsure: 'Not sure yet',
  ed: 'Early Decision',
  ea: 'Early Action',
  rea: 'Restrictive Early Action',
  rd: 'Regular Decision',
  rolling: 'Rolling',
};

export const COLLEGE_STATUSES = {
  researching: 'Researching',
  applying: 'Working on it',
  submitted: 'Submitted',
  admitted: 'Admitted',
  waitlisted: 'Waitlisted',
  deferred: 'Deferred',
  denied: 'Not admitted',
  committed: 'Committed',
};

const cacheKey = (email) => `pathways.plan.${String(email || '').toLowerCase()}`;
const isLocal = (id) => String(id).startsWith('local-');

function readCache(email) {
  try { return JSON.parse(localStorage.getItem(cacheKey(email)) || '[]'); } catch { return []; }
}
function writeCache(email, rows) {
  try { localStorage.setItem(cacheKey(email), JSON.stringify(rows)); } catch { /* quota: the server copy is still there */ }
}

// Only the fields the entity accepts, so a cached row can be sent as-is.
function wire(row, email) {
  const out = { user_email: email, kind: row.kind || 'task', title: String(row.title || '').trim().slice(0, 160) };
  for (const key of ['category', 'due_date', 'done', 'done_at', 'notes', 'college_fit', 'college_round', 'college_status', 'source']) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') out[key] = row[key];
  }
  if (out.notes) out.notes = String(out.notes).slice(0, 2000);
  return out;
}

export function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// "11th grade", "Junior", "grade 11" and friends, down to '9' .. '12'.
export function gradeIdFrom(text) {
  const t = String(text || '').toLowerCase();
  const n = t.match(/\b(9|10|11|12)(st|nd|rd|th)?\b/);
  if (n) return n[1];
  if (t.includes('fresh')) return '9';
  if (t.includes('soph')) return '10';
  if (t.includes('junior')) return '11';
  if (t.includes('senior')) return '12';
  return null;
}

// The suggested tasks for a grade, placed on this school year's calendar.
// A school year starts in August: from August on, "this year" is the year it
// started in. Summer steps always belong to the summer after the grade ends.
export function starterTasksFor(gradeId, now = new Date()) {
  const grade = GRADES.find((g) => g.id === String(gradeId));
  if (!grade) return [];
  const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  const out = [];
  for (const season of grade.seasons) {
    for (const step of season.steps) {
      if (!step.plan) continue;
      const { title, category, month, day } = step.plan;
      const year = season.when === 'Summer' || month < 8 ? startYear + 1 : startYear;
      out.push({
        kind: 'task',
        title,
        category,
        due_date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        source: `starter:${grade.id}:${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 48)}`,
        why: step.text,
      });
    }
  }
  return out;
}

export function usePlan() {
  const { email } = useProfile();
  const [items, setItems] = useState(() => readCache(email));
  const [loading, setLoading] = useState(true);
  const [synced, setSynced] = useState(true);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const commit = useCallback((next) => {
    itemsRef.current = next;
    setItems(next);
    writeCache(email, next);
  }, [email]);

  const reload = useCallback(async () => {
    if (!email) { setItems([]); setLoading(false); return; }
    const cached = readCache(email);
    if (cached.length && itemsRef.current.length === 0) { itemsRef.current = cached; setItems(cached); }
    try {
      const rows = await base44.entities.PlanItem.filter({ user_email: email }, 'due_date', 500);
      const server = Array.isArray(rows) ? rows : [];
      // Anything still carrying a local id never reached the server. Send it now.
      const pending = itemsRef.current.filter((r) => isLocal(r.id));
      const pushed = [];
      for (const row of pending) {
        try {
          pushed.push(await base44.entities.PlanItem.create(wire(row, email)));
        } catch {
          pushed.push(row);
        }
      }
      commit([...server, ...pushed]);
      setSynced(!pushed.some((r) => isLocal(r.id)));
    } catch {
      // No connection, or the planner is not available on the server yet. The
      // copy on this device keeps working either way.
      setSynced(false);
    }
    setLoading(false);
  }, [email, commit]);

  useEffect(() => { reload(); }, [reload]);

  const add = useCallback(async (draft) => {
    if (!email || !String(draft.title || '').trim()) return null;
    const local = { ...wire(draft, email), id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, created_date: new Date().toISOString() };
    commit([...itemsRef.current, local]);
    try {
      const created = await base44.entities.PlanItem.create(wire(draft, email));
      commit(itemsRef.current.map((r) => (r.id === local.id ? created : r)));
      return created;
    } catch {
      setSynced(false);
      return local;
    }
  }, [email, commit]);

  const addMany = useCallback(async (drafts) => {
    for (const d of drafts) await add(d);
  }, [add]);

  const update = useCallback(async (id, patch) => {
    commit(itemsRef.current.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    if (isLocal(id)) return;
    try {
      await base44.entities.PlanItem.update(id, patch);
    } catch {
      setSynced(false);
    }
  }, [commit]);

  const toggleDone = useCallback((id) => {
    const row = itemsRef.current.find((r) => r.id === id);
    if (!row) return;
    const done = !row.done;
    update(id, { done, done_at: done ? new Date().toISOString() : '' });
  }, [update]);

  const remove = useCallback(async (id) => {
    commit(itemsRef.current.filter((r) => r.id !== id));
    if (isLocal(id)) return;
    try {
      await base44.entities.PlanItem.delete(id);
    } catch {
      setSynced(false);
    }
  }, [commit]);

  const tasks = useMemo(
    () => items.filter((r) => r.kind !== 'college')
      .sort((a, b) => String(a.due_date || '9999').localeCompare(String(b.due_date || '9999')) || String(a.title).localeCompare(String(b.title))),
    [items],
  );
  const colleges = useMemo(
    () => items.filter((r) => r.kind === 'college').sort((a, b) => String(a.title).localeCompare(String(b.title))),
    [items],
  );

  const today = todayIso();
  const open = tasks.filter((t) => !t.done);
  const overdue = open.filter((t) => t.due_date && t.due_date < today);
  const upcoming = open.filter((t) => !t.due_date || t.due_date >= today);
  const doneTasks = tasks.filter((t) => t.done);
  const sources = useMemo(() => new Set(items.map((r) => r.source).filter(Boolean)), [items]);

  return {
    items, tasks, colleges, open, overdue, upcoming, doneTasks, sources,
    loadingPlan: loading, synced,
    add, addMany, update, toggleDone, remove, reloadPlan: reload,
  };
}

// "Nov 15" and "Sat" for a YYYY-MM-DD date, without the timezone shifting it a
// day, which is what `new Date('2026-11-15')` does west of Greenwich.
export function dateParts(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso || ''))) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return {
    date,
    month: date.toLocaleDateString('en-US', { month: 'short' }),
    day: d,
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    monthLong: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    key: `${y}-${String(m).padStart(2, '0')}`,
  };
}

export function daysUntil(iso) {
  const p = dateParts(iso);
  if (!p) return null;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((p.date - start) / 86400000);
}

export function dueLabel(iso) {
  const n = daysUntil(iso);
  if (n === null) return '';
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  if (n < 0) return `${-n} days ago`;
  if (n < 14) return `In ${n} days`;
  if (n < 70) return `In ${Math.round(n / 7)} weeks`;
  return `In ${Math.round(n / 30)} months`;
}
