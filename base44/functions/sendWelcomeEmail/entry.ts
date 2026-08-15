import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { consumeRateLimit } from '../../shared/rateLimit.ts';

// SHARED Gmail connector. The builder connects their own Gmail account once;
// the token is shared across all app users, so every welcome email sends
// from that one account.

function utf8ToBase64Url(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const toEmail = (body.email || '').toString().trim();
    const fullName = (body.full_name || '').toString().trim();
    if (!toEmail) {
      return Response.json({ ok: false, reason: 'no_email' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // The endpoint has a public URL, so the caller is never trusted. A request
    // is only honoured when it is one of the two legitimate cases:
    //   1. the signup workflow, right after a real signup, or
    //   2. a signed-in user asking for their own welcome email again.
    // Anything else is refused, which is what stops a stranger from using this
    // as a free mailer pointed at arbitrary addresses.
    const users = await base44.asServiceRole.entities.User.filter({ email: toEmail });
    const target = Array.isArray(users) ? users[0] : null;
    if (!target) {
      return Response.json({ ok: false, reason: 'not_a_registered_user' }, { status: 403 });
    }

    const caller = await base44.auth.me().catch(() => null);
    const isOwnAddress = Boolean(caller?.email) && caller.email.toLowerCase() === toEmail.toLowerCase();

    // Case 1: the account was created moments ago, which only the signup
    // workflow can be reacting to. The window is deliberately short so an
    // address stops being a valid target almost immediately after signup.
    const createdAt = target.created_date ? new Date(target.created_date).getTime() : 0;
    const isFreshSignup = createdAt > 0 && Date.now() - createdAt < 15 * 60 * 1000;

    if (!isOwnAddress && !isFreshSignup) {
      return Response.json({ ok: false, reason: 'not_authorized' }, { status: 403 });
    }

    // And even an allowed caller only gets one welcome email per address per day.
    const limit = await consumeRateLimit(base44, toEmail.toLowerCase(), 'welcome_email', { day: 1 });
    if (!limit.ok) {
      return Response.json({ ok: false, reason: 'already_sent_today' }, { status: 429 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    // Resolve the connected address so the From header is valid. Gmail will
    // otherwise rewrite or reject a From that doesn't match the account.
    let fromEmail = '';
    try {
      const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        fromEmail = profile?.emailAddress || '';
      }
    } catch { /* fall back below */ }
    if (!fromEmail) {
      return Response.json({ ok: false, reason: 'gmail_not_connected' }, { status: 503 });
    }

    const firstName = (fullName.split(' ')[0] || '').trim() || 'there';
    const subject = 'Welcome to Pathways, let\u2019s get you started';

    const plain = [
      `Hi ${firstName},`,
      ``,
      `Welcome to Pathways! We're so glad you're here.`,
      ``,
      `Pathways connects you with real students, professors, and counselors who've been exactly where you are. Here's how to get started right away:`,
      ``,
      `1. Finish your profile, add your grade, goals, and what you're curious about so we can match you with the right people.`,
      `2. Explore the feed for firsthand advice on applications, essays, scholarships, majors, and more.`,
      `3. Reach out and connect with someone who's walked your path.`,
      ``,
      `Everything on Pathways is free for every student, forever.`,
      ``,
      `Whenever you're ready, head back to Pathways and pick up where you left off.`,
      ``,
      `The Pathways Team`,
      `https://pathways.uno`,
    ].join('\r\n');

    const html = [
      `<div style="font-family:Figtree,Arial,sans-serif;color:#201e1d;max-width:560px;margin:0 auto">`,
      `<h1 style="font-size:22px;color:#b2622d;margin:0 0 12px">Welcome to Pathways, ${escapeHtml(firstName)}!</h1>`,
      `<p style="font-size:15px;line-height:1.6">We're so glad you're here. Pathways connects you with real students, professors, and counselors who've been exactly where you are.</p>`,
      `<p style="font-size:15px;line-height:1.6">Here's how to get started right away:</p>`,
      `<ol style="font-size:15px;line-height:1.7;color:#201e1d;padding-left:22px">`,
      `<li><b>Finish your profile</b>, add your grade, goals, and what you're curious about so we can match you with the right people.</li>`,
      `<li><b>Explore the feed</b> for firsthand advice on applications, essays, scholarships, majors, and more.</li>`,
      `<li><b>Connect</b> with someone who's walked your path.</li>`,
      `</ol>`,
      `<p style="font-size:15px;line-height:1.6">Everything on Pathways is free for every student, forever.</p>`,
      `<p style="font-size:15px;line-height:1.6">Whenever you're ready, head back to <a href="https://pathways.uno" style="color:#b2622d">Pathways</a> and pick up where you left off.</p>`,
      `<p style="font-size:14px;color:#82796a;margin-top:24px">The Pathways Team<br/><a href="https://pathways.uno" style="color:#82796a">pathways.uno</a></p>`,
      `</div>`,
    ].join('');

    const boundary = 'pathways_' + Math.random().toString(36).slice(2);
    const mime = [
      `From: Pathways <${fromEmail}>`,
      `To: ${toEmail}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      ``,
      plain,
      ``,
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      ``,
      html,
      ``,
      `--${boundary}--`,
      ``,
    ].join('\r\n');

    const raw = utf8ToBase64Url(mime);

    const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw }),
    });

    if (!sendRes.ok) {
      const errText = await sendRes.text();
      return Response.json({ ok: false, error: errText }, { status: 502 });
    }

    const sent = await sendRes.json();
    return Response.json({ ok: true, id: sent.id });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}