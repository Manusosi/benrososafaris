'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { addSubscriber } from '../service';
import type { CampaignRow, SubscriberRow, SubscriberStats } from '../types';
import { CampaignComposer } from './campaign-composer';
import { SubscribersTable } from './subscribers-table';

interface SubscribersManagerProps {
  subscribers: SubscriberRow[];
  stats: SubscriberStats;
  campaigns: CampaignRow[];
}

type TrendTone = 'positive' | 'negative' | 'neutral';
interface Trend {
  direction: 'up' | 'down' | 'flat';
  tone: TrendTone;
  /** Short value shown inside the indicator pill, e.g. "12" or "+3". */
  value: string;
  /** Context line shown beneath the metric, e.g. "new · last 30 days". */
  caption: string;
}

function buildTrend(
  last: number,
  prev: number,
  options: { upIsGood: boolean; value: string; caption: string }
): Trend {
  const direction = last > prev ? 'up' : last < prev ? 'down' : 'flat';
  const tone: TrendTone =
    direction === 'flat'
      ? 'neutral'
      : (direction === 'up') === options.upIsGood
        ? 'positive'
        : 'negative';
  return { direction, tone, value: options.value, caption: options.caption };
}

function StatCard({ label, value, trend }: { label: string; value: number; trend: Trend }) {
  const Icon =
    trend.direction === 'up'
      ? Icons.trendingUp
      : trend.direction === 'down'
        ? Icons.trendingDown
        : Icons.minus;
  const pillTone =
    trend.tone === 'positive'
      ? 'bg-emerald-50 text-emerald-700'
      : trend.tone === 'negative'
        ? 'bg-red-50 text-red-700'
        : 'bg-muted text-muted-foreground';

  return (
    <div className='rounded-[5px] border bg-card p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='text-muted-foreground text-xs font-medium uppercase tracking-wide'>
            {label}
          </p>
          <p className='mt-1 text-2xl font-semibold leading-none'>{value}</p>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-[5px] px-2 py-1 text-xs font-semibold',
            pillTone
          )}
        >
          <Icon className='size-3.5' />
          {trend.value}
        </span>
      </div>
      <p className='text-muted-foreground mt-2 text-xs'>{trend.caption}</p>
    </div>
  );
}

function toCsv(rows: SubscriberRow[]): string {
  const header = ['Email', 'Name', 'Status', 'Locale', 'Source', 'Subscribed'];
  const lines = rows.map((row) =>
    [
      row.email,
      row.name ?? '',
      row.status,
      row.locale,
      row.source ?? '',
      new Date(row.subscribedAt).toISOString()
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(',')
  );
  return [header.join(','), ...lines].join('\n');
}

function AddSubscriberDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [isPending, startTransition] = React.useTransition();

  function handleAdd() {
    startTransition(async () => {
      try {
        await addSubscriber({ email, name });
        toast.success('Subscriber added.');
        setEmail('');
        setName('');
        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not add subscriber.');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm'>
          <Icons.add className='mr-2 size-4' />
          Add subscriber
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add subscriber</DialogTitle>
          <DialogDescription>
            Manually add someone to the newsletter list (e.g. from an event or referral).
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-2'>
          <div className='grid gap-2'>
            <Label htmlFor='new-subscriber-email'>Email</Label>
            <Input
              id='new-subscriber-email'
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder='person@example.com'
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='new-subscriber-name'>Name (optional)</Label>
            <Input
              id='new-subscriber-name'
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder='Jane Doe'
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAdd} isLoading={isPending} disabled={!email.trim()}>
            Add subscriber
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SubscribersManager({ subscribers, stats, campaigns }: SubscribersManagerProps) {
  const [tab, setTab] = React.useState('subscribers');

  function handleExport() {
    const blob = new Blob([toCsv(subscribers)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `benroso-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const totalTrend = buildTrend(stats.signupsLast30, stats.signupsPrev30, {
    upIsGood: true,
    value: String(stats.signupsLast30),
    caption: 'new sign-ups · last 30 days'
  });
  const netActive = stats.signupsLast30 - stats.unsubLast30;
  const netActivePrev = stats.signupsPrev30 - stats.unsubPrev30;
  const activeTrend = buildTrend(netActive, netActivePrev, {
    upIsGood: true,
    value: `${netActive >= 0 ? '+' : ''}${netActive}`,
    caption: 'net change · last 30 days'
  });
  const unsubTrend = buildTrend(stats.unsubLast30, stats.unsubPrev30, {
    upIsGood: false,
    value: String(stats.unsubLast30),
    caption: 'opt-outs · last 30 days'
  });

  return (
    <Tabs value={tab} onValueChange={setTab} className='space-y-4'>
      {/* Top toolbar: tab switch on the left, contextual actions on the right. */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <TabsList>
          <TabsTrigger value='subscribers'>Subscribers</TabsTrigger>
          <TabsTrigger value='campaigns'>Campaigns</TabsTrigger>
        </TabsList>
        {tab === 'subscribers' ? (
          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={handleExport}
              disabled={!subscribers.length}
            >
              <Icons.download className='mr-2 size-4' />
              Export CSV
            </Button>
            <AddSubscriberDialog />
          </div>
        ) : null}
      </div>

      <div className='grid gap-4 sm:grid-cols-3'>
        <StatCard label='Total subscribers' value={stats.total} trend={totalTrend} />
        <StatCard label='Active' value={stats.subscribed} trend={activeTrend} />
        <StatCard label='Unsubscribed' value={stats.unsubscribed} trend={unsubTrend} />
      </div>

      <TabsContent value='subscribers'>
        <SubscribersTable rows={subscribers} />
      </TabsContent>
      <TabsContent value='campaigns'>
        <CampaignComposer subscribedCount={stats.subscribed} campaigns={campaigns} />
      </TabsContent>
    </Tabs>
  );
}
