import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Plus, Pencil, Trash2, Milestone } from 'lucide-react';
import Seo from '@/components/Seo';
import PageHead from '@/components/kit/PageHead';
import Sign from '@/components/kit/Sign';
import Icon from '@/components/kit/Icon';
import FieldSelect from '@/components/ui/FieldSelect';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useProfile } from '@/lib/useProfile';
import { GRADES } from '@/data/gradeGuide';
import {
  usePlan, PLAN_CATEGORIES, COLLEGE_FITS, COLLEGE_ROUNDS, COLLEGE_STATUSES,
  dateParts, dueLabel, todayIso, gradeIdFrom, starterTasksFor,
} from '@/lib/usePlan';

const CATEGORY_OPTIONS = Object.entries(PLAN_CATEGORIES).map(([k, v]) => [k, v.label]);
const FIT_SIGN_COLORS = { likely: '#17604a', target: '#1d4c8a', reach: '#e05e12' };

function Marker({ iso, tone }) {
  const p = dateParts(iso);
  if (!p) return <span className="marker" data-tone="none" aria-hidden="true"><small>No</small><b style={{ fontSize: 15 }}>date</b></span>;
  return (
    <span className="marker" data-tone={tone} aria-hidden="true">
      <small>{p.month}</small>
      <b>{p.day}</b>
    </span>
  );
}

function TaskStop({ task, tone, onToggle, onSave, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const cat = PLAN_CATEGORIES[task.category] || PLAN_CATEGORIES.other;
  const p = dateParts(task.due_date);

  const startEdit = () => {
    setForm({ title: task.title || '', due_date: task.due_date || '', category: task.category || 'other', notes: task.notes || '' });
    setEditing(true);
  };
  const save = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(task.id, { title: form.title.trim().slice(0, 160), due_date: form.due_date || '', category: form.category, notes: form.notes.trim().slice(0, 2000) });
    setEditing(false);
  };

  return (
    <li className="plan-stop" data-done={task.done ? 'true' : undefined}>
      <Marker iso={task.due_date} tone={task.done ? 'done' : tone} />
      <button
        type="button"
        className="tick"
        role="checkbox"
        aria-checked={Boolean(task.done)}
        aria-label={task.done ? `Mark “${task.title}” as not done` : `Mark “${task.title}” as done`}
        onClick={() => onToggle(task.id)}
      >
        <Icon as={Check} size={18} weight={3.6} />
      </button>

      {editing ? (
        <form className="plan-edit" onSubmit={save}>
          <div className="field">
            <label htmlFor={`pe-title-${task.id}`}>What needs doing</label>
            <input id={`pe-title-${task.id}`} className="input" autoFocus maxLength={160} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="plan-edit-row">
            <div className="field">
              <label htmlFor={`pe-date-${task.id}`}>Date</label>
              <input id={`pe-date-${task.id}`} className="input" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor={`pe-cat-${task.id}`}>Kind</label>
              <FieldSelect id={`pe-cat-${task.id}`} value={form.category} onValueChange={(category) => setForm({ ...form, category })} options={CATEGORY_OPTIONS} />
            </div>
          </div>
          <div className="field">
            <label htmlFor={`pe-notes-${task.id}`}>Notes, only you see them</label>
            <textarea id={`pe-notes-${task.id}`} className="input" style={{ minHeight: 76 }} maxLength={2000} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button type="submit" className="btn btn-primary btn-sm">Save</button>
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <div style={{ minWidth: 0 }}>
            <h3 className="plan-stop-title">{task.title}</h3>
            <div className="plan-stop-meta">
              <Sign color={cat.sign}>{cat.label}</Sign>
              {p && !task.done && <span className="meta">{p.weekday} · {dueLabel(task.due_date)}</span>}
              {task.done && <span className="meta">Done</span>}
            </div>
            {task.notes && <p className="plan-stop-notes">{task.notes}</p>}
          </div>
          <div className="plan-stop-actions">
            <button type="button" className="tool-btn" onClick={startEdit} aria-label={`Edit “${task.title}”`}><Icon as={Pencil} size={15} /> Edit</button>
            <button type="button" className="tool-btn" onClick={() => onRemove(task.id)} aria-label={`Remove “${task.title}”`}><Icon as={Trash2} size={15} /></button>
          </div>
        </>
      )}
    </li>
  );
}

// A college's own deadline, shown on the route so it cannot be missed. Edited
// from the college list, not here.
function CollegeStop({ college, onOpenList }) {
  const p = dateParts(college.due_date);
  return (
    <li className="plan-stop">
      <Marker iso={college.due_date} tone="college" />
      <span className="tick-space" aria-hidden="true" />
      <div style={{ minWidth: 0 }}>
        <h3 className="plan-stop-title">Apply to {college.title}</h3>
        <div className="plan-stop-meta">
          <Sign color="blue">{COLLEGE_ROUNDS[college.college_round] || 'Deadline'}</Sign>
          {p && <span className="meta">{p.weekday} · {dueLabel(college.due_date)}</span>}
        </div>
      </div>
      <div className="plan-stop-actions">
        <button type="button" className="tool-btn" onClick={onOpenList}>College list</button>
      </div>
    </li>
  );
}

function StarterDialog({ open, onOpenChange, defaultGrade, sources, onAdd }) {
  const [grade, setGrade] = useState(defaultGrade);
  const [picked, setPicked] = useState({});
  const [busy, setBusy] = useState(false);
  const today = todayIso();
  const suggestions = useMemo(() => starterTasksFor(grade), [grade]);

  // Pre-tick what is still ahead. Anything already on the plan, or already in
  // the past, is left for the student to decide.
  useEffect(() => {
    if (!open) return;
    const next = {};
    for (const s of suggestions) next[s.source] = !sources.has(s.source) && s.due_date >= today;
    setPicked(next);
  }, [open, suggestions, sources, today]);

  useEffect(() => { if (open) setGrade(defaultGrade); }, [open, defaultGrade]);

  const chosen = suggestions.filter((s) => picked[s.source] && !sources.has(s.source));

  const addChosen = async () => {
    setBusy(true);
    // `why` is the explanation shown here; it becomes the task's note.
    await onAdd(chosen.map(({ why, ...rest }) => ({ ...rest, notes: why })));
    setBusy(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: 600 }}>
        <DialogHeader>
          <DialogTitle>Start from your grade</DialogTitle>
          <DialogDescription style={{ fontSize: 15.5, lineHeight: 1.5, color: 'var(--ink-2)', marginTop: 8 }}>
            These are the things students in each grade usually need to do. Dates are typical, so
            change any that do not match your schools.
          </DialogDescription>
        </DialogHeader>

        <div className="field">
          <label htmlFor="starter-grade">Grade</label>
          <FieldSelect id="starter-grade" value={grade} onValueChange={setGrade} options={GRADES.map((g) => [g.id, g.label])} />
        </div>

        <ul className="starter-list">
          {suggestions.map((s) => {
            const have = sources.has(s.source);
            const p = dateParts(s.due_date);
            return (
              <li key={s.source}>
                <label className="starter-item" data-have={have ? 'true' : undefined}>
                  <input
                    type="checkbox"
                    disabled={have}
                    checked={have || Boolean(picked[s.source])}
                    onChange={(e) => setPicked({ ...picked, [s.source]: e.target.checked })}
                  />
                  <span>
                    <b>{s.title}</b>
                    <small>{have ? 'Already on your plan.' : s.why}</small>
                  </span>
                  <span className="meta" style={{ whiteSpace: 'nowrap', paddingTop: 2 }}>{p ? `${p.month} ${p.day}` : ''}</span>
                </label>
              </li>
            );
          })}
        </ul>

        <div className="flex gap-2 flex-wrap items-center">
          <button type="button" className="btn btn-primary" disabled={busy || chosen.length === 0} onClick={addChosen}>
            {busy ? 'Adding…' : chosen.length === 0 ? 'Nothing selected' : `Add ${chosen.length} to my plan`}
          </button>
          <button type="button" className="btn btn-quiet" onClick={() => onOpenChange(false)}>Cancel</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Plan() {
  const { profile } = useProfile();
  const plan = usePlan();
  const {
    tasks, colleges, overdue, upcoming, doneTasks, sources, loadingPlan, synced,
    add, addMany, update, toggleDone, remove,
  } = plan;

  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'colleges' ? 'colleges' : 'tasks';
  const setTab = (next) => {
    const p = new URLSearchParams(params);
    if (next === 'colleges') p.set('tab', 'colleges'); else p.delete('tab');
    setParams(p, { replace: true });
  };

  const [starterOpen, setStarterOpen] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [draft, setDraft] = useState({ title: '', due_date: '', category: 'applications' });
  const [college, setCollege] = useState({ title: '', college_fit: 'target', college_round: 'unsure', due_date: '' });
  const titleRef = useRef(null);

  // The jump menu and the by-grade page link straight into an action.
  useEffect(() => {
    const p = new URLSearchParams(params);
    let changed = false;
    if (p.get('add') === '1') { titleRef.current?.focus(); p.delete('add'); changed = true; }
    if (p.get('starter') === '1') { setStarterOpen(true); p.delete('starter'); changed = true; }
    if (changed) setParams(p, { replace: true });
  }, [params, setParams]);

  const defaultGrade = gradeIdFrom(profile?.grade) || '11';
  const today = todayIso();

  const addTask = async (e) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    await add({ kind: 'task', title: draft.title, due_date: draft.due_date, category: draft.category, done: false });
    setDraft({ title: '', due_date: '', category: draft.category });
    titleRef.current?.focus();
  };

  const addCollege = async (e) => {
    e.preventDefault();
    if (!college.title.trim()) return;
    await add({ kind: 'college', title: college.title, college_fit: college.college_fit, college_round: college.college_round, due_date: college.due_date, college_status: 'researching', category: 'applications' });
    setCollege({ title: '', college_fit: college.college_fit, college_round: 'unsure', due_date: '' });
  };

  // College deadlines that are still ahead ride along on the route.
  const collegeStops = colleges.filter((c) => c.due_date && c.due_date >= today && !['submitted', 'admitted', 'denied', 'committed'].includes(c.college_status));

  // Group what is ahead by month, with undated tasks last.
  const months = useMemo(() => {
    const groups = new Map();
    const dated = [
      ...upcoming.filter((t) => t.due_date).map((t) => ({ type: 'task', date: t.due_date, row: t })),
      ...collegeStops.map((c) => ({ type: 'college', date: c.due_date, row: c })),
    ].sort((a, b) => a.date.localeCompare(b.date));
    for (const entry of dated) {
      const p = dateParts(entry.date);
      if (!groups.has(p.key)) groups.set(p.key, { label: p.monthLong, entries: [] });
      groups.get(p.key).entries.push(entry);
    }
    return [...groups.values()];
  }, [upcoming, collegeStops]);
  const undated = upcoming.filter((t) => !t.due_date);

  const total = tasks.length;
  const doneCount = doneTasks.length;
  const next = upcoming.find((t) => t.due_date) || null;
  const fitCounts = { likely: 0, target: 0, reach: 0 };
  for (const c of colleges) if (fitCounts[c.college_fit] !== undefined) fitCounts[c.college_fit] += 1;

  const sub = total === 0 && colleges.length === 0
    ? 'Nothing on it yet. Add one thing, or start from what students in your grade usually do.'
    : `${upcoming.length + overdue.length} ahead, ${doneCount} done, ${colleges.length} ${colleges.length === 1 ? 'college' : 'colleges'} on your list. Only you can see this.`;

  return (
    <div className="page">
      <Seo title="Your Plan | Pathways" description="Your private checklist and college list on Pathways." path="/app/plan" noindex />

      <PageHead kicker="Plan" title="Your route" sub={sub}>
        <button type="button" className="btn btn-secondary" onClick={() => setStarterOpen(true)}>
          <Icon as={Milestone} size={16} /> Start from my grade
        </button>
      </PageHead>

      {!synced && (
        <div className="notice notice-warning" role="status" style={{ marginBottom: 18 }}>
          <b>Saved on this device.</b> Your plan will sync to your account when the connection is back.
        </div>
      )}

      <div className="seg" role="tablist" aria-label="Plan views" style={{ marginBottom: 22 }}>
        <button type="button" role="tab" aria-selected={tab === 'tasks'} className="seg-opt" data-on={String(tab === 'tasks')} onClick={() => setTab('tasks')}>
          Checklist{total > 0 ? ` (${total - doneCount})` : ''}
        </button>
        <button type="button" role="tab" aria-selected={tab === 'colleges'} className="seg-opt" data-on={String(tab === 'colleges')} onClick={() => setTab('colleges')}>
          College list{colleges.length > 0 ? ` (${colleges.length})` : ''}
        </button>
      </div>

      {tab === 'tasks' ? (
        <div className="plan-layout">
          <div style={{ minWidth: 0 }}>
            <form className="panel" onSubmit={addTask} style={{ marginBottom: 8 }}>
              <div className="panel-head">Add a stop</div>
              <div className="panel-body plan-add">
                <div className="field">
                  <label htmlFor="plan-title">What needs doing</label>
                  <input id="plan-title" ref={titleRef} className="input" maxLength={160} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Ask Ms. Ortiz for a recommendation" />
                </div>
                <div className="field">
                  <label htmlFor="plan-date">Date</label>
                  <input id="plan-date" className="input" type="date" value={draft.due_date} onChange={(e) => setDraft({ ...draft, due_date: e.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="plan-cat">Kind</label>
                  <FieldSelect id="plan-cat" value={draft.category} onValueChange={(category) => setDraft({ ...draft, category })} options={CATEGORY_OPTIONS} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={!draft.title.trim()}>
                  <Icon as={Plus} size={16} weight={3} /> Add
                </button>
              </div>
            </form>

            {loadingPlan && total === 0 ? (
              <div role="status" aria-label="Loading your plan" style={{ display: 'grid', gap: 14, paddingTop: 20 }}>
                <span className="skeleton skeleton-title" style={{ width: '50%' }} />
                <span className="skeleton skeleton-line" />
                <span className="skeleton skeleton-line" style={{ width: '80%' }} />
              </div>
            ) : total === 0 && collegeStops.length === 0 ? (
              <div className="empty" style={{ marginTop: 20 }}>
                <p className="empty-title">No stops on your route yet.</p>
                <p className="empty-body">
                  Add the next thing you know you have to do, even if it is small. Or start from the list
                  for your grade and delete what does not apply.
                </p>
                <button type="button" className="btn btn-sun btn-go" style={{ marginTop: 6 }} onClick={() => setStarterOpen(true)}>Start from my grade</button>
              </div>
            ) : (
              <div className="route">
                {overdue.length > 0 && (
                  <>
                    <h2 className="plan-section-head" data-tone="late">Behind you <span className="meta">{overdue.length} past their date</span></h2>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {overdue.map((t) => <TaskStop key={t.id} task={t} tone="late" onToggle={toggleDone} onSave={update} onRemove={remove} />)}
                    </ul>
                  </>
                )}

                {months.map((m) => (
                  <React.Fragment key={m.label}>
                    <h2 className="plan-section-head">{m.label} <span className="meta">{m.entries.length} {m.entries.length === 1 ? 'stop' : 'stops'}</span></h2>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {m.entries.map((entry) => (entry.type === 'task'
                        ? <TaskStop key={entry.row.id} task={entry.row} onToggle={toggleDone} onSave={update} onRemove={remove} />
                        : <CollegeStop key={`c-${entry.row.id}`} college={entry.row} onOpenList={() => setTab('colleges')} />))}
                    </ul>
                  </React.Fragment>
                ))}

                {undated.length > 0 && (
                  <>
                    <h2 className="plan-section-head">No date yet <span className="meta">{undated.length}</span></h2>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {undated.map((t) => <TaskStop key={t.id} task={t} onToggle={toggleDone} onSave={update} onRemove={remove} />)}
                    </ul>
                  </>
                )}

                {doneCount > 0 && (
                  <>
                    <h2 className="plan-section-head">
                      Done
                      <button type="button" className="link-btn meta" style={{ marginLeft: 'auto' }} aria-expanded={showDone} onClick={() => setShowDone((s) => !s)}>
                        {showDone ? 'Hide' : `Show ${doneCount}`}
                      </button>
                    </h2>
                    {showDone && (
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {doneTasks.map((t) => <TaskStop key={t.id} task={t} onToggle={toggleDone} onSave={update} onRemove={remove} />)}
                      </ul>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <aside className="plan-aside" aria-label="Progress">
            <div className="panel">
              <div className="panel-head">Distance covered</div>
              <div className="panel-body" style={{ display: 'grid', gap: 12 }}>
                <div className="flex items-baseline gap-2">
                  <span className="plan-big num">{doneCount}</span>
                  <span style={{ fontWeight: 700, color: 'var(--ink-2)' }}>of {total} done</span>
                </div>
                <div className="plan-progress" role="progressbar" aria-valuemin={0} aria-valuemax={total || 1} aria-valuenow={doneCount} aria-label="Tasks done">
                  <i style={{ width: `${total ? Math.round((doneCount / total) * 100) : 0}%` }} />
                </div>
                {next ? (
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.45, color: 'var(--ink-2)' }}>
                    <b style={{ color: 'var(--ink)' }}>Next stop:</b> {next.title}. {dueLabel(next.due_date)}.
                  </p>
                ) : (
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.45, color: 'var(--ink-2)' }}>Nothing with a date is coming up.</p>
                )}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">Not sure what comes next?</div>
              <div className="panel-body" style={{ display: 'grid', gap: 10, fontSize: 15, lineHeight: 1.5, color: 'var(--ink-2)' }}>
                <span>The by-grade guide lists what matters each season, and the glossary explains the words.</span>
                <span className="flex gap-4 flex-wrap" style={{ fontWeight: 800, color: 'var(--ink)' }}>
                  <Link to={`/app/by-grade?grade=${defaultGrade}`}>By grade</Link>
                  <Link to="/app/glossary">Glossary</Link>
                </span>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 22 }}>
          <div className="fit-strip" aria-label="Your list by fit">
            {Object.entries(COLLEGE_FITS).map(([key, fit]) => (
              <div key={key} className="fit-cell" style={{ '--fc': FIT_SIGN_COLORS[key], color: key === 'reach' ? '#1d1a16' : '#fff' }}>
                <b className="num">{fitCounts[key]}</b>
                <span>{fit.label}</span>
              </div>
            ))}
          </div>

          {colleges.length > 0 && (fitCounts.likely === 0 || fitCounts.reach > fitCounts.likely + fitCounts.target) && (
            <div className="notice notice-warning">
              <b>This list leans hard toward reaches.</b> A balanced list has some of each. Add two schools you are
              likely to get into and can afford, so April has a good answer in it whatever happens.
            </div>
          )}

          <form className="panel" onSubmit={addCollege}>
            <div className="panel-head">Add a college</div>
            <div className="panel-body college-add">
              <div className="field">
                <label htmlFor="col-name">College</label>
                <input id="col-name" className="input" maxLength={160} value={college.title} onChange={(e) => setCollege({ ...college, title: e.target.value })} placeholder="UC Davis" />
              </div>
              <div className="field">
                <label htmlFor="col-fit">How likely</label>
                <FieldSelect id="col-fit" value={college.college_fit} onValueChange={(college_fit) => setCollege({ ...college, college_fit })} options={Object.entries(COLLEGE_FITS).map(([k, v]) => [k, v.label])} />
              </div>
              <div className="field">
                <label htmlFor="col-round">Round</label>
                <FieldSelect id="col-round" value={college.college_round} onValueChange={(college_round) => setCollege({ ...college, college_round })} options={Object.entries(COLLEGE_ROUNDS)} />
              </div>
              <div className="field">
                <label htmlFor="col-date">Deadline</label>
                <input id="col-date" className="input" type="date" value={college.due_date} onChange={(e) => setCollege({ ...college, due_date: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={!college.title.trim()}>
                <Icon as={Plus} size={16} weight={3} /> Add
              </button>
            </div>
          </form>

          {colleges.length === 0 ? (
            <div className="empty">
              <p className="empty-title">No colleges on your list yet.</p>
              <p className="empty-body">
                Add any school you are curious about. Run its net price calculator before you get attached,
                and mark each one likely, target or reach.
              </p>
              <Link to="/app/glossary#net-price-calculator" className="btn btn-secondary" style={{ marginTop: 6 }}>What is a net price calculator?</Link>
            </div>
          ) : (
            <div>
              {colleges.map((c) => {
                const fit = COLLEGE_FITS[c.college_fit];
                const p = dateParts(c.due_date);
                return (
                  <div key={c.id} className="college-row">
                    <div className="college-name">
                      <h3>{c.title}</h3>
                      {fit && <Sign color={fit.sign}>{fit.label}</Sign>}
                    </div>
                    <div className="meta" style={{ lineHeight: 1.5 }}>
                      {COLLEGE_ROUNDS[c.college_round] || 'Round not set'}
                      <br />
                      {p ? `Due ${p.month} ${p.day}, ${p.date.getFullYear()} · ${dueLabel(c.due_date)}` : 'No deadline set'}
                    </div>
                    <FieldSelect
                      ariaLabel={`Status for ${c.title}`}
                      value={c.college_status || 'researching'}
                      onValueChange={(college_status) => update(c.id, { college_status })}
                      options={Object.entries(COLLEGE_STATUSES)}
                    />
                    <button type="button" className="tool-btn" onClick={() => remove(c.id)} aria-label={`Remove ${c.title} from your list`}>
                      <Icon as={Trash2} size={15} /> Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <p className="meta" style={{ lineHeight: 1.6, maxWidth: '72ch' }}>
            Deadlines differ by college and by round. Copy each one from the college's own admissions page, not
            from memory. Colleges with a deadline still ahead also show up on your checklist.
          </p>
        </div>
      )}

      <StarterDialog open={starterOpen} onOpenChange={setStarterOpen} defaultGrade={defaultGrade} sources={sources} onAdd={addMany} />
    </div>
  );
}
