import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useProfile } from '@/lib/useProfile';

// The people I have blocked. RLS only ever returns my own rows, so a blocked
// person is never told they were blocked. Blocks pointing AT me are invisible
// here on purpose, the send-message function enforces both directions server
// side where it cannot be inspected.
export function useBlocks() {
  const { email } = useProfile();
  const [blocks, setBlocks] = useState([]);
  const [loadingBlocks, setLoadingBlocks] = useState(true);

  const reloadBlocks = useCallback(async () => {
    if (!email) { setBlocks([]); setLoadingBlocks(false); return; }
    try {
      const rows = await base44.entities.Block.filter({ blocker_email: email });
      setBlocks(Array.isArray(rows) ? rows : []);
    } catch {
      setBlocks([]);
    }
    setLoadingBlocks(false);
  }, [email]);

  useEffect(() => { reloadBlocks(); }, [reloadBlocks]);

  const blockedEmails = blocks.map((b) => b.blocked_email);

  const unblock = useCallback(async (blockedEmail) => {
    const row = blocks.find((b) => b.blocked_email === blockedEmail);
    if (!row) return;
    await base44.entities.Block.delete(row.id);
    await reloadBlocks();
  }, [blocks, reloadBlocks]);

  return { blocks, blockedEmails, loadingBlocks, reloadBlocks, unblock };
}

export default useBlocks;