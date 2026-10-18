import React from 'react';

// Keep this wording aligned with Privacy Policy section 7b.
export default function DeletionDetails() {
  return (
    <div className="space-y-5 text-ink-muted leading-relaxed">
      <p><b>What is deleted:</b> your profile, every post you wrote, your Sage conversations, folders and free-sample counters, all your connections and pending requests, the blocks you placed on other people, your rate-limit counters, any verification request you submitted, and your sign-in itself, so the account can no longer be used to log in.</p>
      <p><b>If you subscribe to Sage:</b> we cancel your subscription with Stripe before anything is deleted. If that cancellation fails, we stop and delete nothing, so you are never left paying for an account that no longer exists.</p>
      <div>
        <p><b>What we keep, and why:</b></p>
        <ul className="list-disc pl-5 space-y-3 mt-2">
          <li><b>Messages you sent</b> stay in the recipient's inbox, with your name and email address removed and shown as "Deleted account". Their side of a conversation is their own record, and deleting it for them is not ours to do.</li>
          <li><b>Blocks other people placed on you</b> stay in force, so nobody loses a protection they chose because you closed your account.</li>
          <li><b>Safety reports and blocked-content records</b> are kept with your identifiers removed. Pathways is used by minors, and these records are how we recognise a pattern of behaviour that reappears under a new account.</li>
          <li><b>Payment records</b> stay with Stripe for as long as tax and accounting law requires.</li>
        </ul>
      </div>
      <p>We also write one line to our own audit log noting that a deletion happened. It contains no name, email address, or other identifier.</p>
    </div>
  );
}