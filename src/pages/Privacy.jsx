import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '@/components/Seo';

const S = ({ title, children }) => (
  <section style={{ marginBottom: 26 }}>
    <h2 style={{ fontSize: 20, margin: '0 0 8px' }}>{title}</h2>
    <div style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--color-neutral-800)' }}>{children}</div>
  </section>
);

export default function Privacy() {
  return (
    <section style={{ padding: 'clamp(28px,6vh,64px) 0 clamp(36px,6vh,64px)', maxWidth: '68ch' }}>
      <Seo
        title="Privacy Policy | Pathways"
        description="How Pathways handles student information: what we collect, who can see it, how long we keep it, and how to delete it. We never sell student data."
        path="/privacy"
      />
      <h1 style={{ fontSize: 'clamp(30px,4.2vw,46px)', margin: '0 0 8px' }}>Privacy Policy</h1>
      <p style={{ color: 'var(--color-neutral-600)', fontSize: 13, marginBottom: 28 }}>
        Last updated August 2026
      </p>

      <S title="1. Who we are">
        Pathways (pathways.uno) is a platform that connects high school students with students, educators, and
        counselors who can give firsthand guidance on college and careers. It is operated by <b>Swati Shah</b>, based
        in San Ramon, California, United States, who is the data controller for the information described here.
        <br /><br />
        Contact: <b>pathways.admins@gmail.com</b>. A postal address is available on request.
      </S>

      <S title="2. What we collect">
        <b>When you sign up:</b> your name and email address from your sign-in provider.
        <br /><br />
        <b>When you build your profile:</b> your role, grade or institution, school, the topics you want help with,
        your headline, and your bio. All of this is optional except your role and birth year.
        <br /><br />
        <b>As you use Pathways:</b> the posts you publish, the messages you send and receive, your connection
        requests, and the questions you ask Sage along with Sage's answers, so your conversation is there when you
        come back.
        <br /><br />
        <b>For safety:</b> if a message or post is blocked by our safety systems, we keep a record of what rule fired,
        a short excerpt, and who sent it. We keep reports members file about each other.
        <br /><br />
        <b>Automatically:</b> a one-way hash of your IP address, used only to rate-limit the free Sage sample on our
        public page. We do not store raw IP addresses for that feature.
        <br /><br />
        <b>If you subscribe to Sage:</b> Stripe collects and holds your payment details. We receive only your
        subscription status, plan, renewal date, and Stripe customer reference. <b>We never see your card number.</b>
      </S>

      <S title="3. What we never do">
        We do not sell student data. We do not share your information with data brokers. We do not use your messages
        or your Sage conversations to target advertising, and we do not train any AI model on them. Sage subscribers
        see no college advertising anywhere in the app.
      </S>

      <S title="4. How we use what we collect">
        To run your account and sign you in; to show you relevant people and posts; to let other members find you when
        you want to be found; to give Sage enough context to answer usefully; to process your Sage subscription; to
        keep the platform safe by screening content and reviewing reports; and to send you messages about your
        account. We do not send marketing email you did not ask for.
      </S>

      <S title="5. Who can see your information">
        <b>Other members:</b> your name, role, headline, school, grade, bio, and topics are visible to other
        signed-in members, so they can decide whether to connect with you. Only share what you are comfortable
        being seen — you can clear any of these fields from your Profile tab at any time.
        <br /><br />
        <b>Only you:</b> your Sage conversations.
        <br /><br />
        <b>You and one other person:</b> your direct messages.
        <br /><br />
        <b>Us:</b> we can access message content when investigating a safety report or a blocked message. We do not
        read conversations otherwise.
      </S>

      <S title="6. Service providers">
        <ul style={{ margin: '10px 0 0', paddingLeft: 20 }}>
          <li><b>Base44</b> — hosts the application, database, and authentication</li>
          <li><b>Google</b> — sign-in provider</li>
          <li><b>Stripe</b> — payment processing for Sage subscriptions</li>
          <li><b>A large language model provider</b> — generates Sage's answers and runs our safety classifier</li>
        </ul>
        <br />
        These providers process data on our behalf under their own terms. We do not permit them to use your data for
        their own purposes.
      </S>

      <S title="7. How long we keep it">
        Your profile, posts, messages, and Sage history are kept while your account is open. When you delete your
        account we remove or anonymise them within 30 days.
        <br /><br />
        Two exceptions: safety records (blocked-content logs and reports) are kept for up to two years even after an
        account is deleted, because they are how we spot repeat behaviour across accounts; and payment records are
        kept as long as tax and accounting law requires.
      </S>

      <S title="8. Students under 18">
        Pathways is for people <b>13 and older</b>. We do not knowingly collect information from anyone under 13. If
        you believe a child under 13 has created an account, email us and we will delete it promptly.
        <br /><br />
        Members who are minors are protected by the rules in our <Link to="/terms">Terms</Link> section 6: messaging
        requires a mutual connection, and every message is screened for contact details and meetup requests before it
        sends.
        <br /><br />
        We handle student information consistently with COPPA, and where Pathways is used in connection with a school
        we will work with that school on its FERPA obligations. A parent or guardian can email us to review, correct,
        or delete their child's information.
      </S>

      <S title="9. Your rights and choices">
        You can edit or clear your profile at any time from the Profile tab. You can also:
        <ul style={{ margin: '10px 0 0', paddingLeft: 20 }}>
          <li><b>Download your data</b> — request a copy of everything we hold about you</li>
          <li><b>Delete your account</b> — from your Profile page, or by emailing us</li>
          <li><b>Correct</b> anything inaccurate</li>
          <li><b>Object</b> to a particular use of your information</li>
        </ul>
        <br />
        If you are a California resident, the CCPA and CPRA give you the rights to know, delete, correct, and opt out
        of sale or sharing of your personal information. <b>We do not sell or share personal information</b>, so there
        is nothing to opt out of, but the other rights apply and you can exercise them at the address below. We will
        not discriminate against you for exercising them.
      </S>

      <S title="10. Security">
        Access to your data is restricted at the database level so members can only read their own records and their
        own conversations. Payment credentials never touch our systems. No service can promise perfect security, and
        we will tell affected members promptly if we ever discover a breach involving their information.
      </S>

      <S title="11. Changes to this policy">
        If we make a material change we will note it here with a new date at the top, and tell registered members by
        email where the change meaningfully affects them.
      </S>

      <S title="12. Contact">
        Questions, requests, or concerns about privacy go to <b>pathways.admins@gmail.com</b>. Safety concerns are
        treated as urgent — see our <Link to="/safety">Safety page</Link>.
      </S>
    </section>
  );
}
