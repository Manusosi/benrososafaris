'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { PORTAL_ROLES, type PortalRole } from '@/lib/auth/roles';
import type { PortalTeamMember } from '@/features/portal/api/service';
import { changeUserRole, setUserStatus } from './team-actions';

const ROLE_LABELS: Record<PortalRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  editor: 'Editor',
  sales: 'Sales',
  viewer: 'Viewer'
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function initials(name: string | null, email: string | null): string {
  const source = name ?? email ?? '?';
  return source.charAt(0).toUpperCase();
}

function TeamRow({ member, currentUserId }: { member: PortalTeamMember; currentUserId: string }) {
  const [isPending, startTransition] = useTransition();
  const isSelf = member.id === currentUserId;
  const role = (PORTAL_ROLES as readonly string[]).includes(member.role)
    ? (member.role as PortalRole)
    : 'viewer';

  function onRole(next: string) {
    if (next === member.role) return;
    startTransition(async () => {
      try {
        await changeUserRole({ userId: member.id, role: next as PortalRole });
        toast.success('Role updated.');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not update role.');
      }
    });
  }

  function onStatus(next: 'active' | 'disabled') {
    startTransition(async () => {
      try {
        await setUserStatus({ userId: member.id, status: next });
        toast.success(next === 'active' ? 'Member activated.' : 'Member disabled.');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not update status.');
      }
    });
  }

  return (
    <TableRow>
      <TableCell>
        <div className='flex items-center gap-3'>
          <div className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold'>
            {initials(member.full_name, member.email)}
          </div>
          <div className='min-w-0'>
            <p className='truncate font-medium'>{member.full_name ?? 'Unnamed user'}</p>
            <p className='text-muted-foreground truncate text-xs'>{member.email ?? '—'}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={role === 'admin' || role === 'owner' ? 'default' : 'secondary'}>
          {ROLE_LABELS[role]}
        </Badge>
      </TableCell>
      <TableCell>
        <span
          className={
            member.status === 'active'
              ? 'inline-flex items-center gap-1.5 text-sm text-emerald-600'
              : 'text-muted-foreground inline-flex items-center gap-1.5 text-sm'
          }
        >
          <span
            className={
              member.status === 'active'
                ? 'size-1.5 rounded-full bg-emerald-500'
                : 'bg-muted-foreground size-1.5 rounded-full'
            }
          />
          {member.status === 'active' ? 'Active' : 'Disabled'}
        </span>
      </TableCell>
      <TableCell className='text-muted-foreground text-sm'>
        {formatDate(member.created_at)}
      </TableCell>
      <TableCell className='text-muted-foreground text-sm'>
        {formatDate(member.last_sign_in_at)}
      </TableCell>
      <TableCell className='text-right'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label='Actions' disabled={isPending || isSelf} size='icon' variant='ghost'>
              <Icons.dots className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-44'>
            <DropdownMenuLabel>Role</DropdownMenuLabel>
            <DropdownMenuRadioGroup onValueChange={onRole} value={member.role}>
              {PORTAL_ROLES.map((r) => (
                <DropdownMenuRadioItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            {member.status === 'active' ? (
              <DropdownMenuItem onClick={() => onStatus('disabled')} variant='destructive'>
                <Icons.lock className='h-4 w-4' />
                Disable access
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onStatus('active')}>
                <Icons.check className='h-4 w-4' />
                Activate
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export function TeamTable({
  members,
  currentUserId
}: {
  members: PortalTeamMember[];
  currentUserId: string;
}) {
  if (!members.length) {
    return (
      <div className='text-muted-foreground rounded-lg border border-dashed px-6 py-12 text-center text-sm'>
        No team members yet.
      </div>
    );
  }

  return (
    <div className='rounded-lg border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Last sign-in</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TeamRow currentUserId={currentUserId} key={member.id} member={member} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
