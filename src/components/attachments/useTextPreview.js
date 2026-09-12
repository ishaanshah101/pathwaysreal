import { useEffect, useState } from 'react';

export default function useTextPreview(enabled, localFile, url) {
  const [text, setText] = useState('');
  useEffect(() => {
    setText('');
    if (!enabled || (!localFile && !url)) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        let result;
        if (localFile) result = await localFile.slice(0, 4000).text();
        else {
          const response = await fetch(url, { signal: controller.signal });
          if (!response.ok || !response.body) throw new Error('Preview unavailable');
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let remaining = 4000;
          result = '';
          while (remaining > 0) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = value.subarray(0, remaining);
            result += decoder.decode(chunk, { stream: true });
            remaining -= chunk.length;
          }
          result += decoder.decode();
          await reader.cancel();
        }
        if (!controller.signal.aborted) setText(result);
      } catch {
        if (!controller.signal.aborted) setText('Text preview unavailable. Use the download link to read this file.');
      }
    };
    load();
    return () => controller.abort();
  }, [enabled, localFile, url]);
  return text;
}