'use client';

import * as React from 'react';

import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface LocationMapFieldProps {
  id?: string;
  label?: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LocationMapField({
  id = 'location-map-query',
  label = 'Map location',
  description = 'Search for the property on the map. This preview appears on the public detail sidebar.',
  value,
  onChange,
  placeholder = 'e.g. Aberdare Country Club, Nyeri, Kenya',
  className
}: LocationMapFieldProps) {
  const [draft, setDraft] = React.useState(value);
  React.useEffect(() => {
    setDraft(value);
  }, [value]);

  const query = value.trim();
  const encodedQuery = encodeURIComponent(query || 'East Africa');
  const mapSrc = `https://maps.google.com/maps?q=${encodedQuery}&output=embed`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

  function applySearch() {
    onChange(draft.trim());
  }

  return (
    <div className={cn('grid gap-4', className)}>
      <div className='grid gap-2'>
        <Label htmlFor={id}>{label}</Label>
        <div className='flex gap-2'>
          <Input
            id={id}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                applySearch();
              }
            }}
            placeholder={placeholder}
          />
          <button
            type='button'
            className='inline-flex shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors hover:bg-muted'
            onClick={applySearch}
          >
            <Icons.search className='size-4' />
            Locate
          </button>
        </div>
        {description ? <p className='text-muted-foreground text-xs'>{description}</p> : null}
      </div>

      <div className='overflow-hidden rounded-md border bg-muted/20'>
        <iframe
          allowFullScreen
          className='h-48 w-full border-0'
          loading='lazy'
          referrerPolicy='no-referrer-when-downgrade'
          sandbox='allow-scripts allow-same-origin allow-popups'
          src={mapSrc}
          title='Accommodation location map preview'
        />
        {query ? (
          <div className='border-t px-3 py-2'>
            <a
              className='text-muted-foreground inline-flex items-center gap-1.5 text-xs hover:text-foreground'
              href={mapsUrl}
              rel='noopener noreferrer'
              target='_blank'
            >
              Open in Google Maps
              <Icons.externalLink className='size-3.5' />
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
