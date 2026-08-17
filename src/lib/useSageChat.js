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
  const [folders, setFolders] = useState([]);
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

  const loadFolders = useCallback(async () => {
    try {
      const rows = await base44.entities.SageFolder.list('created_date', 50);
      setFolders(Array.isArray(rows) ? rows : []);
    } catch {
      setFolders([]);
    }
  }, []);

  useEffect(() => {
    if (!enabled) { setLoadingThreads(false); return; }
    loadFolders();
    (async () => {
      const list = await loadThreads();
      setActiveId(list.length ? list[0].id : null);
      setLoadingThreads(false);
    })();
  }, [enabled, loadThreads, loadFolders]);

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

  // Archiving hides a chat from the main list without deleting anything. If
  // the open chat is the one being archived, close it so the main pane does
  // not sit on a conversation the list no longer shows.
  const archiveThread = useCallback(async (id, archived) => {
    setThreads((t) => t.map((x) => (x.id === id ? { ...x, archived } : x)));
    if (archived && id === activeId) { setActiveId(null); setMessages([]); }
    await base44.entities.SageThread.update(id, { archived }).catch(() => loadThreads());
  }, [activeId, loadThreads]);

  const moveThread = useCallback(async (id, folderId) => {
    setThreads((t) => t.map((x) => (x.id === id ? { ...x, folder_id: folderId || '' } : x)));
    await base44.entities.SageThread.update(id, { folder_id: folderId || '' }).catch(() => loadThreads());
  }, [loadThreads]);

  const createFolder = useCallback(async (name) => {
    const clean = name.trim().slice(0, 60);
    if (!clean) return;
    try {
      const me = await base44.auth.me();
      await base44.entities.SageFolder.create({ user_email: me.email, name: clean });
      await loadFolders();
    } catch { /* the folder simply doesn't appear; retry is one click */ }
  }, [loadFolders]);

  const renameFolder = useCallback(async (id, name) => {
    const clean = name.trim().slice(0, 60);
    if (!clean) return;
    setFolders((f) => f.map((x) => (x.id === id ? { ...x, name: clean } : x)));
    await base44.entities.SageFolder.update(id, { name: clean }).catch(() => loadFolders());
  }, [loadFolders]);

  // Deleting a folder never deletes chats: they come out of the folder intact.
  const deleteFolder = useCallback(async (id) => {
    setFolders((f) => f.filter((x) => x.id !== id));
    setThreads((t) => t.map((x) => (x.folder_id === id ? { ...x, folder_id: '' } : x)));
    try {
      const inFolder = await base44.entities.SageThread.filter({ folder_id: id }, '-last_message_at', 100);
      await Promise.all((inFolder || []).map((t) => base44.entities.SageThread.update(t.id, { folder_id: '' }).catch(() => {})));
      await base44.entities.SageFolder.delete(id);
    } catch {
      loadFolders();
      loadThreads();
    }
  }, [loadFolders, loadThreads]);

  return {
    threads, folders, activeId, setActiveId, messages, thinking,
    loadingThreads, loadingMessages,
    ask, newChat, renameThread, deleteThread, archiveThread,
    moveThread, createFolder, renameFolder, deleteFolder,
  };
}