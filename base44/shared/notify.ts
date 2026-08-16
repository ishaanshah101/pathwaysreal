// In-app notifications.
//
// Written only from backend functions running as service role. A client can
// read and mark its own notifications, but can never create one, so nobody can
// forge a "someone accepted you" that did not happen.
//
// Every helper here swallows its own errors on purpose. A notification is a
// courtesy on top of an action that already succeeded, and a failure to write
// one must never roll back the connection it is describing.

type Base44 = any;

export type NotificationType =
  | 'connection_request'
  | 'connection_accepted'
  | 'connection_declined';

export async function notify(
  base44: Base44,
  input: {
    userEmail: string;
    type: NotificationType;
    actorEmail?: string;
    actorName?: string;
    body: string;
    link?: string;
    connectionId?: string;
  },
): Promise<void> {
  try {
    await base44.asServiceRole.entities.Notification.create({
      user_email: String(input.userEmail || '').toLowerCase(),
      type: input.type,
      actor_email: String(input.actorEmail || '').toLowerCase(),
      actor_name: input.actorName || '',
      body: String(input.body || '').slice(0, 300),
      link: input.link || '/app/messages',
      connection_id: input.connectionId || '',
      read: false,
      occurred_at: new Date().toISOString(),
    });
  } catch {
    // Deliberately silent. See the note at the top of this file.
  }
}

// The name to show for someone in a notification. Falls back to the part of
// the address before the @ rather than printing a bare email, which reads as a
// leak even when the recipient is allowed to see it.
export function displayName(name?: string | null, email?: string | null): string {
  const n = String(name || '').trim();
  if (n) return n;
  const e = String(email || '');
  const local = e.split('@')[0] || 'Someone';
  return local.charAt(0).toUpperCase() + local.slice(1);
}
