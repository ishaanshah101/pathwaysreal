import React from 'react';
import Seo from '@/components/Seo';

const S = ({ title, children }) => (
  <section style={{ marginBottom: 26 }}>
    <h2 style={{ fontSize: 20, margin: '0 0 8px' }}>{title}</h2>
    <div style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--color-neutral-800)' }}>{children}</div>
  </section>
);

export default function Terms() {
  return (
    <section style={{ padding: 'clamp(28px,6vh,64px) 0 clamp(36px,6vh,64px)', maxWidth: '68ch' }}>
      <Seo
        title="Terms of Service | Pathways"
        description="The terms for using Pathways: who can join, how to behave, what Pathways is and is not, and how the free core app and optional Sage subscription work."
        path="/terms"
      />
      <h1 style={{ fontSize: 'clamp(30px,4.2vw,46px)', margin: '0 0 8px' }}>Terms of Service</h1>
      <p style={{ color: 'var(--color-neutral-600)', fontSize: 13, marginBottom: 28 }}>
        Last updated August 2026
      </p>

      <S title="Using Pathways">
        By creating an account you agree to these terms. You must be 14 or older. Keep your account details accurate,
        and do not let anyone else use your account.
      </S>

      <S title="What Pathways is and is not">
        Pathways connects you with real people who share their own experience. Guidance you receive here is personal
        opinion, not professional admissions, legal, financial, or medical advice. Sage is an AI advisor and can be
        wrong. Verify anything important with your school counselor or the institution itself before acting on it.
      </S>

      <S title="How to behave here">
        Be honest and be useful. Do not harass, impersonate, or mislead other members. Do not post someone else's
        private information. Do not use Pathways to sell admissions consulting, essay writing, or anything that would
        compromise the integrity of an application. We remove content and accounts that break these rules.
      </S>

      <S title="Your content">
        You keep ownership of what you post. By posting you give Pathways permission to display and distribute it within
        the platform so other members can benefit from it. You can delete your posts at any time.
      </S>

      <S title="Free access and Sage">
        The core of Pathways, including the feed, search, connections, messaging, and profiles, is free and is intended
        to stay free. Sage is an optional paid feature at $5 per month or $40 per year. Sage subscriptions can be
        cancelled at any time and turn off college advertising across the app.
      </S>

      <S title="Availability">
        Pathways is provided as is. We do our best to keep it running and accurate, but we do not guarantee
        uninterrupted service or any particular admissions or career outcome.
      </S>

      <S title="Changes">
        We may update these terms as the product develops. If we make a material change we will note it here with a new
        date at the top.
      </S>

      <S title="Contact">
        Questions about these terms can be sent to <b>ishaanshah101@gmail.com</b>.
      </S>
    </section>
  );
}
