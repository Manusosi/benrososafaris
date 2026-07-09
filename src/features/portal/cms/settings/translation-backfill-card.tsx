'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { runPublishedContentBackfill } from './translation-actions';

export function TranslationBackfillCard() {
  const [isPending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<string | null>(null);

  function handleBackfill() {
    startTransition(async () => {
      try {
        const { totals } = await runPublishedContentBackfill();
        const summary = [
          `blog ${totals.blog}`,
          `tours ${totals.tours}`,
          `destinations ${totals.destinations}`,
          `experiences ${totals.experiences}`,
          `packages ${totals.packages}`,
          `accommodations ${totals.accommodations}`,
          `parks ${totals.nationalParks}`
        ].join(' · ');

        setLastResult(summary);
        toast.success('Translations generated for all published CMS content.');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Translation backfill failed.');
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Translation</CardTitle>
        <CardDescription>
          Generate Google translations for all already-published CMS content (tours, blog,
          destinations, experiences, packages, accommodations, and parks). Translations run only
          when you click the button below — new publishes are not translated automatically. Requires
          AUTO_TRANSLATE_ENABLED=true and GOOGLE_TRANSLATE_API_KEY in Vercel.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Button isLoading={isPending} onClick={handleBackfill} type='button'>
          <Icons.world className='h-4 w-4' />
          Translate all published content
        </Button>
        {lastResult ? (
          <p className='text-muted-foreground text-sm'>
            Last run: {lastResult} locale rows updated.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
