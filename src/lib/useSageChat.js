import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Sage answers in plain text. The model still slips in markdown now and then,
// so it is stripped in one place instead of per component.
export function cleanSage(text) {
  let t = String(text);
  t = t.replace(/^#{1,6}\s+/gm, '');
  t = t.replace(/[*_`~]{1,3}/g, '');
  t = t.replace(/^\s*[-•]\s+/gm, '');
  t = t.replace(/^-{3,}\s*$/gm, '');
  t = t.replace(/—|–/g, ', ');
  t = t.replace(/[ \t]{2,}/g, ' ').trim();
  return t;
}

// All Sage conversation state in one place: the list of chats, the messages in
// the open one, and asking a question. Threads and messages are owned rows, so
// the plain client reads only this student's own conversations.
export function useSageChat(enabled) {
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [thinking, setThinking] = useState(false);

  const loadThreads = useCallback(async () => {
    try {
      const rows = await base44.entities.SageThread.list('-last_message_at', 60);
      const list = Array.isArray(rows) ? rows : [];
      setThreads(list);
      return list;
    } catch {
      setThreads([]);
      return [];
    }
  }, []);

  useEffect(() => {
    if (!enabled) { setLoadingThreads(false); return; }
    (async () => {
      const list = await loadThreads();
      setActiveId(list.length ? list[0].id : null);
      setLoadingThreads(false);
    })();
  }, [enabled, loadThreads]);

  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    let cancelled = false;
    setLoadingMessages(true);
    (async () => {
      try {
        const rows = await base44.entities.SageMessage.filter({ thread_id: activeId }, 'created_date', 300);
        if (!cancelled) setMessages(Array.isArray(rows) ? rows : []);
      } catch {
        if (!cancelled) setMessages([]);
      }
      if (!cancelled) setLoadingMessages(false);
    })();
    return () => { cancelled = true; };
  }, [activeId]);

  const ask = useCallback(async (question, attachments = []) => {
    const q = question.trim();
    if (!q || thinking) return;
    setThinking(true);
    setMessages((m) => [
      ...m,
      { id: `local-${Date.now()}`, role: 'user', content: q, attachments },
    ]);

    try {
      // sage-ask checks the subscription, writes both turns, and creates the
      // thread on the first question, so nothing here is trusted.
      const res = await base44.functions.invoke('sage-ask', {
        question: q,
        threadId: activeId || undefined,
        attachments,
      });
      const answer = cleanSage(res?.data?.answer || '');
      setMessages((m) => [...m, { id: `local-a-${Date.now()}`, role: 'assistant', content: answer }]);
      if (res?.data?.threadId && res.data.threadId !== activeId) setActiveId(res.data.threadId);
      loadThreads();
      setThinking(false);
      return { ok: true };
    } catch (err) {
      const data = err?.response?.data;
      setMessages((m) => [
        ...m,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: data?.error || 'Sage could not answer that just now. Try asking again in a moment.',
        },
      ]);
      setThinking(false);
      return { ok: false, code: data?.code };
    }
  }, [activeId, thinking, loadThreads]);

  const newChat = useCallback(() => { setActiveId(null); setMessages([]); }, []);

  const renameThread = useCallback(async (id, title) => {
    const clean = title.trim().slice(0, 120);
    if (!clean) return;
    setThreads((t) => t.map((x) => (x.id === id ? { ...x, title: clean } : x)));
    await base44.entities.SageThread.update(id, { title: clean }).catch(() => loadThreads());
  }, [loadThreads]);

  const deleteThread = useCallback(async (id) => {
    setThreads((t) => t.filter((x) => x.id !== id));
    if (id === activeId) { setActiveId(null); setMessages([]); }
    try {
      const rows = await base44.entities.SageMessage.filter({ thread_id: id }, 'created_date', 300);
      await Promise.all((rows || []).map((m) => base44.entities.SageMessage.delete(m.id).catch(() => {})));
      await base44.entities.SageThread.delete(id);
    } catch {
      loadThreads();
    }
  }, [activeId, loadThreads]);

  return {
    threads, activeId, setActiveId, messages, thinking,
    loadingThreads, loadingMessages,
    ask, newChat, renameThread, deleteThread,
  };
}