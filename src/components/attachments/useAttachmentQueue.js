import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { registerAttachment } from '@/functions/registerAttachment';

const MB = 1024 * 1024;
export default function useAttachmentQueue() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const current = useRef([]);
  const previews = useRef(new Set());
  const update = (fn) => { current.current = fn(current.current); setFiles(current.current); };
  useEffect(() => () => { previews.current.forEach((url) => URL.revokeObjectURL(url)); }, []);
  const remove = (key) => {
    const file = current.current.find((f) => f.key === key);
    if (file?.preview) { URL.revokeObjectURL(file.preview); previews.current.delete(file.preview); }
    update((list) => list.filter((f) => f.key !== key));
  };
  const clear = () => { update(() => []); setError(''); previews.current.forEach((url) => URL.revokeObjectURL(url)); previews.current.clear(); };
  const add = async (incoming) => {
    const chosen = Array.from(incoming || []);
    if (!chosen.length) return;
    if (current.current.length + chosen.length > 10) return setError('You can attach 10 files. Remove a file or select fewer.');
    if (chosen.some((f) => f.size > 25 * MB || !f.size)) return setError('Choose nonempty files no larger than 25 MB each.');
    if ([...current.current, ...chosen].reduce((n, f) => n + f.size, 0) > 100 * MB) return setError('Keep the total attachment size at or below 100 MB.');
    setError('');
    const entries = chosen.map((file) => {
      const preview = URL.createObjectURL(file); previews.current.add(preview);
      return { key: crypto.randomUUID(), name: file.name, mime: file.type, size: file.size, preview, localFile: file, status: 'uploading' };
    });
    update((list) => [...list, ...entries]);
    await Promise.all(entries.map(async (entry) => {
      try {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: entry.localFile });
        if (!current.current.some((f) => f.key === entry.key)) return;
        const { data } = await registerAttachment({ file_uri, name: entry.name, mime: entry.mime });
        if (!data?.attachment) throw new Error('The upload could not be registered.');
        update((list) => list.map((f) => f.key === entry.key ? { ...f, ...data.attachment, status: 'ready' } : f));
      } catch (err) {
        update((list) => list.map((f) => f.key === entry.key ? { ...f, status: 'error', error: err?.response?.data?.error || 'Upload failed. Remove this file and try again.' } : f));
      }
    }));
  };
  return { files, error, add, remove, clear, busy: files.some((f) => f.status === 'uploading'), blocked: files.some((f) => f.status !== 'ready'), attachments: files.filter((f) => f.status === 'ready').map(({ id, name, mime, size, kind }) => ({ id, name, mime, size, kind })) };
}