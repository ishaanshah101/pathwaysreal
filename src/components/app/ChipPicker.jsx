import React from 'react';

// Shared chip multi-select, so onboarding and the profile page pick topics the
// exact same way instead of each rolling their own row of buttons.
//
// `labelledBy` is the id of the visible question above the chips, so a screen
// reader hears what the group is for. It is optional.
export default function ChipPicker({ options, selected = [], onToggle, labelledBy }) {
  return (
    <div className="chip-picker" role="group" aria-labelledby={labelledBy}>
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
