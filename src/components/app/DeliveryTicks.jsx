import React from 'react';

// Delivery state, shown only under messages you sent. A small mark and the
// word for it, in the same small print as the time, so nobody has to learn
// what one tick or two ticks means.
//
//   sending    a moving lane line, the row has not reached the server yet
//   sent       one check, stored
//   delivered  two checks, the recipient's app has it
//   read       two checks in sign green, they opened the conversation
//   failed     a red mark, held back or lost

const WORDS = {
  sending: 'Sending',
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read',
  failed: 'Not delivered',
};

function Check({ x = 0 }) {
  return <path d={`M${x + 1} 6.4 L${x + 3.6} 9 L${x + 8.4} 3.2`} />;
}

export default function DeliveryTicks({ state }) {
  // Anything unrecognised is treated as stored, which is the least it can be.
  const key = WORDS[state] ? state : 'sent';
  const double = key === 'delivered' || key === 'read';

  return (
    <span className="receipt" data-state={key}>
      {key === 'sending' ? (
        <span className="lane-run lane-run-sm" aria-hidden="true" />
      ) : key === 'failed' ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
          <path d="M6 2 V7" />
          <path d="M6 10 V10.2" />
        </svg>
      ) : (
        <svg
          width={double ? 17 : 12}
          height="12"
          viewBox={`0 0 ${double ? 17 : 12} 12`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
          strokeLinejoin="miter"
          aria-hidden="true"
        >
          <Check x={double ? 6 : 1} />
          {double && <Check x={0} />}
        </svg>
      )}
      {WORDS[key]}
    </span>
  );
}
