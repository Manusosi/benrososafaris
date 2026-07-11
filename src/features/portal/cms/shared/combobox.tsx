'use client';

import * as React from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { CMS_SURFACE } from './surface';

export interface ComboboxOption {
  value: string;
  label: string;
  /** Optional leading glyph (e.g. a flag emoji for countries). */
  icon?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** When true, lets the user create a new option from their search term. */
  creatable?: boolean;
  /** Label prefix for the create row, e.g. "Add country". */
  createLabel?: string;
  /** Fired when a brand-new value is created (parent can persist it). */
  onCreate?: (value: string) => void;
  className?: string;
  id?: string;
  disabled?: boolean;
}

/**
 * Single-select combobox with optional inline creation.
 *
 * Used for country / region pickers: presets render with flags, and any value
 * the user adds is appended to the in-session option list (and selected) so it
 * is instantly reusable. Persisted values then re-appear from the server on the
 * next load — the "pecking list" grows itself.
 *
 * The popover is portaled, so it carries `CMS_SURFACE` to stay white + on-brand
 * instead of inheriting the dark root theme.
 */
export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyText = 'No results.',
  creatable = false,
  createLabel = 'Add',
  onCreate,
  className,
  id,
  disabled = false
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [created, setCreated] = React.useState<ComboboxOption[]>([]);

  const allOptions = React.useMemo(() => {
    const seen = new Set<string>();
    const merged: ComboboxOption[] = [];
    for (const option of [...options, ...created]) {
      const key = option.value.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(option);
    }
    return merged;
  }, [options, created]);

  const selected = allOptions.find((option) => option.value.toLowerCase() === value.toLowerCase());

  const trimmed = query.trim();
  const exactMatch = allOptions.some(
    (option) => option.value.toLowerCase() === trimmed.toLowerCase()
  );
  const showCreate = creatable && trimmed.length > 0 && !exactMatch;

  function select(next: string) {
    onChange(next);
    setOpen(false);
    setQuery('');
  }

  function create() {
    const next: ComboboxOption = { value: trimmed, label: trimmed, icon: '🌍' };
    setCreated((prev) => [...prev, next]);
    onCreate?.(trimmed);
    select(trimmed);
  }

  return (
    <Popover
      open={disabled ? false : open}
      onOpenChange={(next) => {
        if (disabled) return;
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          id={id}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            !selected && 'text-muted-foreground',
            className
          )}
        >
          <span className='flex min-w-0 items-center gap-2 truncate'>
            {selected?.icon ? <span aria-hidden>{selected.icon}</span> : null}
            <span className='truncate'>{selected?.label ?? placeholder}</span>
          </span>
          <Icons.chevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className={cn('w-(--radix-popover-trigger-width) min-w-[260px] p-0', CMS_SURFACE)}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} value={query} onValueChange={setQuery} />
          <CommandList>
            {!showCreate ? <CommandEmpty>{emptyText}</CommandEmpty> : null}
            <CommandGroup>
              {allOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => select(option.value)}
                >
                  {option.icon ? <span aria-hidden>{option.icon}</span> : null}
                  <span className='truncate'>{option.label}</span>
                  <Icons.check
                    className={cn(
                      'ml-auto size-4 text-[#3c5142]',
                      value.toLowerCase() === option.value.toLowerCase()
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            {showCreate ? (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem value={`create-${trimmed}`} onSelect={create}>
                    <Icons.add className='size-4 text-[#3c5142]' />
                    <span className='truncate'>
                      {createLabel} “{trimmed}”
                    </span>
                  </CommandItem>
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
