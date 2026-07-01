'use client';

import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getMediaByIds } from '../media/api/client';
import { MediaPickerDialog } from '../media/components/media-picker';

type MediaUrlFieldProps = {
  id?: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  /** Square preview suits favicons/logos; wide suits hero/OG images. */
  previewShape?: 'square' | 'wide';
};

/**
 * A labelled image field backed by the Media Library. Picking an asset resolves
 * its public URL into the field; a manual URL input remains as an escape hatch.
 */
export function MediaUrlField({
  id,
  label,
  value,
  onChange,
  hint,
  previewShape = 'wide'
}: MediaUrlFieldProps) {
  const [open, setOpen] = useState(false);

  async function handleConfirm(ids: string[]) {
    setOpen(false);
    const [first] = ids;
    if (!first) return;
    try {
      const [asset] = await getMediaByIds([first]);
      if (asset?.url) onChange(asset.url);
    } catch {
      toast.error('Could not load the selected image.');
    }
  }

  return (
    <div className='space-y-1.5'>
      <Label htmlFor={id}>{label}</Label>
      <div className='flex items-start gap-3'>
        <div
          className={
            previewShape === 'square'
              ? 'bg-muted relative h-16 w-16 shrink-0 overflow-hidden rounded-md border'
              : 'bg-muted relative h-16 w-28 shrink-0 overflow-hidden rounded-md border'
          }
        >
          {value ? (
            <Image alt='' className='object-contain' fill sizes='112px' src={value} unoptimized />
          ) : (
            <div className='text-muted-foreground flex h-full items-center justify-center'>
              <Icons.media className='h-5 w-5' />
            </div>
          )}
        </div>
        <div className='flex-1 space-y-2'>
          <Input
            id={id}
            onChange={(event) => onChange(event.target.value)}
            placeholder='/assets/your-image.png or https://…'
            value={value}
          />
          <div className='flex items-center gap-2'>
            <Button onClick={() => setOpen(true)} size='sm' type='button' variant='outline'>
              <Icons.media className='h-4 w-4' />
              {value ? 'Replace' : 'Choose'}
            </Button>
            {value ? (
              <Button onClick={() => onChange('')} size='sm' type='button' variant='ghost'>
                <Icons.trash className='h-4 w-4 text-destructive' />
                Remove
              </Button>
            ) : null}
          </div>
          {hint ? <p className='text-muted-foreground text-xs'>{hint}</p> : null}
        </div>
      </div>

      <MediaPickerDialog
        initialSelected={[]}
        multiple={false}
        onConfirm={handleConfirm}
        onOpenChange={setOpen}
        open={open}
      />
    </div>
  );
}
