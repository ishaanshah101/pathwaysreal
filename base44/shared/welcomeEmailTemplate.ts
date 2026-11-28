import { escapeHtml } from './gmail.ts';

// The welcome email, kept out of the function so the copy can be edited without
// touching the auth and rate-limit logic around it.
//
// Design notes: it looks like the app, which looks like a student's notebook.
// A kraft desk, one sheet of paper with a red margin line, highlighter behind
// the headline, numbers circled in red pen, blue rules between the steps, and
// a yellow sticky note for the safety line. The layout is tables and inline
// styles, because Gmail and Outlook still ignore flexbox and most modern CSS,
// and the fonts are ones every mail client already has. The copy is plain and
// specific: no em dashes, no "we're thrilled to have you on board".

const SITE = 'https://pathways.uno';

export function welcomeEmail(fullName: string) {
  // The name arrives from the signup request body and ends up in the subject
  // line, so it is capped here as well as scrubbed in sendGmail. Belt and
  // braces: this file should never be the reason a header is unreasonable.
  const firstName = (String(fullName || '').split(' ')[0] || '').trim().slice(0, 60);
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
    `If you get stuck or something looks wrong, email ishaan@pathways.uno. A person reads it.`,
    ``,
    `The Pathways team`,
    SITE,
  ].join('\r\n');

  const HEAD = "'Trebuchet MS','Segoe UI',Verdana,Arial,sans-serif";
  const BODY = "Verdana,'Segoe UI',Arial,Helvetica,sans-serif";
  const HAND = "'Bradley Hand','Segoe Print','Comic Sans MS',cursive";

  // One step: a number circled in red pen, then the line, with a blue rule
  // under it like the lines on the page.
  const step = (n: string, title: string, body: string) => `
    <tr>
      <td style="padding:12px 0 12px 0;vertical-align:top;border-bottom:1px solid #c5d6e8;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="40" style="width:40px;vertical-align:top;">
              <span style="display:inline-block;width:24px;height:24px;line-height:24px;border:2px solid #c2362b;border-radius:50%;text-align:center;font-family:${HEAD};font-size:14px;font-weight:bold;color:#c2362b;">${n}</span>
            </td>
            <td style="vertical-align:top;font-family:${BODY};font-size:14.5px;line-height:1.65;color:#232732;">
              <strong style="font-family:${HEAD};font-size:16px;color:#232732;">${title}</strong><br/>${body}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#eadfc6;">
<div style="display:none;max-height:0;overflow:hidden;">Real answers from students, professors, and counselors who have been where you are.</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#eadfc6;padding:28px 12px;">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="width:560px;max-width:100%;">

      <tr><td style="padding:0 4px 16px;font-family:${HEAD};font-size:23px;font-weight:bold;color:#232732;">
        <span style="color:#e05e12;">&#9679;</span> Pathways
      </td></tr>

      <tr><td style="background:#fffdf6;border-bottom:3px solid #d5c9ab;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="30" style="width:30px;border-right:2px solid #e79b98;font-size:0;line-height:0;">&nbsp;</td>
            <td style="padding:28px 26px 26px 20px;">
              <p style="margin:0 0 16px;font-family:${HEAD};font-size:30px;line-height:1.2;font-weight:bold;color:#232732;">
                <span style="background:#ffe45e;padding:2px 10px;">You're in!</span>
              </p>
              <p style="margin:0 0 12px;font-family:${BODY};font-size:14.5px;line-height:1.7;color:#232732;">
                ${escapeHtml(greeting)}
              </p>
              <p style="margin:0 0 16px;font-family:${BODY};font-size:14.5px;line-height:1.7;color:#232732;">
                Most college advice online is written by people guessing. Pathways is the opposite! You talk to
                students who are already at the school you are curious about, and to professors and counselors
                who read applications for a living. It is genuinely fun once you get going.
              </p>
              <p style="margin:0 0 2px;font-family:${HEAD};font-size:17px;font-weight:bold;color:#232732;border-bottom:2px solid #e79b98;padding-bottom:8px;">
                Three things worth doing first
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                ${step('1', 'Finish your profile.', 'Your grade, your school, and what you actually want help with. It is what people see when you reach out, and what we match on.')}
                ${step('2', 'Read the feed.', 'Real questions and answers about applications, essays, scholarships, majors, and what a major is like day to day.')}
                ${step('3', 'Send one message!', 'Pick someone whose path looks like the one you are considering, then ask something specific. Specific questions get real answers.')}
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 0;">
                <tr>
                  <td style="background:#e05e12;border:2px solid #232732;border-radius:4px;">
                    <a href="${SITE}/app" style="display:inline-block;padding:12px 24px;font-family:${HEAD};font-size:16px;font-weight:bold;color:#232732;text-decoration:none;">Open Pathways &rarr;</a>
                  </td>
                  <td style="padding-left:16px;font-family:${HAND};font-size:19px;color:#c2362b;">free. actually free.</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td></tr>

      <tr><td style="padding:16px 0 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#ffe45e;border-bottom:3px solid #d9bd3c;">
          <tr><td style="padding:16px 20px;font-family:${BODY};font-size:13.5px;line-height:1.65;color:#232732;">
            <strong style="font-family:${HEAD};font-size:15px;">How this stays safe.</strong> Students always send the first
            message, adults never do. Every profile can be reported or blocked, and nobody is told when
            you do either.
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:18px 4px 0;font-family:${BODY};font-size:13px;line-height:1.7;color:#4a4f5c;">
        And Pathways is free for students, and it stays free! Sage, the AI advisor, is the one optional add-on.<br/><br/>
        If you get stuck or something looks wrong, email <a href="mailto:ishaan@pathways.uno" style="color:#24548f;font-weight:bold;">ishaan@pathways.uno</a>. A person reads it.<br/><br/>
        The Pathways team<br/>
        <a href="${SITE}" style="color:#24548f;font-weight:bold;">pathways.uno</a>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;

  return { subject, plain, html };
}