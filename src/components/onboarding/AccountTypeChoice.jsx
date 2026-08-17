import React from 'react';
import { GraduationCap, Briefcase, Check, UserPlus, MessageCircle } from 'lucide-react';

const OPTIONS = [
  {
    value: 'student',
    Icon: GraduationCap,
    title: "I'm a student",
    blurb: "You're in high school and want to hear from people who have already done what you're about to do.",
    points: [
      'Say what year you are in and where you go',
      'Pick the things you want help with',
      'You send the first message, always',
    ],
  },
  {
    value: 'adult',
    Icon: Briefcase,
    title: "I'm an adult",
    blurb: 'You’re a college student, educator, or counselor who can answer the questions students actually have.',
    points: [
      'Say where you work or study',
      'Pick what you can speak to',
      'You can ask to have your role verified',
    ],
  },
];

function Card({ option, selected, onSelect }) {
  const { Icon, title, blurb, points } = option;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="card text-left card-interactive"
      style={{
        padding: 'var(--space-5)', gap: 'var(--space-2)', borderRadius: 'var(--radius-lg)',
        font: 'inherit', outlineOffset: 3,
        border: selected ? '2px solid var(--color-accent)' : '1px solid var(--color-divider)',
        background: selected ? 'var(--color-accent-100)' : 'var(--color-surface)',
      }}
    >
      <span className="flex items-center gap-[10px]">
        <span
          className="flex items-center justify-center"
          style={{
            width: 34, height: 34, borderRadius: 'var(--radius-pill)', flex: 'none',
            background: selected ? 'var(--color-action)' : 'var(--color-neutral-200)',
            color: selected ? 'var(--color-bg)' : 'var(--text-muted)',
          }}
        >
          <Icon size={17} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)' }}>{title}</span>
        {selected && (
          <span className="badge badge-accent" style={{ marginLeft: 'auto' }}>
            <Check size={11} aria-hidden="true" /> Selected
          </span>
        )}
      </span>
      <span style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-normal)', color: 'var(--text-default)' }}>
        {blurb}
      </span>
      <span className="flex flex-col" style={{ gap: 'var(--space-1)', marginTop: 'var(--space-1)' }}>
        {points.map((p) => (
          <span
            key={p}
            className="flex items-start gap-2"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}
          >
            <Check size={13} strokeWidth={2.4} aria-hidden="true" style={{ marginTop: 2, flex: 'none', color: 'var(--color-accent-600)' }} />
            {p}
          </span>
        ))}
      </span>
    </button>
  );
}

// The two ways people reach each other on Pathways. Explained here, at the
// moment someone picks an account type, because that is when it actually
// matters: it is the difference between reading someone and messaging them.
function FollowVsConnect() {
  const rows = [
    {
      Icon: UserPlus,
      title: 'Following is one way',
      body: 'You see what someone posts in your feed. Nothing is sent to them, they do not have to agree, and it never opens a conversation.',
    },
    {
      Icon: MessageCircle,
      title: 'Connecting goes both ways',
      body: 'One person asks, the other accepts, and only then can the two of you message. Students send the first request, so no adult can open contact with someone under 18.',
    },
  ];

  return (
    <div
      className="flex flex-col"
      style={{
        gap: 'var(--space-3)', padding: 'var(--space-4)',
        borderRadius: 'var(--radius-md)', background: 'var(--color-bg)',
      }}
    >
      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-muted)' }}>
        Either way, there are two ways to reach someone here
      </span>
      {rows.map(({ Icon, title, body }) => (
        <span key={title} className="flex items-start gap-[10px]">
          <Icon size={16} strokeWidth={2.2} aria-hidden="true" style={{ marginTop: 3, flex: 'none', color: 'var(--color-accent-600)' }} />
          <span style={{ fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)', color: 'var(--text-default)' }}>
            <b style={{ fontWeight: 600 }}>{title}.</b> {body}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function AccountTypeChoice({ value, onChange }) {
  return (
    <div className="flex flex-col" style={{ gap: 'var(--space-3)' }}>
      <div>
        <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-muted)' }}>
          Which of these are you?
        </label>
        <span className="field-hint" style={{ marginTop: 2 }}>
          Pick one and we will only ask for the details that apply to you.
        </span>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
        {OPTIONS.map((o) => (
          <Card
            key={o.value}
            option={o}
            selected={value === o.value}
            onSelect={() => onChange(o.value)}
          />
        ))}
      </div>
      <FollowVsConnect />
    </div>
  );
}