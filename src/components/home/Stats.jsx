import React from 'react';

// Set as a highway distance sign, because that is exactly what it is: how far
// away help is, depending on which road your family can afford. Every figure
// is about the student reading it.
const rows = [
  { place: 'A private college counselor', num: '$200', unit: '/hr' },
  { place: 'US high schoolers deciding now', num: '16 million' },
  { place: 'Pathways, for every one of them', num: '$0' },
];

export default function Stats() {
  return (
    <section className="band band-tight" aria-label="Why Pathways exists">
      <div className="wrap mileage-wrap">
        <div className="mileage">
          {rows.map((r) => (
            <div key={r.place} className="mileage-row">
              <span>{r.place}</span>
              <span className="num">{r.num}{r.unit ? <small>{r.unit}</small> : null}</span>
            </div>
          ))}
        </div>
        <div className="mileage-posts" aria-hidden="true"><i /><i /></div>
        <p className="meta mileage-note">
          Most families never have a private counselor. Pathways is free forever, not as a trial.
        </p>
      </div>
    </section>
  );
}
