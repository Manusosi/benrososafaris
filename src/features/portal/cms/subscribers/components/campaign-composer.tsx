'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { RichTextEditor } from '@/features/portal/cms/shared/rich-text-editor';
import { sendCampaign, sendCampaignTest } from '../service';
import type { CampaignRow } from '../types';

interface CampaignComposerProps {
  subscribedCount: number;
  campaigns: CampaignRow[];
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className='rounded-[5px] border bg-card'>
      <header className='border-b px-5 py-3'>
        <h3 className='text-sm font-semibold'>{title}</h3>
      </header>
      <div className='p-5'>{children}</div>
    </section>
  );
}

export function CampaignComposer({ subscribedCount, campaigns }: CampaignComposerProps) {
  const router = useRouter();
  const [subject, setSubject] = React.useState('');
  const [preheader, setPreheader] = React.useState('');
  const [bodyHtml, setBodyHtml] = React.useState('');
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isTesting, startTest] = React.useTransition();
  const [isSending, startSend] = React.useTransition();

  const canCompose =
    subject.trim().length > 0 && bodyHtml.replace(/<[^>]+>/g, '').trim().length > 0;

  function handleTest() {
    startTest(async () => {
      const result = await sendCampaignTest({ subject, preheader, bodyHtml });
      if (result.skipped) {
        toast.warning('Email sending is not configured (RESEND_API_KEY missing).');
      } else if (result.ok) {
        toast.success('Test email sent to your address.');
      } else {
        toast.error(result.error ?? 'Could not send the test email.');
      }
    });
  }

  function handleSend() {
    startSend(async () => {
      const result = await sendCampaign({ subject, preheader, bodyHtml });
      setConfirmOpen(false);
      if (result.skipped) {
        toast.warning('Email sending is not configured (RESEND_API_KEY missing).');
      } else if (result.ok) {
        toast.success(`Campaign sent to ${result.sent} subscriber(s).`);
        setSubject('');
        setPreheader('');
        setBodyHtml('');
        router.refresh();
      } else {
        toast.error(result.error ?? 'The campaign failed to send.');
      }
    });
  }

  return (
    <div className='grid gap-6 lg:grid-cols-[1fr_360px]'>
      <Panel title='New campaign'>
        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='campaign-subject'>Subject</Label>
            <Input
              id='campaign-subject'
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder='e.g. New: 7-Day Great Migration Safari'
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='campaign-preheader'>Preheader (preview text)</Label>
            <Input
              id='campaign-preheader'
              value={preheader}
              onChange={(event) => setPreheader(event.target.value)}
              placeholder='Short line shown after the subject in the inbox.'
            />
          </div>
          <div className='grid gap-2'>
            <Label>Content</Label>
            <RichTextEditor
              value={bodyHtml}
              onChange={setBodyHtml}
              placeholder='Share the new destination, article, or offer…'
            />
          </div>
          <div className='flex flex-wrap items-center justify-between gap-3 border-t pt-4'>
            <p className='text-muted-foreground text-sm'>
              {subscribedCount} active subscriber(s) will receive this.
            </p>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={handleTest}
                isLoading={isTesting}
                disabled={!canCompose}
              >
                Send test to me
              </Button>
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={!canCompose || !subscribedCount}
              >
                Send to {subscribedCount} subscriber(s)
              </Button>
            </div>
          </div>
        </div>
      </Panel>

      <Panel title='Past campaigns'>
        <div className='overflow-hidden rounded-[5px] border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length ? (
                campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className='font-medium'>{campaign.subject}</TableCell>
                    <TableCell className='text-muted-foreground text-sm'>
                      {campaign.sentCount}/{campaign.recipientCount}
                    </TableCell>
                    <TableCell>
                      <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className='h-32 text-center'>
                    <div className='flex flex-col items-center gap-2 py-4'>
                      <Icons.send className='text-muted-foreground/50 size-7' />
                      <p className='text-sm font-medium'>No campaigns yet</p>
                      <p className='text-muted-foreground text-xs'>
                        Sent campaigns will be listed here.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Panel>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send this campaign?</DialogTitle>
            <DialogDescription>
              “{subject}” will be emailed to {subscribedCount} active subscriber(s). This cannot be
              undone. We recommend sending a test to yourself first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} isLoading={isSending}>
              Send now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
