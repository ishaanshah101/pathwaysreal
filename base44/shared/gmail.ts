// Sending mail through the shared Gmail connector. The builder connects their
// own Gmail once and the token is shared, so every outbound email leaves from
// that one account. Kept here so sendWelcomeEmail and the moderation alert use
// exactly the same MIME building and error handling.

function utf8ToBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function escapeHtml(s: any): string {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c] as string));
}

// Resolves the connected Gmail address so the From header carries a friendly
// name. The connector is granted send access only, so reading the profile can
// legitimately fail; when it does we simply omit From and Gmail fills in the
// account's own address.
async function resolveFromAddress(accessToken: string): Promise<string> {
  try {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return '';
    const profile = await res.json().catch(() => ({}));
    return profile?.emailAddress || '';
  } catch {
    return '';
  }
}

export async function sendGmail(
  base44: any,
  { to, subject, plain, html, fromName = 'Pathways' }:
    { to: string; subject: string; plain: string; html: string; fromName?: string },
): Promise<{ ok: boolean; id?: string; reason?: string; error?: string }> {
  const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

  const fromEmail = await resolveFromAddress(accessToken);

  const boundary = 'pathways_' + Math.random().toString(36).slice(2);
  const mime = [
    ...(fromEmail ? [`From: ${fromName} <${fromEmail}>`] : []),
    `To: ${to}`,
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

  const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: utf8ToBase64Url(mime) }),
  });

  if (!sendRes.ok) {
    return { ok: false, error: await sendRes.text() };
  }
  const sent = await sendRes.json();
  return { ok: true, id: sent.id };
}