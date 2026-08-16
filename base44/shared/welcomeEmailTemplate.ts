import { escapeHtml } from './gmail.ts';

// The welcome email, kept out of the function so the copy can be edited without
// touching the auth and rate-limit logic around it.
//
// Design notes: it uses the site's own palette (cream page, sand card, burnt
// orange accent) and a table-based layout, because Gmail and Outlook still
// ignore flexbox and most modern CSS. Everything is inline styles for the same
// reason. The copy is deliberately plain and specific: no exclamation-mark
// enthusiasm, no em dashes, no "we're thrilled to have you on board".

const SITE = 'https://pathways.uno';

export function welcomeEmail(fullName: string) {
  const firstName = (String(fullName || '').split(' ')[0] || '').trim();
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  const subject = firstName
    ? `Welcome to Pathways, ${firstName}!`
    : 'Welcome to Pathways!';

  const plain = [
    greeting,
    ``,
    `Your account is ready, and we are really glad you are here!`,
    ``,
    `Most college advice online is written by people guessing. Pathways is the opposite: you talk to students who are already at the school you are curious about, and to professors and counselors who read applications for a living. You ask, they answer, and you get to skip a lot of wondering. It is genuinely fun once you get going!`,
    ``,
    `Three things worth doing first:`,
    ``,
    `1. Finish your profile. Your grade, your school, and what you actually want help with. This is what people see when you reach out, and it is what we match on.`,
    `2. Read the feed. Real questions and answers about applications, essays, scholarships, majors, and what a major is like day to day.`,
    `3. Send one message! Pick someone whose path looks like the one you are considering and ask them something specific. Specific questions get real answers.`,
    ``,
    `A note on how this works: students always send the first message, adults never do. Every profile can be reported or blocked, and nobody is told when you do either.`,
    ``,
    `And Pathways is free for students, and it stays free! Sage, the AI advisor, is the one optional add-on.`,
    ``,
    `If you get stuck or something looks wrong, reply to this email. A person reads it.`,
    ``,
    `The Pathways team`,
    SITE,
  ].join('\r\n');

  const step = (n: string, title: string, body: string) => `
    <tr>
      <td style="padding:0 0 18px 0;vertical-align:top;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="30" style="vertical-align:top;font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#c67139;line-height:1.4;">${n}</td>
            <td style="vertical-align:top;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#2e2b25;">
              <strong style="color:#201e1d;">${title}</strong><br/>${body}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5ead8;">
<div style="display:none;max-height:0;overflow:hidden;">Real answers from students, professors, and counselors who have been where you are.</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f5ead8;padding:28px 12px;">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="width:560px;max-width:100%;">

      <tr><td style="padding:0 6px 18px;font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#201e1d;letter-spacing:-.2px;">
        Pathways
      </td></tr>

      <tr><td style="background:#ebddc5;border-radius:24px;padding:30px 30px 26px;">
        <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:25px;line-height:1.2;color:#201e1d;">
          You're in!
        </p>
        <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#2e2b25;">
          ${escapeHtml(greeting)}
        </p>
        <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#2e2b25;">
          Most college advice online is written by people guessing. Pathways is the opposite! You talk to
          students who are already at the school you are curious about, and to professors and counselors
          who read applications for a living. It is genuinely fun once you get going.
        </p>
        <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#2e2b25;">
          Three things worth doing first:
        </p>

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          ${step('1.', 'Finish your profile.', 'Your grade, your school, and what you actually want help with. It is what people see when you reach out, and what we match on.')}
          ${step('2.', 'Read the feed.', 'Real questions and answers about applications, essays, scholarships, majors, and what a major is like day to day.')}
          ${step('3.', 'Send one message!', 'Pick someone whose path looks like the one you are considering, then ask something specific. Specific questions get real answers.')}
        </table>

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 6px;">
          <tr><td style="background:#c67139;border-radius:999px;">
            <a href="${SITE}/app" style="display:inline-block;padding:13px 26px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#f5ead8;text-decoration:none;">Open Pathways</a>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:14px 0 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f9f4ed;border-radius:20px;">
          <tr><td style="padding:18px 22px;font-family:Arial,Helvetica,sans-serif;font-size:13.5px;line-height:1.65;color:#645c50;">
            <strong style="color:#201e1d;">How this stays safe.</strong> Students always send the first
            message, adults never do. Every profile can be reported or blocked, and nobody is told when
            you do either.
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:18px 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13.5px;line-height:1.7;color:#645c50;">
        And Pathways is free for students, and it stays free! Sage, the AI advisor, is the one optional add-on.<br/><br/>
        If you get stuck or something looks wrong, reply to this email. A person reads it.<br/><br/>
        The Pathways team<br/>
        <a href="${SITE}" style="color:#8c491a;text-decoration:none;">pathways.uno</a>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;

  return { subject, plain, html };
}