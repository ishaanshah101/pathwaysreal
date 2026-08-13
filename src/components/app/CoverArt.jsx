import React, { useMemo } from 'react';

// Generated cover art for feed posts.
//
// Deliberately not stock photography: an external image URL is one dead link
// away from making the whole feed look broken, and student-photo stock reads
// as filler. These are deterministic abstract compositions seeded by the post
// id, so a given post always looks the same, every category has its own
// palette, and nothing depends on the network.

const PALETTES = {
  applications: ['#f6a06b', '#c67139', '#ffe1d0'],
  essays: ['#aebf92', '#728157', '#e1eecc'],
  scholarships: ['#d67f48', '#8c491a', '#ffc6a5'],
  majors: ['#8fa073', '#3d472b', '#f0fae1'],
  campus_life: ['#ffc6a5', '#b2622d', '#fff2eb'],
  internships: ['#728157', '#272e1b', '#ccdbb2'],
  careers: ['#c0b6a5', '#645c50', '#eee7db'],
  test_prep: ['#f6a06b', '#56633f', '#f0fae1'],
};

function seedFrom(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Small deterministic PRNG so a post's artwork never changes between loads.
function makeRandom(seed) {
  let s = seed || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export default function CoverArt({ postId, category, height = 150 }) {
  const svg = useMemo(() => {
    const [c1, c2, c3] = PALETTES[category] || PALETTES.applications;
    const rand = makeRandom(seedFrom(String(postId)));
    const shape = Math.floor(rand() * 4);
    const W = 800;
    const H = 300;

    let body = '';

    if (shape === 0) {
      // Concentric arcs
      for (let i = 0; i < 7; i++) {
        const r = 60 + i * 42;
        body += `<circle cx="${140 + rand() * 120}" cy="${H + 40}" r="${r}" fill="none" stroke="${i % 2 ? c2 : c1}" stroke-width="${8 + rand() * 10}" opacity="${0.25 + i * 0.08}"/>`;
      }
    } else if (shape === 1) {
      // Diagonal ribbons
      for (let i = 0; i < 6; i++) {
        const x = -100 + i * 160;
        body += `<path d="M${x} ${H} L${x + 120} 0 L${x + 210} 0 L${x + 90} ${H} Z" fill="${i % 2 ? c1 : c2}" opacity="${0.18 + rand() * 0.4}"/>`;
      }
    } else if (shape === 2) {
      // Scattered dots on a rising line
      let d = `M0 ${H - 40}`;
      for (let i = 1; i <= 6; i++) {
        d += ` Q ${i * 133 - 66} ${H - 40 - rand() * 160} ${i * 133} ${H - 60 - i * 22}`;
      }
      body += `<path d="${d}" fill="none" stroke="${c2}" stroke-width="10" stroke-linecap="round" opacity="0.75"/>`;
      for (let i = 0; i < 14; i++) {
        body += `<circle cx="${rand() * W}" cy="${rand() * H}" r="${4 + rand() * 16}" fill="${c1}" opacity="${0.2 + rand() * 0.4}"/>`;
      }
    } else {
      // Stacked blocks
      for (let i = 0; i < 9; i++) {
        const w = 50 + rand() * 130;
        body += `<rect x="${rand() * (W - w)}" y="${rand() * (H - 70)}" width="${w}" height="${28 + rand() * 60}" rx="14" fill="${i % 3 === 0 ? c2 : c1}" opacity="${0.2 + rand() * 0.45}"/>`;
      }
    }

    const raw = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><rect width="${W}" height="${H}" fill="${c3}"/>${body}</svg>`;
    return `data:image/svg+xml,${encodeURIComponent(raw)}`;
  }, [postId, category]);

  return (
    <div
      role="presentation"
      style={{
        height,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundImage: `url("${svg}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
}
