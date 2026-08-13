import React from 'react';

// WhatsApp-style delivery state, shown only on messages you sent.
//
//   sending    a small clock, the row has not reached the server yet
//   sent       one tick, stored
//   delivered  two ticks, the recipient's app has it
//   read       two ticks, tinted, they opened the conversation
//   failed     an exclamation, worth retrying

function Check({ x = 0 }) {
  return <path d={`M${x} 6.6 L${x + 2.6} 9.2 L${x + 7.6} 3.4`} />;
}

export default function DeliveryTicks({ state, onLight = true }) {
  // On the accent-coloured outgoing bubble, plain ticks need to be light.
  const dim = onLight ? 'rgba(245,234,216,0.72)' : 'var(--color-neutral-500)';
  const readColor = '#7cc6ff';

  if (state === 'sending') {
    return (
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke={dim} strokeWidth="1.6"
        strokeLinecap="round" aria-label="Sending">
        <circle cx="7" cy="7" r="5.4" />
        <path d="M7 4.2 V7.2 L9 8.6" />
      </svg>
    );
  }

  if (state === 'failed') {
    return (
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="#ffd7c7" strokeWidth="1.8"
        strokeLinecap="round" aria-label="Not delivered">
        <circle cx="7" cy="7" r="5.4" />
        <path d="M7 4.1 V7.6" />
        <path d="M7 9.7 V9.8" />
      </svg>
    );
  }

  const isRead = state === 'read';
  const color = isRead ? readColor : dim;
  const double = state === 'delivered' || isRead;

  return (
    <svg
      width={double ? 18 : 13}
      height="13"
      viewBox={`0 0 ${double ? 19 : 13} 13`}
      fill="none"
      stroke={color}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={isRead ? 'Read' : double ? 'Delivered' : 'Sent'}
    >
      <Check x={double ? 5 : 2} />
      {double && <Check x={0} />}
    </svg>
  );
}
