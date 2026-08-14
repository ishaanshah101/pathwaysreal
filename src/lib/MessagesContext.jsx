import React, { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const MessagesContext = createContext(null);

// Module scope on purpose. A ref resets when the provider remounts, which
// happens whenever RequireAuth flips to its spinner and back, and that race
// produced two receipt rows for the same message in production.
const receiptInFlight = new Set();

// One realtime subscription for the whole signed-in app.
//
// It lives above the router so the unread badge keeps counting while the user
// is on the Feed, and so opening Messages does not open a second socket. Both
// the badge and the conversation view read from this same state, which is why
// a new message appears in both places at once without a reload.

export function MessagesProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const email = user?.email || null;

  const [messages, setMessages] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Which conversation is on screen right now. Used to decide whether an
  // arriving message counts as unread or should be marked read immediately.
  const activeThreadRef = useRef(null);
  const setActiveThread = useCallback((other) => { activeThreadRef.current = other; }, []);

  // Latest receipts, readable from callbacks without adding them as a
  // dependency. Reading state inside a setState updater would be a side effect
  // in a place React is allowed to run twice.
  const receiptsRef = useRef([]);
  useEffect(() => { receiptsRef.current = receipts; }, [receipts]);

  // A reload in flight. The mount effect, the 20s poll, and a visibilitychange
  // can all fire reload() at the same instant, which duplicated the list calls.
  const reloadInFlight = useRef(false);


  const upsert = useCallback((setter) => (row) => {
    if (!row?.id) return;
    setter((prev) => {
      const i = prev.findIndex((r) => r.id === row.id);
      if (i === -1) return [...prev, row];
      const next = prev.slice();
      next[i] = { ...next[i], ...row };
      return next;
    });
  }, []);

  const upsertMessage = useMemo(() => upsert(setMessages), [upsert]);
  const upsertReceipt = useMemo(() => upsert(setReceipts), [upsert]);

  // Confirm delivery for anything addressed to me that has no receipt yet.
  // This is what turns the sender's single tick into a double tick.
  const ensureReceipts = useCallback(async (msgs) => {
    if (!email) return;
    const have = new Set(receiptsRef.current.map((r) => r.message_id));
    const mine = msgs.filter(
      (m) => m.to_email === email && m.id && !String(m.id).startsWith('pending-')
        && !have.has(m.id) && !receiptInFlight.has(m.id),
    );
    if (mine.length === 0) return;

    const nowIso = new Date().toISOString();
    for (const m of mine) {
      receiptInFlight.add(m.id);
      const isOpen = activeThreadRef.current && activeThreadRef.current === m.from_email;
      try {
        // Last line of defence: ask the server before writing. Two tabs, or a
        // remount mid-flight, can still both get past the in-memory guard.
        const existing = await base44.entities.MessageReceipt
          .filter({ message_id: m.id, recipient_email: email })
          .catch(() => []);
        if (Array.isArray(existing) && existing.length > 0) {
          existing.forEach(upsertReceipt);
          continue;
        }

        const created = await base44.entities.MessageReceipt.create({
          message_id: m.id,
          thread_key: m.thread_key,
          recipient_email: email,
          sender_email: m.from_email,
          delivered_at: nowIso,
          // If they are already looking at this conversation, it is read too.
          read_at: isOpen ? nowIso : undefined,
        });
        upsertReceipt(created);
      } catch {
        // A transient failure just means we retry on the next poll.
        receiptInFlight.delete(m.id);
      }
    }
  }, [email, upsertReceipt]);

  const reload = useCallback(async () => {
    if (!email) { setMessages([]); setReceipts([]); setLoading(false); return; }
    if (reloadInFlight.current) return;
    reloadInFlight.current = true;
    try {
      const [msgs, recs] = await Promise.all([
        base44.entities.Message.list('-created_date', 500).catch(() => []),
        base44.entities.MessageReceipt.list('-created_date', 500).catch(() => []),
      ]);
      const m = Array.isArray(msgs) ? msgs : [];
      const r = Array.isArray(recs) ? recs : [];
      setMessages(m);
      setReceipts(r);
      receiptsRef.current = r;
      ensureReceipts(m);
    } catch {
      setMessages([]);
    }
    setLoading(false);
    reloadInFlight.current = false;
  }, [email, ensureReceipts]);

  useEffect(() => { reload(); }, [reload]);

  // Realtime. Without this, a message only showed up when the recipient
  // reloaded the page, which is the bug this whole file exists to fix.
  useEffect(() => {
    if (!isAuthenticated || !email) return undefined;
    const subs = [];

    try {
      subs.push(base44.entities.Message.subscribe((event) => {
        if (!event?.data) return;
        const row = { id: event.id, ...event.data };
        if (event.type === 'delete') {
          setMessages((prev) => prev.filter((m) => m.id !== event.id));
          return;
        }
        // Only care about conversations this person is part of.
        if (row.to_email !== email && row.from_email !== email) return;
        upsertMessage(row);
        if (row.to_email === email) ensureReceipts([row]);
      }));
    } catch { /* realtime unavailable, polling below still covers it */ }

    try {
      subs.push(base44.entities.MessageReceipt.subscribe((event) => {
        if (!event?.data) return;
        if (event.type === 'delete') {
          setReceipts((prev) => prev.filter((r) => r.id !== event.id));
          return;
        }
        const row = { id: event.id, ...event.data };
        if (row.sender_email !== email && row.recipient_email !== email) return;
        upsertReceipt(row);
      }));
    } catch { /* as above */ }

    return () => { subs.forEach((fn) => { try { fn?.(); } catch { /* noop */ } }); };
  }, [isAuthenticated, email, upsertMessage, upsertReceipt, ensureReceipts]);

  // Safety net. If the socket drops silently, a slow poll still delivers
  // messages without the user having to reload the page themselves.
  useEffect(() => {
    if (!isAuthenticated || !email) return undefined;
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') reload();
    }, 20000);
    const onVisible = () => { if (document.visibilityState === 'visible') reload(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVisible); };
  }, [isAuthenticated, email, reload]);

  // If duplicates exist from before this was fixed, the most-progressed one
  // wins. Otherwise a read message could keep showing as merely delivered.
  const receiptByMessage = useMemo(() => {
    const rank = (r) => (r?.read_at ? 2 : r?.delivered_at ? 1 : 0);
    const map = new Map();
    for (const r of receipts) {
      if (!r.message_id) continue;
      const prev = map.get(r.message_id);
      if (!prev || rank(r) > rank(prev)) map.set(r.message_id, r);
    }
    return map;
  }, [receipts]);

  // Unread = addressed to me, and either no receipt yet or one without read_at.
  const unreadByThread = useMemo(() => {
    const counts = {};
    for (const m of messages) {
      if (m.to_email !== email) continue;
      const r = receiptByMessage.get(m.id);
      if (r?.read_at) continue;
      counts[m.from_email] = (counts[m.from_email] || 0) + 1;
    }
    return counts;
  }, [messages, email, receiptByMessage]);

  const unreadTotal = useMemo(
    () => Object.values(unreadByThread).reduce((a, b) => a + b, 0),
    [unreadByThread],
  );

  // Called when a conversation is opened or is already open when mail arrives.
  const markThreadRead = useCallback(async (otherEmail) => {
    if (!email || !otherEmail) return;
    const nowIso = new Date().toISOString();
    const targets = messages.filter((m) => m.to_email === email && m.from_email === otherEmail);
    for (const m of targets) {
      const r = receiptByMessage.get(m.id);
      try {
        if (!r) {
          const created = await base44.entities.MessageReceipt.create({
            message_id: m.id,
            thread_key: m.thread_key,
            recipient_email: email,
            sender_email: m.from_email,
            delivered_at: nowIso,
            read_at: nowIso,
          });
          upsertReceipt(created);
        } else if (!r.read_at) {
          const updated = await base44.entities.MessageReceipt.update(r.id, { read_at: nowIso });
          upsertReceipt(updated || { ...r, read_at: nowIso });
        }
      } catch { /* leave it unread rather than block the UI */ }
    }
  }, [email, messages, receiptByMessage, upsertReceipt]);

  // Optimistic send: the bubble appears instantly with a single tick, then the
  // real row replaces it once the server confirms.
  const sendMessage = useCallback(async ({ toEmail, threadKey, body, fromName }) => {
    const tempId = `pending-${Date.now()}`;
    const optimistic = {
      id: tempId, pending: true, thread_key: threadKey,
      from_email: email, from_name: fromName || '', to_email: toEmail,
      body, created_date: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const created = await base44.entities.Message.create({
        thread_key: threadKey, from_email: email, from_name: fromName || '',
        to_email: toEmail, body,
      });
      setMessages((prev) => prev.map((m) => (m.id === tempId ? created : m)));
      return created;
    } catch (err) {
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, failed: true, pending: false } : m)));
      throw err;
    }
  }, [email]);

  const value = useMemo(() => ({
    messages, receipts, receiptByMessage, loading,
    unreadByThread, unreadTotal,
    markThreadRead, sendMessage, setActiveThread, reload,
  }), [messages, receipts, receiptByMessage, loading, unreadByThread, unreadTotal,
    markThreadRead, sendMessage, setActiveThread, reload]);

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) {
    // Rendered outside the provider (for example on a public page).
    return {
      messages: [], receipts: [], receiptByMessage: new Map(), loading: false,
      unreadByThread: {}, unreadTotal: 0,
      markThreadRead: async () => {}, sendMessage: async () => {},
      setActiveThread: () => {}, reload: async () => {},
    };
  }
  return ctx;
}

// Delivery state for one of my own messages, in WhatsApp's vocabulary.
export function deliveryStateOf(message, receipt) {
  if (message?.failed) return 'failed';
  if (message?.pending) return 'sending';
  if (receipt?.read_at) return 'read';
  if (receipt?.delivered_at) return 'delivered';
  return 'sent';
}