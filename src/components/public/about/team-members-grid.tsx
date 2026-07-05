'use client';

import * as React from 'react';
import Image from 'next/image';

import { Icons } from '@/components/icons';
import { EmptyState } from '@/components/public/page-shell';
import { PUBLIC_LIGHT_DIALOG } from '@/components/public/ui/public-dialog-surface';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { PublicTeamMember } from '@/lib/public/team';
import { cn } from '@/lib/utils';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80';

function memberDisplayTitle(member: PublicTeamMember): string {
  return member.jobTitle || member.roleLabel;
}

type TeamMemberDetailDialogProps = {
  member: PublicTeamMember | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function TeamMemberDetailDialog({
  member,
  onOpenChange,
  open
}: TeamMemberDetailDialogProps) {
  const imageUrl = member?.imageUrl ?? FALLBACK_IMAGE;
  const title = member ? memberDisplayTitle(member) : '';

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className={cn(
          PUBLIC_LIGHT_DIALOG,
          'team-member-dialog max-h-[min(90vh,620px)] w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-[1.75rem] border border-[var(--benroso-line)] p-0 shadow-2xl sm:max-w-4xl',
          '[&>button]:z-20 [&>button]:text-[var(--benroso-primary-dark)]'
        )}
      >
        <DialogTitle className='sr-only'>
          {member ? `${member.name} profile` : 'Team member profile'}
        </DialogTitle>

        {member ? (
          <div className='grid max-h-[min(90vh,620px)] overflow-hidden md:grid-cols-[minmax(260px,300px)_1fr]'>
            <aside className='relative shrink-0 bg-[var(--benroso-ivory)] px-5 pb-6 pt-7 md:px-6 md:pt-8'>
              <div className='pointer-events-none absolute inset-x-0 top-0 h-14 rounded-t-[1.75rem] bg-gradient-to-b from-[var(--benroso-primary-dark)]/8 to-transparent' />

              <div className='relative mx-auto w-full max-w-[200px]'>
                <div className='relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[var(--benroso-radius)] bg-white shadow-[0_16px_40px_rgba(47,64,52,0.14)] ring-1 ring-[var(--benroso-line)]'>
                  <Image
                    alt={member.imageAlt ?? member.name}
                    className='object-cover object-top'
                    fill
                    sizes='200px'
                    src={imageUrl}
                  />
                </div>
              </div>

              <div className='relative mt-5 text-center'>
                <h2 className='benroso-heading font-display text-xl leading-tight text-[var(--benroso-primary-dark)] md:text-2xl'>
                  {member.name}
                </h2>
                <p className='mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--benroso-muted)]'>
                  {title}
                </p>
              </div>

              <div className='relative mt-4 space-y-2.5 border-t border-[var(--benroso-line)] pt-4'>
                {member.email ? (
                  <a
                    className='flex items-start gap-3 rounded-[var(--benroso-radius)] px-1 py-1 text-sm text-[var(--benroso-ink)] transition-colors hover:text-[var(--benroso-accent)]'
                    href={`mailto:${member.email}`}
                  >
                    <span className='mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-[var(--benroso-primary-dark)] ring-1 ring-[var(--benroso-line)]'>
                      <Icons.mail className='h-4 w-4' />
                    </span>
                    <span className='min-w-0 break-all leading-6'>{member.email}</span>
                  </a>
                ) : null}
                {member.phone ? (
                  <a
                    className='flex items-start gap-3 rounded-[var(--benroso-radius)] px-1 py-1 text-sm text-[var(--benroso-ink)] transition-colors hover:text-[var(--benroso-accent)]'
                    href={`tel:${member.phone}`}
                  >
                    <span className='mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-[var(--benroso-primary-dark)] ring-1 ring-[var(--benroso-line)]'>
                      <Icons.phone className='h-4 w-4' />
                    </span>
                    <span className='leading-6'>{member.phone}</span>
                  </a>
                ) : null}
                {!member.email && !member.phone ? (
                  <p className='text-center text-sm text-[var(--benroso-muted)]'>
                    Contact details available through Benroso Safaris.
                  </p>
                ) : null}
              </div>
            </aside>

            <section className='flex min-h-0 flex-col bg-white md:border-l md:border-[var(--benroso-line)]'>
              <div className='shrink-0 border-b border-[var(--benroso-line)] px-5 py-5 md:px-7'>
                <p className='text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--benroso-accent)]'>
                  Profile
                </p>
                <h3 className='benroso-heading mt-2 font-display text-lg text-[var(--benroso-primary-dark)] md:text-xl'>
                  {member.roleLabel}
                </h3>
                {member.jobTitle && member.jobTitle !== member.roleLabel ? (
                  <p className='mt-1.5 text-sm text-[var(--benroso-muted)]'>{member.jobTitle}</p>
                ) : null}
                {member.yearsExperience != null ? (
                  <p className='mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--benroso-ivory)] px-3 py-1.5 text-sm text-[var(--benroso-ink)]'>
                    <Icons.clock className='h-4 w-4 text-[var(--benroso-accent)]' />
                    {member.yearsExperience} years experience
                  </p>
                ) : null}
              </div>

              <div className='benroso-body min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-7'>
                <p className='text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--benroso-muted)]'>
                  Bio
                </p>
                <p className='mt-3 whitespace-pre-wrap text-[15px] leading-7 text-[var(--benroso-muted)]'>
                  {member.bio || 'Profile details will be added soon.'}
                </p>
              </div>
            </section>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type TeamMemberCardProps = {
  member: PublicTeamMember;
  onSelect: (member: PublicTeamMember) => void;
};

export function TeamMemberCard({ member, onSelect }: TeamMemberCardProps) {
  const imageUrl = member.imageUrl ?? FALLBACK_IMAGE;
  const title = memberDisplayTitle(member);

  return (
    <article className='group mx-auto w-full max-w-[340px]'>
      <div className='relative aspect-[5/4] overflow-hidden rounded-[var(--benroso-radius)] bg-[var(--benroso-ivory)] shadow-[0_8px_24px_rgba(47,64,52,0.08)]'>
        <Image
          alt={member.imageAlt ?? member.name}
          className='object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]'
          fill
          sizes='(max-width:768px) 85vw, 340px'
          src={imageUrl}
        />
      </div>

      <div className='relative z-10 -mt-12 mx-1 bg-white px-6 py-5 text-center shadow-[0_18px_44px_rgba(15,23,42,0.12)] ring-1 ring-[var(--benroso-line)]/70'>
        <h3 className='benroso-heading font-display text-[1.3rem] leading-tight text-[var(--benroso-ink)]'>
          {member.name}
        </h3>
        <p className='mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--benroso-muted)]'>
          {title}
        </p>

        {member.email || member.phone ? (
          <div className='mt-4 flex items-center justify-center gap-3'>
            {member.email ? (
              <a
                className='inline-flex size-10 items-center justify-center rounded-full border border-[var(--benroso-line)] bg-white text-[var(--benroso-primary-dark)] transition-colors hover:border-[var(--benroso-accent)] hover:text-[var(--benroso-accent)]'
                href={`mailto:${member.email}`}
                onClick={(event) => event.stopPropagation()}
              >
                <Icons.mail className='h-4 w-4' />
                <span className='sr-only'>Email {member.name}</span>
              </a>
            ) : null}
            {member.phone ? (
              <a
                className='inline-flex size-10 items-center justify-center rounded-full border border-[var(--benroso-line)] bg-white text-[var(--benroso-primary-dark)] transition-colors hover:border-[var(--benroso-accent)] hover:text-[var(--benroso-accent)]'
                href={`tel:${member.phone}`}
                onClick={(event) => event.stopPropagation()}
              >
                <Icons.phone className='h-4 w-4' />
                <span className='sr-only'>Call {member.name}</span>
              </a>
            ) : null}
          </div>
        ) : null}

        <button
          className='mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--benroso-accent)] transition-colors hover:text-[var(--benroso-primary-dark)]'
          onClick={() => onSelect(member)}
          type='button'
        >
          Read bio
          <Icons.chevronRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5' />
        </button>
      </div>
    </article>
  );
}

type TeamMembersGridProps = {
  emptyActionHref?: string;
  emptyActionLabel?: string;
  emptyMessage?: string;
  emptyTitle?: string;
  members: PublicTeamMember[];
  onReadBio?: (member: PublicTeamMember) => void;
};

export function TeamMembersGrid({
  emptyActionHref,
  emptyActionLabel,
  emptyMessage,
  emptyTitle,
  members,
  onReadBio
}: TeamMembersGridProps) {
  const [selected, setSelected] = React.useState<PublicTeamMember | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  function handleSelect(member: PublicTeamMember) {
    if (onReadBio) {
      onReadBio(member);
      return;
    }
    setSelected(member);
    setDialogOpen(true);
  }

  function handleDialogOpenChange(next: boolean) {
    setDialogOpen(next);
    if (!next) {
      window.setTimeout(() => setSelected(null), 200);
    }
  }

  if (!members.length) {
    if (emptyTitle && emptyMessage) {
      return (
        <EmptyState
          actionHref={emptyActionHref}
          actionLabel={emptyActionLabel}
          message={emptyMessage}
          title={emptyTitle}
        />
      );
    }

    return emptyMessage ? (
      <p className='benroso-body text-sm leading-7 text-[var(--benroso-muted)]'>{emptyMessage}</p>
    ) : null;
  }

  return (
    <>
      <div className='grid justify-items-center gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3'>
        {members.map((member) => (
          <TeamMemberCard key={member.id} member={member} onSelect={handleSelect} />
        ))}
      </div>
      {!onReadBio ? (
        <TeamMemberDetailDialog
          member={selected}
          onOpenChange={handleDialogOpenChange}
          open={dialogOpen}
        />
      ) : null}
    </>
  );
}
