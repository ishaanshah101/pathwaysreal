import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '@/components/Seo';
import ContactEmail from '@/components/ContactEmail';
import {
  COMPANY_NAME, COMPANY_LOCATION, PRODUCT_NAME, PRODUCT_DOMAIN,
} from '@/lib/company';

const S = ({ title, children }) => (
  <section style={{ marginBottom: 26 }}>
    <h2 className="h-sans" style={{ fontSize: 18, margin: '0 0 8px' }}>{title}</h2>
    <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-muted)' }}>{children}</div>
  </section>
);

export default function Terms() {
  return (
    <section className="page-hero" style={{ paddingBottom: 'clamp(40px,6vh,72px)', maxWidth: '68ch' }}>
      <Seo
        title="Terms of Service | Pathways"
        description="The terms for using Pathways: who operates it, who can join, how members must behave, and how the free core app and optional Sage subscription work."
        path="/terms"
      />
      <h1 style={{ fontSize: 'clamp(30px,4.2vw,46px)', margin: '0 0 8px' }}>Terms of Service</h1>
      <p style={{ color: 'var(--text-subtle)', fontSize: 13, marginBottom: 32 }}>
        Last updated August 2026
      </p>

      <S title="1. Who operates Pathways">
        {PRODUCT_NAME} ({PRODUCT_DOMAIN}) is operated by <b>{COMPANY_NAME}</b>, based in {COMPANY_LOCATION}{' '}
        ("{PRODUCT_NAME}", "we", "us"). {COMPANY_NAME} is the party legally responsible for the service,
        including payment processing. You can reach us at <ContactEmail />, and we will provide a postal
        address on request.
      </S>

      <S title="2. Agreeing to these terms">
        By creating an account or using Pathways you agree to these terms and to our{' '}
        <Link to="/privacy">Privacy Policy</Link>. If you do not agree, do not use Pathways. If you are under 18,
        you also confirm that a parent or guardian is aware you are using Pathways and permits it.
      </S>

      <S title="3. Who can join">
        You must be <b>13 or older</b> to create an account. Accounts belonging to anyone under 13 will be removed
        as soon as we become aware of them, and you can tell us about one at the address in section 14.
        <br /><br />
        Keep your account details accurate. Do not share your login, and do not create an account on someone else's
        behalf or pretend to be someone you are not.
      </S>

      <S title="4. What Pathways is and is not">
        Pathways connects you with real people who share their own experience. Guidance you receive here is personal
        opinion, not professional admissions, legal, financial, or medical advice. Members who describe themselves as
        educators or counselors are self-described unless we have marked their profile as verified, and a verified
        badge means we checked something, not that we endorse their advice.
        <br /><br />
        Sage is an AI advisor. It can be confidently wrong. Verify anything important with your school counselor or the
        institution itself before acting on it.
      </S>

      <S title="5. How to behave here">
        Be honest and be useful. You may not:
        <ul style={{ margin: '10px 0 0', paddingLeft: 20 }}>
          <li>Harass, threaten, bully, or demean anyone</li>
          <li>Post sexual content, or direct sexualised language at any member</li>
          <li>Impersonate another person, school, or organisation</li>
          <li>Post someone else's private information</li>
          <li>Use Pathways to sell admissions consulting, essay writing, or anything that compromises the integrity
            of an application</li>
          <li>Scrape, spam, or automate access to the platform</li>
          <li>Attempt to bypass our safety systems, rate limits, or the Sage paywall</li>
        </ul>
        <br />
        We remove content and suspend or terminate accounts that break these rules, at our discretion and without
        notice where safety requires it.
      </S>

      <S title="6. Safety rules for contact between adults and minors">
        Because many of our members are minors, some rules are not negotiable:
        <ul style={{ margin: '10px 0 0', paddingLeft: 20 }}>
          <li>You can only message someone after you have both accepted a connection</li>
          <li>Messages are screened automatically. Phone numbers, email addresses, social handles, links, and
            attempts to move the conversation off Pathways or arrange to meet in person are blocked</li>
          <li>Adults are here to give guidance and nothing else. Initiating contact with a student for any other
            purpose is a violation of these terms</li>
          <li>Asking a minor for photographs, personal contact details, or secrecy will result in immediate
            termination and, where appropriate, a report to law enforcement or the National Center for Missing and
            Exploited Children</li>
        </ul>
        <br />
        Attempting to evade these systems is itself a violation. See our <Link to="/safety">Safety page</Link> for how
        to report someone.
      </S>

      <S title="7. Reporting and enforcement">
        Every profile, post, and conversation has a Report action. Reports are reviewed by a human. Depending on what
        we find we may dismiss the report, warn the member, remove content, suspend the account, or terminate it
        permanently. We may also preserve records and contact law enforcement where we believe someone is at risk.
        <br /><br />
        You can block any member at any time. Blocking prevents them from messaging you and hides them from your view
        of the platform.
      </S>

      <S title="8. Your content">
        You keep ownership of what you post. By posting you give Pathways a non-exclusive licence to store, display,
        and distribute that content within the platform so other members can benefit from it. This licence ends when
        you delete the content, except for copies we must retain for safety or legal reasons.
        <br /><br />
        We may remove content that breaks these terms or that we reasonably believe puts a member at risk.
      </S>

      <S title="9. Free access and Sage">
        The core of Pathways, including the feed, search, connections, messaging, and profiles, is free and is
        intended to stay free. <b>Sage</b> is an optional paid subscription at $5 per month or $40 per year, billed
        in US dollars.
        <ul style={{ margin: '10px 0 0', paddingLeft: 20 }}>
          <li>Subscriptions renew automatically until cancelled</li>
          <li>You can cancel at any time from your Profile page. Cancelling stops the next renewal and you keep
            access until the end of the period you have already paid for</li>
          <li>We do not provide automatic refunds for partial periods, but if something went wrong, email us and we
            will look at it fairly</li>
          <li>If we change the price, existing subscribers will be told before it takes effect</li>
        </ul>
        <br />
        Payments are processed by <b>Stripe</b>. Pathways never sees or stores your card details. If you are under 18,
        you must have permission from a parent or guardian before subscribing.
      </S>

      <S title="10. Suspension and termination">
        You can delete your account at any time from your Profile page. We may suspend or terminate an account that
        breaks these terms, that we believe presents a risk to other members, or where required by law. If we
        terminate your account while you have an active Sage subscription, we will refund the unused portion unless
        the termination was for a safety violation.
      </S>

      <S title="11. Availability and liability">
        Pathways is provided as is and as available. We do our best to keep it running and accurate, but we do not
        guarantee uninterrupted service, the accuracy of anything a member or Sage tells you, or any particular
        admissions or career outcome.
        <br /><br />
        To the fullest extent permitted by law, our total liability to you for any claim relating to Pathways is
        limited to the greater of the amount you paid us in the twelve months before the claim, or fifty US dollars.
        Nothing in these terms limits liability that cannot legally be limited.
      </S>

      <S title="12. Governing law">
        These terms are governed by the laws of the State of California, United States, without regard to conflict of
        law rules. Disputes will be brought in the state or federal courts located in California, and you and we both
        consent to that jurisdiction.
      </S>

      <S title="13. Changes to these terms">
        We may update these terms as the product develops. If we make a material change we will note it here with a
        new date at the top, and where the change meaningfully affects your rights we will tell registered members by
        email before it takes effect.
      </S>

      <S title="14. Contact">
        Questions about these terms, or anything else, go to <ContactEmail />. Safety reports are
        handled through the in-app Report action or the same address, and are treated as urgent.
      </S>
    </section>
  );
}
