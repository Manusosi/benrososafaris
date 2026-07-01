'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { deleteSubscriber, setSubscriberStatus } from '../service';
import type { SubscriberRow, SubscriberStatus } from '../types';

function statusVariant(status: SubscriberStatus): 'default' | 'secondary' | 'outline' {
  if (status === 'subscribed') return 'default';
  if (status === 'unsubscribed') return 'secondary';
  return 'outline';
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function SubscribersTable({ rows }: { rows: SubscriberRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [, startTransition] = React.useTransition();

  function run(id: string, action: () => Promise<void>, success: string) {
    setPendingId(id);
    startTransition(async () => {
      try {
        await action();
        toast.success(success);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not update subscriber.');
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <div className='overflow-hidden rounded-[5px] border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Subscribed</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className='font-medium'>{row.email}</TableCell>
                <TableCell>{row.name ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                </TableCell>
                <TableCell className='text-muted-foreground text-sm capitalize'>
                  {row.source ?? '—'}
                </TableCell>
                <TableCell className='text-muted-foreground text-sm'>
                  {formatDate(row.subscribedAt)}
                </TableCell>
                <TableCell className='text-right whitespace-nowrap'>
                  {row.status === 'subscribed' ? (
                    <Button
                      size='sm'
                      variant='ghost'
                      disabled={pendingId === row.id}
                      onClick={() =>
                        run(
                          row.id,
                          () => setSubscriberStatus(row.id, 'unsubscribed'),
                          'Marked as unsubscribed.'
                        )
                      }
                    >
                      Unsubscribe
                    </Button>
                  ) : (
                    <Button
                      size='sm'
                      variant='ghost'
                      disabled={pendingId === row.id}
                      onClick={() =>
                        run(
                          row.id,
                          () => setSubscriberStatus(row.id, 'subscribed'),
                          'Re-subscribed.'
                        )
                      }
                    >
                      Re-subscribe
                    </Button>
                  )}
                  <Button
                    size='sm'
                    variant='ghost'
                    className='text-destructive'
                    disabled={pendingId === row.id}
                    onClick={() =>
                      run(row.id, () => deleteSubscriber(row.id), 'Subscriber removed.')
                    }
                    aria-label='Delete subscriber'
                  >
                    <Icons.trash className='size-4' />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className='h-40 text-center'>
                <div className='flex flex-col items-center gap-2 py-6'>
                  <Icons.mail className='text-muted-foreground/50 size-8' />
                  <p className='text-sm font-medium'>No subscribers yet</p>
                  <p className='text-muted-foreground max-w-sm text-sm'>
                    Sign-ups from the website footer appear here automatically. You can also add
                    someone manually with “Add subscriber”.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
