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
            className="btn btn-chip"
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}