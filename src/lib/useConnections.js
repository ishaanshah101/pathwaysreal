import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useProfile } from '@/lib/useProfile';

// One place that knows the state of every connection involving me.
//
// Both the feed and Explore need the same three answers about a person:
// are we connected, is there a request open, and which way does it point.
// Before this hook each screen worked that out for itself, which is how the
// feed ended up sending people to Explore instead of actually connecting.

export function useConnections() {
  const { email } = useProfile();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyEmail, setBusyEmail] = useState(null);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!email) { setConnections([]); setLoading(false); return; }
    try {
      const rows = await base44.entities.Connection.list('-created_date', 400);
      setConnections(Array.isArray(rows) ? rows : []);
    } catch {
      setConnections([]);
    }
    setLoading(false);
  }, [email]);

  useEffect(() => { reload(); }, [reload]);

  // The connection between me and someone else, annotated with which way it
  // points so a screen never has to compare emails itself.
  const connectionWith = useCallback((otherEmail) => {
    const other = String(otherEmail || '').toLowerCase();
    if (!other || !email) return null;
    const me = String(email).toLowerCase();
    const row = connections.find((c) => {
      const f = String(c.from_email || '').toLowerCase();
      const t = String(c.to_email || '').toLowerCase();
      return (f === me && t === other) || (f === other && t === me);
    });
    if (!row) return null;
    return {
      ...row,
      direction: String(row.to_email || '').toLowerCase() === me ? 'incoming' : 'outgoing',
    };
  }, [connections, email]);

  const connectedEmails = useMemo(() => {
    const me = String(email || '').toLowerCase();
    return connections
      .filter((c) => c.status === 'accepted')
      .map((c) => (String(c.from_email || '').toLowerCase() === me
        ? String(c.to_email || '').toLowerCase()
        : String(c.from_email || '').toLowerCase()));
  }, [connections, email]);

  // Requests waiting on me. This is what the Requests screen lists.
  const incomingPending = useMemo(() => {
    const me = String(email || '').toLowerCase();
    return connections.filter(
      (c) => c.status === 'pending' && String(c.to_email || '').toLowerCase() === me,
    );
  }, [connections, email]);

  const outgoingPending = useMemo(() => {
    const me = String(email || '').toLowerCase();
    return connections.filter(
      (c) => c.status === 'pending' && String(c.from_email || '').toLowerCase() === me,
    );
  }, [connections, email]);

  const isConnected = useCallback(
    (otherEmail) => connectedEmails.includes(String(otherEmail || '').toLowerCase()),
    [connectedEmails],
  );

  // Send a request. The server is the thing that decides whether it is allowed,
  // so its message is surfaced rather than replaced with something generic.
  const requestConnection = useCallback(async (otherEmail, note = '') => {
    setBusyEmail(otherEmail);
    setError('');
    try {
      await base44.functions.invoke('request-connection', { toEmail: otherEmail, note });
      await reload();
      setBusyEmail(null);
      return { ok: true };
    } catch (err) {
      const data = err?.response?.data;
      const message = data?.error || 'That request could not be sent. Try again in a moment.';
      setError(message);
      setBusyEmail(null);
      return { ok: false, error: message, code: data?.code };
    }
  }, [reload]);

  // Answer a request. Goes through respond-connection rather than updating the
  // row here, because only the recipient may answer and accepting has to notify
  // the other side.
  const respondToConnection = useCallback(async (connectionId, decision) => {
    setBusyEmail(connectionId);
    setError('');
    try {
      await base44.functions.invoke('respond-connection', { connectionId, decision });
      await reload();
      setBusyEmail(null);
      return { ok: true };
    } catch (err) {
      const data = err?.response?.data;
      const message = data?.error || 'Could not answer that request. Try again in a moment.';
      setError(message);
      setBusyEmail(null);
      return { ok: false, error: message, code: data?.code };
    }
  }, [reload]);

  return {
    connections,
    connectedEmails,
    incomingPending,
    outgoingPending,
    loadingConnections: loading,
    busyEmail,
    connectionError: error,
    clearConnectionError: () => setError(''),
    connectionWith,
    isConnected,
    requestConnection,
    respondToConnection,
    reloadConnections: reload,
  };
}
