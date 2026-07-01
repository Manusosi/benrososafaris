'use client';

import * as React from 'react';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

function currentUrl() {
  return typeof window === 'undefined' ? '' : window.location.href;
}

function openIntent(intent: string) {
  window.open(intent, '_blank', 'noopener,noreferrer,width=600,height=540');
}

/** Top-of-article social sharing row. Builds intents from the live URL. */
export function ArticleShare({ title, className }: { title: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);

  const url = () => encodeURIComponent(currentUrl());
  const text = () => encodeURIComponent(title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable — no-op.
    }
  }

  const buttonClass =
    'inline-flex size-9 items-center justify-center rounded-full border border-[var(--benroso-line)] bg-white text-[var(--benroso-ink)] transition-colors hover:border-[var(--benroso-primary)] hover:bg-[var(--benroso-primary)] hover:text-white';

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className='mr-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--benroso-muted)]'>
        <Icons.share className='size-4' />
        Share
      </span>
      <button
        aria-label='Share on X'
        className={buttonClass}
        onClick={() => openIntent(`https://twitter.com/intent/tweet?url=${url()}&text=${text()}`)}
        type='button'
      >
        <Icons.twitter className='size-4' />
      </button>
      <button
        aria-label='Share on Facebook'
        className={buttonClass}
        onClick={() => openIntent(`https://www.facebook.com/sharer/sharer.php?u=${url()}`)}
        type='button'
      >
        <Icons.facebook className='size-4' />
      </button>
      <button
        aria-label='Share on LinkedIn'
        className={buttonClass}
        onClick={() => openIntent(`https://www.linkedin.com/sharing/share-offsite/?url=${url()}`)}
        type='button'
      >
        <Icons.linkedin className='size-4' />
      </button>
      <button
        aria-label='Share on WhatsApp'
        className={buttonClass}
        onClick={() => openIntent(`https://wa.me/?text=${text()}%20${url()}`)}
        type='button'
      >
        <Icons.whatsapp className='size-4' />
      </button>
      <button
        aria-label='Copy link'
        className={cn(
          buttonClass,
          copied && 'border-[var(--benroso-primary)] text-[var(--benroso-primary)]'
        )}
        onClick={copyLink}
        type='button'
      >
        {copied ? <Icons.check className='size-4' /> : <Icons.link className='size-4' />}
      </button>
    </div>
  );
}
