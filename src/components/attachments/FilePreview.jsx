import React from 'react';
import useTextPreview from '@/components/attachments/useTextPreview';
import { Image } from '@/components/ui/image';
import { FileText } from 'lucide-react';
import Icon from '@/components/kit/Icon';

export default function FilePreview({ file, url, localFile }) {
  const ext = (file.name || '').split('.').pop().toLowerCase();
  const image = ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext);
  const pdf = ext === 'pdf';
  const code = ['txt', 'md', 'csv', 'json', 'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'css', 'html', 'xml', 'yaml', 'yml', 'sql', 'sh', 'c', 'cpp', 'h', 'rs', 'go', 'rb'].includes(ext);
  const text = useTextPreview(code, localFile, url);
  if (!url) return null;
  if (image) return <Image src={url} alt={file.name} fittingType="fit" className="file-prev file-prev-img" />;
  if (pdf) return <iframe src={url} title={`Preview of ${file.name}`} className="file-prev file-prev-frame" sandbox="allow-scripts" />;
  if (text) return <pre className="file-prev file-prev-text">{text}</pre>;
  if (file.kind === 'video' || file.mime?.startsWith('video/')) return <video src={url} controls preload="metadata" className="file-prev file-prev-video" aria-label={file.name} />;
  if (file.kind === 'audio' || file.mime?.startsWith('audio/')) return <audio src={url} controls preload="metadata" className="file-prev" aria-label={file.name} />;
  return <Icon as={FileText} size={28} className="file-prev-none" />;
}
