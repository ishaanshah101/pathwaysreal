import React from 'react';

// Shared chip multi-select, so onboarding and the profile page pick topics the
// exact same way instead of each rolling their own row of buttons.
export default function ChipPicker({ options, selected = [], onToggle }) {
  return (
    <div className="flex flex-wrap gap-2" style={{ marginTop: 4 }}>
      {options.map((label) => {
        const on = selected.includes(label);
        return (
          <button
            key={label}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(label)}
            className="btn"
            style={{
              fontFamily: 'var(--font-body)', fontSize: 13, padding: '7px 14px',
              background: on ? 'var(--color-accent)' : 'transparent',
              color: on ? 'var(--color-bg)' : 'var(--color-text)',
              borderColor: on ? 'transparent' : 'var(--color-divider)',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}