import React from 'react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// One dropdown for the whole app, built on the Radix Select already in ui/.
// A raw <select> renders as the platform's own wheel in an iOS WebView, which
// looks nothing like the rest of Pathways and cannot be styled; this keeps the
// field looking like every other input while staying keyboard accessible.
//
// options: array of [value, label].
export default function FieldSelect({
  id, value, onValueChange, options, placeholder = 'Choose one', disabled, ariaLabel,
}) {
  return (
    <Select value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        className="input"
        style={{ height: 'auto', minHeight: 42, textAlign: 'left' }}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      {/* item-aligned, not popper: the popper viewport is capped to the
          trigger's own height, which squashes a long list to one row. */}
      <SelectContent position="item-aligned">
        {options.map(([v, l]) => (
          <SelectItem key={v} value={v}>{l}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}