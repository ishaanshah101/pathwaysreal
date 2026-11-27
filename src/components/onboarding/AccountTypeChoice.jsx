import React from 'react';
import { Check } from 'lucide-react';
import Icon from '@/components/kit/Icon';
import Sign from '@/components/kit/Sign';

const OPTIONS = [
  {
    value: 'student',
    kicker: 'In high school',
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
    kicker: 'In college, teaching or advising',
    title: "I'm an adult",
    blurb: 'You’re a college student, educator, or counselor who can answer the questions students actually have.',
    points: [
      'Say where you work or study',
      'Pick what you can speak to',
      'You can ask to have your role verified',
    ],
  },
];

// One of the two signs at the fork. Outlined until it is picked, then it turns
// into the sign itself: green for the student's road, blue for the people who
// are the help along it. The box in the corner is the tick.
function Choice({ option, selected, onSelect }) {
  const { value, kicker, title, blurb, points } = option;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`choice choice-${value}`}
    >
      <span className="choice-box" aria-hidden="true"><Icon as={Check} size={16} weight={3.4} /></span>
      <span className="choice-kicker">{kicker}</span>
      <span className="choice-title">{title}</span>
      <span className="choice-blurb">{blurb}</span>
      <span className="choice-points">
        {points.map((p) => <span key={p}>{p}</span>)}
      </span>
    </button>
  );
}

// The two ways people reach each other on Pathways. Explained here, at the
// moment someone picks an account type, because that is when it actually
// matters: it is the difference between reading someone and messaging them.
// Set as a map legend, with each word on the same kind of button it will be
// in the app: Follow outlined, Connect solid.
function FollowVsConnect() {
  return (
    <div className="panel">
      <div className="panel-head">Legend · Two ways to reach someone here</div>
      <ul className="reach-list">
        <li>
          <Sign color="white">Follow</Sign>
          <span>
            <b>Following is one way.</b> You see what someone posts in your feed. Nothing is sent
            to them, they do not have to agree, and it never opens a conversation.
          </span>
        </li>
        <li>
          <Sign color="ink">Connect</Sign>
          <span>
            <b>Connecting goes both ways.</b> One person asks, the other accepts, and only then can
            the two of you message. Students send the first request, so no adult can open contact
            with someone under 18.
          </span>
        </li>
      </ul>
    </div>
  );
}

// `labelledBy` is the id of a heading that already asks the question. Without
// it the component asks the question itself.
export default function AccountTypeChoice({ value, onChange, labelledBy }) {
  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      {!labelledBy && (
        <div>
          <span id="account-type-label" style={{ display: 'block', fontSize: 13.5, fontWeight: 800 }}>
            Which of these are you?
          </span>
          <span className="field-hint" style={{ marginTop: 2 }}>
            Pick one and we will only ask for the details that apply to you.
          </span>
        </div>
      )}
      <div className="choices" role="group" aria-labelledby={labelledBy || 'account-type-label'}>
        {OPTIONS.map((o) => (
          <Choice
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
