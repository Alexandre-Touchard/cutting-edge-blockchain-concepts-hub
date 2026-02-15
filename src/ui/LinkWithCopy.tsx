import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from './toast';

export default function LinkWithCopy({
  href,
  label,
  className = 'text-xs text-blue-300 hover:text-blue-200 underline',
  copyAriaLabel = 'Copy link'
}: {
  href: string;
  label: React.ReactNode;
  className?: string;
  copyAriaLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      toast('Copied link');
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Fallback for older browsers / blocked clipboard
      const ta = document.createElement('textarea');
      ta.value = href;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      toast('Copied link');
      window.setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center justify-center rounded border border-slate-600 bg-slate-800 px-2 py-1 text-slate-200 hover:bg-slate-700"
        aria-label={copyAriaLabel}
        title={copied ? 'Copied!' : 'Copy link'}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </span>
  );
}
