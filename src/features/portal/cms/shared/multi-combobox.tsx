'use client';

import * as React from 'react';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { CMS_SURFACE } from './surface';

export interface MultiComboboxOption {
  value: string;
  label: string;
}

interface MultiComboboxProps {
  options: MultiComboboxOption[];
  /** Selected option values, in chosen order. */
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  id?: string;
}

/**
 * Multi-select combobox: checkable options with chips for the current
 * selection. The companion to the single-select `Combobox` — used to wire a
 * tour to its national parks, destinations, experiences, accommodations, and
 * fleet. Selection order is preserved (it becomes the saved `position`).
 *
 * The popover is portaled, so it carries `CMS_SURFACE` to stay white + on-brand.
 */
export function MultiCombobox({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyText = 'No results.',
  className,
  id
}: MultiComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const labelByValue = React.useMemo(
    () => new Map(options.map((option) => [option.value, option.label])),
    [options]
  );

  function toggle(next: string) {
    if (value.includes(next)) {
      onChange(value.filter((item) => item !== next));
    } else {
      onChange([...value, next]);
    }
  }

  function remove(next: string) {
    onChange(value.filter((item) => item !== next));
  }

  return (
    <div className='grid gap-2'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='outline'
            id={id}
            className={cn(
              'w-full justify-between font-normal',
              !value.length && 'text-muted-foreground',
              className
            )}
          >
            <span className='truncate'>
              {value.length ? `${value.length} selected` : placeholder}
            </span>
            <Icons.chevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          className={cn('w-(--radix-popover-trigger-width) min-w-[260px] p-0', CMS_SURFACE)}
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const checked = value.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => toggle(option.value)}
                    >
                      <span
                        className={cn(
                          'flex size-4 items-center justify-center rounded border',
                          checked
                            ? 'border-[#3c5142] bg-[#3c5142] text-white'
                            : 'border-muted-foreground/40'
                        )}
                      >
                        {checked ? <Icons.check className='size-3' /> : null}
                      </span>
                      <span className='truncate'>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length ? (
        <div className='flex flex-wrap gap-2'>
          {value.map((item) => (
            <Badge key={item} variant='secondary' className='gap-1 pr-1'>
              {labelByValue.get(item) ?? item}
              <button
                type='button'
                onClick={() => remove(item)}
                className='ml-1 rounded-sm opacity-70 hover:opacity-100'
                aria-label={`Remove ${labelByValue.get(item) ?? item}`}
              >
                <Icons.close className='size-3' />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
