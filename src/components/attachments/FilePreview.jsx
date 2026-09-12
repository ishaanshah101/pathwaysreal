import React from 'react';
import useTextPreview from '@/components/attachments/useTextPreview';
import { Image } from '@/components/ui/image';
import { FileText } from 'lucide-react';

export default function FilePreview({ file, url, localFile }) {
  const ext = (file.name || '').split('.').pop().toLowerCase();
  const image = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext);
  const pdf = ext === 'pdf';
  const code = ['txt', 'md', 'csv', 'json', 'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'css', 'html', 'xml', 'yaml', 'yml', 'sql', 'sh', 'c', 'cpp', 'h', 'rs', 'go', 'rb'].includes(ext);
  const text = useTextPreview(code, localFile, url);
  if (!url) return null;
  if (image) return <Image src={url} alt={file.name} fittingType="fit" className="h-36 w-full rounded-pw-sm" />;
  if (pdf) return <iframe src={url} title={`Preview of ${file.name}`} className="h-40 w-full rounded-pw-sm border border-border" sandbox="allow-scripts" />;
  if (text) return <pre className="max-h-36 overflow-auto rounded-pw-sm bg-muted p-3 text-xs text-foreground whitespace-pre-wrap break-all">{text}</pre>;
  if (file.kind === 'video' || file.mime?.startsWith('video/')) return <video src={url} controls preload="metadata" className="max-h-48 w-full" aria-label={file.name} />;
  if (file.kind === 'audio' || file.mime?.startsWith('audio/')) return <audio src={url} controls preload="metadata" className="w-full" aria-label={file.name} />;
  return <FileText className="h-8 w-8 text-ink-muted" aria-hidden="true" />;
}