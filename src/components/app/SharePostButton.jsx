import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import Icon from '@/components/kit/Icon';

// Native share sheet where the platform has one, copy-link where it does not.
// The link opens the feed with this post brought to the top and highlighted.
export default function SharePostButton({ post }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/app?post=${encodeURIComponent(post.id)}`;

  const share = async () => {
    const data = { title: post.title || 'Pathways', text: post.title || '', url };
    if (navigator.share) {
      try { await navigator.share(data); return; } catch { /* dismissed, fall through */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked; nothing sensible to do */ }
  };

  return (
    <button type="button" className="tool-btn" onClick={share}>
      <Icon as={copied ? Check : Share2} size={16} />
      {copied ? 'Link copied' : 'Share'}
    </button>
  );
}
