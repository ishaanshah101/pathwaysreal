import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '@/components/Seo';
import SectionHeader from '@/components/SectionHeader';
import ContactEmail from '@/components/ContactEmail';

function Section({ title, children }) {
  return (
    <section className="card elev-sm" style={{ padding: 24, gap: 10, borderRadius: 26 }}>
      <h2 style={{ fontSize: 21, margin: 0 }}>{title}</h2>
      <div style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--color-neutral-800)' }}>{children}</div>
    </section>
  );
}

export default function Safety() {
  return (
    <div className="flex flex-col" style={{ gap: 16, paddingBottom: 40 }}>
      <Seo
        title="Safety on Pathways | How to report someone and get help"
        description="How Pathways keeps student conversations safe: one-on-one messaging only, contact details and meetup requests filtered out, plus reporting and blocking."
        path="/safety"
      />

      <SectionHeader
        as="h1"
        eyebrow="Safety"
        title="You should never feel unsafe here."
        intro="Pathways exists so students can get real guidance from people who have been there. That only works if it is safe. Here is exactly what we do, and what you can do."
      />

      <Section title="What is blocked automatically">
        Every message and post is screened before it is saved. Phone numbers, email addresses,
        social handles, links off the platform, requests to text, call, or meet in person,
        requests for photos or video of you, and sexual content are all refused, and the message
        is never delivered. Conversations are one-on-one only, never group chats, and messages are
        permanent so nothing can be quietly deleted after the fact.
      </Section>

      <Section title="How to report someone">
        Every profile, post, and conversation has a Report link. Choose what happened, add details
        if you want to, and send it. You do not need proof and you do not need to explain yourself.
        Reports are private, and the person you report is never told who reported them.
      </Section>

      <Section title="What happens after you report">
        A real person on the Pathways safety team reads every report, usually within one day. We
        look at the surrounding conversation, and depending on what we find we warn the person,
        suspend them, or remove them from Pathways permanently. Serious safety concerns involving
        a minor are escalated immediately.
      </Section>

      <Section title="Blocking">
        Blocking is separate from reporting and takes effect instantly. A blocked person cannot
        message you, and they disappear from your feed and from Explore. They are never told. You
        can block someone from their profile or from the top of your conversation with them.
      </Section>

      <Section title="Reaching a human">
        If something is urgent, or you would rather talk to a person than file a form, email{' '}
        <ContactEmail />. It reaches a real person and safety reports are treated
        as urgent. You can also use the Report form and choose "Something else that felt unsafe", adding that
        you want to be contacted. We answer every one. A parent, teacher, or counselor can contact us on your
        behalf if you would rather they did.
        {' '}
        <strong>If you or someone else is in immediate danger, contact your local emergency
        number first.</strong> In the United States, that is 911. You can also reach the Suicide &amp; Crisis
        Lifeline by calling or texting <strong>988</strong>, or the Crisis Text Line by texting HOME to
        741741 — both free, confidential, and available any time. To report child exploitation, use{' '}
        <strong>CyberTipline.org</strong>.
      </Section>

      <Section title="Our rules for adults on Pathways">
        Adults on Pathways are here to give guidance, nothing else. Asking a student for contact
        details, for photos, to meet in person, or to keep a conversation secret from their parents
        or school is never acceptable and will end their account. If an adult does any of these
        things, please report it, even if you are not sure.
      </Section>

      <p style={{ fontSize: 13.5, color: 'var(--color-neutral-700)', margin: '4px 0 0' }}>
        See also our <Link to="/privacy" style={{ color: 'var(--color-accent-700)' }}>Privacy policy</Link>
        {' '}and <Link to="/terms" style={{ color: 'var(--color-accent-700)' }}>Terms</Link>.
      </p>
    </div>
  );
}