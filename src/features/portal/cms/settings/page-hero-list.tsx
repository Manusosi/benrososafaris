'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import type { PageHero } from '@/lib/public/types';
import { PageHeroEditor } from './page-hero-editor';

export type PageHeroListItem = {
  key: string;
  label: string;
  description: string;
  path: string;
  defaultImageUrl: string | null;
  hero: PageHero;
  configured: boolean;
};

function typeLabel(hero: PageHero): string {
  if (hero.type === 'youtube') return 'YouTube';
  if (hero.type === 'image') return 'Single image';
  return 'Slider';
}

export function PageHeroList({ items }: { items: PageHeroListItem[] }) {
  return (
    <Accordion className='space-y-3' collapsible type='single'>
      {items.map((item) => (
        <AccordionItem
          className='rounded-lg border px-4 last:border-b'
          key={item.key}
          value={item.key}
        >
          <AccordionTrigger className='hover:no-underline'>
            <div className='flex flex-1 items-center justify-between gap-3 pr-2'>
              <div>
                <p className='font-medium'>{item.label}</p>
                <p className='text-muted-foreground text-xs font-normal'>{item.description}</p>
              </div>
              <div className='flex items-center gap-2'>
                {item.configured ? (
                  <Badge variant='default'>{typeLabel(item.hero)}</Badge>
                ) : (
                  <Badge variant='secondary'>Default</Badge>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className='space-y-4'>
            <a
              className='text-primary inline-flex items-center gap-1 text-xs hover:underline'
              href={`/en${item.path === '/' ? '' : item.path}`}
              rel='noopener noreferrer'
              target='_blank'
            >
              <Icons.externalLink className='h-3.5 w-3.5' />
              View page
            </a>
            <PageHeroEditor
              defaultImageUrl={item.defaultImageUrl}
              initial={item.hero}
              pageKey={item.key}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
