'use client';

import * as React from 'react';
import Link from 'next/link';

import { Icons } from '@/components/icons';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export function toggleFilterValue(current: string[], value: string): string[] {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

type ListingFiltersProps = {
  activeCount?: number;
  children: React.ReactNode;
  className?: string;
  clearHref?: string;
  clearLabel?: string;
  onClear?: () => void;
  title?: string;
};

/** Shared sidebar chrome for catalog filters (tours, stays, destinations, parks, experiences). */
export function ListingFilters({
  activeCount = 0,
  children,
  className,
  clearHref,
  clearLabel = 'Clear filters',
  onClear,
  title = 'Filter'
}: ListingFiltersProps) {
  const showClear = activeCount > 0 && (onClear || clearHref);

  return (
    <div className={cn('benroso-listing-filters', className)}>
      <div className='benroso-listing-filters__header'>
        <h2 className='benroso-listing-filters__title'>{title}</h2>
        {showClear ? (
          onClear ? (
            <button className='benroso-listing-filters__clear' onClick={onClear} type='button'>
              {clearLabel}
            </button>
          ) : (
            <Link className='benroso-listing-filters__clear' href={clearHref!} scroll={false}>
              {clearLabel}
            </Link>
          )
        ) : null}
      </div>
      {activeCount > 0 ? (
        <p className='benroso-listing-filters__active'>
          {activeCount} active {activeCount === 1 ? 'filter' : 'filters'}
        </p>
      ) : null}
      <div className='benroso-listing-filters__body'>{children}</div>
    </div>
  );
}

export function ListingFilterGroup({
  children,
  hint,
  title
}: {
  children: React.ReactNode;
  hint?: string;
  title: string;
}) {
  return (
    <section className='benroso-listing-filters__group'>
      <div className='benroso-listing-filters__group-head'>
        <h3 className='benroso-listing-filters__group-title'>{title}</h3>
        {hint ? <p className='benroso-listing-filters__hint'>{hint}</p> : null}
      </div>
      <ul className='benroso-listing-filters__list'>{children}</ul>
    </section>
  );
}

type ListingFilterDropdownProps = {
  children: React.ReactNode;
  defaultOpen?: boolean;
  emptyLabel?: string;
  hint?: string;
  selectedCount?: number;
  title: string;
  triggerLabel?: string;
};

/** Collapsible multi-select for longer facet lists from real catalog data. */
export function ListingFilterDropdown({
  children,
  defaultOpen = false,
  emptyLabel = 'None selected',
  hint,
  selectedCount = 0,
  title,
  triggerLabel
}: ListingFilterDropdownProps) {
  const [open, setOpen] = React.useState(defaultOpen || selectedCount > 0);
  const panelId = React.useId();

  React.useEffect(() => {
    if (selectedCount > 0) setOpen(true);
  }, [selectedCount]);

  const summary = selectedCount > 0 ? `${selectedCount} selected` : (triggerLabel ?? emptyLabel);

  return (
    <section className='benroso-listing-filters__group'>
      <div className='benroso-listing-filters__group-head'>
        <h3 className='benroso-listing-filters__group-title'>{title}</h3>
        {hint ? <p className='benroso-listing-filters__hint'>{hint}</p> : null}
      </div>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className={cn('benroso-listing-filters__dropdown-trigger', open && 'is-open')}
        onClick={() => setOpen((value) => !value)}
        type='button'
      >
        <span className={cn(selectedCount > 0 && 'is-active')}>{summary}</span>
        <Icons.chevronDown
          aria-hidden
          className={cn(
            'size-4 shrink-0 text-[var(--benroso-muted)] transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>
      {open ? (
        <ul className='benroso-listing-filters__dropdown-panel' id={panelId}>
          {children}
        </ul>
      ) : null}
    </section>
  );
}

type ListingFilterOptionProps = {
  checked: boolean;
  count?: number;
  id: string;
  label: string;
  name?: string;
  onChange: () => void;
  type?: 'checkbox' | 'radio';
};

/**
 * Native input stays for a11y/form state; the visible tick/dot is a span so checked
 * state always renders reliably across browsers (input ::after is inconsistent).
 */
export function ListingFilterOption({
  checked,
  count,
  id,
  label,
  name,
  onChange,
  type = 'checkbox'
}: ListingFilterOptionProps) {
  return (
    <li>
      <label className={cn('benroso-listing-filters__option', checked && 'is-active')} htmlFor={id}>
        <input
          checked={checked}
          className='benroso-listing-filters__native'
          id={id}
          name={name}
          onChange={onChange}
          type={type}
        />
        <span
          aria-hidden
          className={cn(
            type === 'radio'
              ? 'benroso-listing-filters__radio'
              : 'benroso-listing-filters__checkbox',
            checked && 'is-checked'
          )}
        />
        <span className='benroso-listing-filters__option-label'>{label}</span>
        {typeof count === 'number' ? (
          <span className='benroso-listing-filters__count'>{count}</span>
        ) : null}
      </label>
    </li>
  );
}

/** Single-select nav row (server-rendered links) — destinations country filter. */
export function ListingFilterNavItem({
  active,
  count,
  href,
  label
}: {
  active: boolean;
  count?: number;
  href: string;
  label: string;
}) {
  return (
    <li>
      <Link
        aria-current={active ? 'page' : undefined}
        className={cn('benroso-listing-filters__option', active && 'is-active')}
        href={href}
        scroll={false}
      >
        <span
          aria-hidden
          className={cn('benroso-listing-filters__radio', active && 'is-checked')}
        />
        <span className='benroso-listing-filters__option-label'>{label}</span>
        {typeof count === 'number' ? (
          <span className='benroso-listing-filters__count'>{count}</span>
        ) : null}
      </Link>
    </li>
  );
}

type ListingFilterRangeProps = {
  max: number;
  min: number;
  onCommit: (value: [number, number]) => void;
  onValueChange: (value: [number, number]) => void;
  step?: number;
  suffix?: string;
  title: string;
  value: [number, number];
};

export function ListingFilterRange({
  max,
  min,
  onCommit,
  onValueChange,
  step = 1,
  suffix,
  title,
  value
}: ListingFilterRangeProps) {
  const commitTimerRef = React.useRef<number | null>(null);

  const formatValue = (amount: number) => {
    if (suffix === 'USD') return `$${amount.toLocaleString()}`;
    if (suffix) return `${amount.toLocaleString()} ${suffix}`;
    return amount.toLocaleString();
  };

  function normalizePair(next: number[]): [number, number] {
    const left = Number.isFinite(next[0]) ? next[0] : min;
    const right = Number.isFinite(next[1]) ? next[1] : max;
    return left <= right ? [left, right] : [right, left];
  }

  function handleChange(next: number[]) {
    const pair = normalizePair(next);
    onValueChange(pair);
    // Debounced commit so filters apply even when pointer-up commit is missed.
    if (commitTimerRef.current) window.clearTimeout(commitTimerRef.current);
    commitTimerRef.current = window.setTimeout(() => {
      onCommit(pair);
      commitTimerRef.current = null;
    }, 280);
  }

  React.useEffect(() => {
    return () => {
      if (commitTimerRef.current) window.clearTimeout(commitTimerRef.current);
    };
  }, []);

  return (
    <section className='benroso-listing-filters__group'>
      <div className='benroso-listing-filters__group-head'>
        <h3 className='benroso-listing-filters__group-title'>{title}</h3>
      </div>
      <div className='benroso-listing-filters__range'>
        <Slider
          className='benroso-range-slider'
          max={max}
          min={min}
          step={step}
          value={value}
          onValueChange={handleChange}
          onValueCommit={(next) => {
            const pair = normalizePair(next);
            if (commitTimerRef.current) {
              window.clearTimeout(commitTimerRef.current);
              commitTimerRef.current = null;
            }
            onValueChange(pair);
            onCommit(pair);
          }}
        />
        <div className='benroso-listing-filters__range-values'>
          <span>
            <span className='benroso-listing-filters__range-label'>Min</span>
            <strong>{formatValue(value[0])}</strong>
          </span>
          <span className='text-right'>
            <span className='benroso-listing-filters__range-label'>Max</span>
            <strong>{formatValue(value[1])}</strong>
          </span>
        </div>
      </div>
    </section>
  );
}

export function ListingFilterEmpty({ children }: { children: React.ReactNode }) {
  return <li className='benroso-listing-filters__empty'>{children}</li>;
}
