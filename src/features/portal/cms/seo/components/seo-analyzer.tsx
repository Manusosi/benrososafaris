'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { analyzeSeo, type SeoAnalysisInput, type SeoCheckStatus } from '../analyze';

interface SeoAnalyzerProps {
  input: SeoAnalysisInput;
  className?: string;
}

const DOT_COLOR: Record<SeoCheckStatus, string> = {
  good: 'bg-emerald-500',
  warn: 'bg-amber-500',
  bad: 'bg-red-500'
};

const TEXT_COLOR: Record<SeoCheckStatus, string> = {
  good: 'text-emerald-700',
  warn: 'text-amber-700',
  bad: 'text-red-700'
};

/**
 * Live SEO readiness panel — our in-house equivalent of the Yoast/RankMath
 * sidebar. Recomputes the score from the supplied fields and renders a
 * traffic-light checklist. Drop it next to any content form.
 */
export function SeoAnalyzer({ input, className }: SeoAnalyzerProps) {
  const analysis = React.useMemo(() => analyzeSeo(input), [input]);
  const { score, rating, checks, stats } = analysis;

  const barColor =
    rating === 'good' ? 'bg-emerald-500' : rating === 'ok' ? 'bg-amber-500' : 'bg-red-500';
  const scoreColor =
    rating === 'good' ? 'text-emerald-700' : rating === 'ok' ? 'text-amber-700' : 'text-red-700';

  return (
    <div className={cn('rounded-[3px] border border-[#E5E7EB] bg-white', className)}>
      <div className='border-b border-[#E5E7EB] px-4 py-3'>
        <p className='text-muted-foreground text-xs font-semibold uppercase tracking-wide'>
          SEO Readiness
        </p>
        <p className='text-muted-foreground mt-1 text-[11px] leading-snug'>
          Same-site links (paths or benrososafaris.com) count as internal — not outbound.
        </p>
      </div>

      <div className='space-y-3 px-4 py-3'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>Overall score</span>
          <span className={cn('text-2xl font-semibold tabular-nums', scoreColor)}>{score}%</span>
        </div>

        <div
          className='h-2 w-full overflow-hidden rounded-[3px] bg-[#EEF0F2]'
          role='progressbar'
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label='SEO readiness score'
        >
          <div
            className={cn('h-full rounded-[3px] transition-all duration-300', barColor)}
            style={{ width: `${score}%` }}
          />
        </div>

        <dl className='grid grid-cols-3 gap-2 pt-1'>
          <Stat label='Title' value={`${stats.titleLength}`} />
          <Stat label='Meta' value={`${stats.metaLength}`} />
          <Stat label='Words' value={`${stats.wordCount}`} />
        </dl>
      </div>

      <ul className='space-y-2 border-t border-[#E5E7EB] px-4 py-3'>
        {checks.map((check) => (
          <li key={check.id} className='flex items-start gap-2'>
            <span
              className={cn('mt-1.5 size-2 shrink-0 rounded-full', DOT_COLOR[check.status])}
              aria-hidden
            />
            <span className='text-sm'>
              <span className={cn('font-medium', TEXT_COLOR[check.status])}>{check.label}</span>
              <span className='text-muted-foreground'> — {check.message}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-[3px] border border-[#E5E7EB] px-2 py-1.5 text-center'>
      <dd className='text-sm font-semibold tabular-nums'>{value}</dd>
      <dt className='text-muted-foreground text-[10px] uppercase tracking-wide'>{label}</dt>
    </div>
  );
}
