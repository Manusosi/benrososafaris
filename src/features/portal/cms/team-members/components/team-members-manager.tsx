'use client';

import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { getMediaByIds } from '@/features/portal/cms/media/api/client';
import { MediaGalleryField } from '@/features/portal/cms/media/components/media-picker';
import { CMS_SURFACE } from '@/features/portal/cms/shared/surface';
import { cn } from '@/lib/utils';
import { deleteTeamMember, reorderTeamMembers, saveTeamMember } from '../api/service';
import {
  TEAM_MEMBER_ROLE_OPTIONS,
  TEAM_MEMBER_STATUS_OPTIONS,
  isFieldRole,
  teamMemberRoleOption,
  type TeamMemberInput,
  type TeamMemberRoleType,
  type TeamMemberRow
} from '../api/types';

type TeamMembersManagerProps = {
  initialMembers: TeamMemberRow[];
};

type FormState = TeamMemberInput;

function emptyForm(roleType: TeamMemberRoleType = 'staff'): FormState {
  return {
    roleType,
    mediaId: null,
    name: '',
    jobTitle: '',
    email: null,
    phone: null,
    yearsExperience: null,
    bio: '',
    status: 'draft'
  };
}

function TeamMemberFormDialog({
  open,
  onOpenChange,
  initial,
  onSaved
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: FormState;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState<FormState>(initial);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (open) setForm(initial);
  }, [open, initial]);

  function handleSave() {
    startTransition(async () => {
      try {
        await saveTeamMember(form);
        toast.success(form.id ? 'Team member updated.' : 'Team member added.');
        onOpenChange(false);
        onSaved();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not save team member.');
      }
    });
  }

  const mediaIds = form.mediaId ? [form.mediaId] : [];
  const roleOption = teamMemberRoleOption(form.roleType);
  const showExperience = isFieldRole(form.roleType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          CMS_SURFACE,
          'max-h-[90vh] overflow-y-auto rounded-[3px] shadow-none sm:max-w-xl'
        )}
      >
        <DialogHeader>
          <DialogTitle>{form.id ? 'Edit team member' : 'Add team member'}</DialogTitle>
          <DialogDescription>
            Choose where this person appears on the About page, then add their public profile
            details.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-5 py-2'>
          <div className='grid gap-2'>
            <Label>Profile category</Label>
            <p className='text-xs text-muted-foreground'>
              Company team profiles appear under Our Team. Guides and drivers have their own tabs.
            </p>
            <div className='grid gap-2 sm:grid-cols-3'>
              {TEAM_MEMBER_ROLE_OPTIONS.map((option) => {
                const selected = form.roleType === option.value;
                return (
                  <button
                    className={cn(
                      'rounded-[3px] border p-3 text-left transition-colors',
                      selected
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                        : 'border-[#E5E7EB] hover:border-[#CBD5E1]'
                    )}
                    key={option.value}
                    onClick={() => setForm((current) => ({ ...current, roleType: option.value }))}
                    type='button'
                  >
                    <span className='block text-sm font-semibold text-[#111827]'>
                      {option.label}
                    </span>
                    <span className='mt-1 block text-xs leading-5 text-[#6B7280]'>
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <MediaGalleryField
            description='Portrait photo shown on the About page team grid.'
            label='Photo'
            multiple={false}
            onChange={(ids) => setForm((current) => ({ ...current, mediaId: ids[0] ?? null }))}
            value={mediaIds}
          />

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='grid gap-2 sm:col-span-2'>
              <Label htmlFor='team-member-name'>Full name</Label>
              <Input
                id='team-member-name'
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder='Gazali Halidu'
                value={form.name}
              />
            </div>

            <div className='grid gap-2 sm:col-span-2'>
              <Label htmlFor='team-member-job-title'>Job title</Label>
              <Input
                id='team-member-job-title'
                onChange={(event) =>
                  setForm((current) => ({ ...current, jobTitle: event.target.value }))
                }
                placeholder={roleOption?.jobTitlePlaceholder ?? 'Job title'}
                value={form.jobTitle}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='team-member-email'>Email</Label>
              <Input
                id='team-member-email'
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value || null }))
                }
                placeholder='name@benrososafaris.com'
                type='email'
                value={form.email ?? ''}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='team-member-phone'>Phone</Label>
              <Input
                id='team-member-phone'
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value || null }))
                }
                placeholder='+254 700 000 000'
                type='tel'
                value={form.phone ?? ''}
              />
            </div>
          </div>

          {showExperience ? (
            <div className='grid gap-2'>
              <Label htmlFor='team-member-years'>Years of experience</Label>
              <Input
                id='team-member-years'
                min={0}
                onChange={(event) => {
                  const raw = event.target.value.trim();
                  setForm((current) => ({
                    ...current,
                    yearsExperience: raw === '' ? null : Math.max(0, Number(raw) || 0)
                  }));
                }}
                type='number'
                value={form.yearsExperience ?? ''}
              />
            </div>
          ) : null}

          <div className='grid gap-2'>
            <div className='flex items-center justify-between gap-3'>
              <Label htmlFor='team-member-bio'>Bio</Label>
              <span className='text-xs text-muted-foreground'>{form.bio.length} / 700</span>
            </div>
            <Textarea
              id='team-member-bio'
              maxLength={700}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
              placeholder='Share background, specialties, languages, and what guests can expect.'
              rows={6}
              value={form.bio}
            />
          </div>

          <div className='grid gap-2'>
            <Label>Status</Label>
            <Select
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  status: value as FormState['status']
                }))
              }
              value={form.status}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={CMS_SURFACE}>
                {TEAM_MEMBER_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} type='button' variant='ghost'>
            Cancel
          </Button>
          <Button disabled={isPending} isLoading={isPending} onClick={handleSave} type='button'>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MemberThumbnail({ mediaId }: { mediaId: string | null }) {
  const { data: assets = [] } = useQuery({
    queryKey: ['media', 'thumb', mediaId],
    queryFn: () => (mediaId ? getMediaByIds([mediaId]) : Promise.resolve([])),
    enabled: Boolean(mediaId)
  });

  const asset = assets[0];
  if (!asset?.url) {
    return (
      <div className='bg-muted flex size-10 items-center justify-center rounded-[3px] border'>
        <Icons.user className='text-muted-foreground size-4' />
      </div>
    );
  }

  return (
    <div className='relative size-10 overflow-hidden rounded-[3px] border'>
      <Image
        alt={asset.alt ?? ''}
        className='object-cover'
        fill
        sizes='40px'
        src={asset.url}
        unoptimized
      />
    </div>
  );
}

export function TeamMembersManager({ initialMembers }: TeamMembersManagerProps) {
  const router = useRouter();
  const [members, setMembers] = React.useState(initialMembers);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<FormState>(emptyForm());
  const [deleteTarget, setDeleteTarget] = React.useState<TeamMemberRow | null>(null);
  const [isDeleting, startDelete] = React.useTransition();
  const [isReordering, startReorder] = React.useTransition();

  React.useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  const grouped = React.useMemo(() => {
    const groups = new Map<TeamMemberRoleType, TeamMemberRow[]>();
    for (const option of TEAM_MEMBER_ROLE_OPTIONS) {
      groups.set(
        option.value,
        members.filter((member) => member.roleType === option.value)
      );
    }
    return groups;
  }, [members]);

  function refresh() {
    router.refresh();
  }

  function openCreate(roleType: TeamMemberRoleType) {
    setEditing(emptyForm(roleType));
    setDialogOpen(true);
  }

  function openEdit(member: TeamMemberRow) {
    setEditing({
      id: member.id,
      roleType: member.roleType,
      mediaId: member.mediaId,
      name: member.name,
      jobTitle: member.jobTitle,
      email: member.email,
      phone: member.phone,
      yearsExperience: member.yearsExperience,
      bio: member.bio,
      status: member.status
    });
    setDialogOpen(true);
  }

  function moveMember(roleType: TeamMemberRoleType, id: string, direction: -1 | 1) {
    const list = [...(grouped.get(roleType) ?? [])];
    const index = list.findIndex((member) => member.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= list.length) return;

    [list[index], list[target]] = [list[target], list[index]];
    const orderedIds = list.map((member) => member.id);
    setMembers((current) => {
      const others = current.filter((member) => member.roleType !== roleType);
      return [...others, ...list];
    });

    startReorder(async () => {
      try {
        await reorderTeamMembers(roleType, orderedIds);
        refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not reorder members.');
        setMembers(initialMembers);
      }
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startDelete(async () => {
      try {
        await deleteTeamMember(deleteTarget.id);
        toast.success('Team member removed.');
        setDeleteTarget(null);
        refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not delete team member.');
      }
    });
  }

  return (
    <div className='space-y-6'>
      <div className={cn(CMS_SURFACE, 'p-6')}>
        <p className='text-sm text-muted-foreground'>
          Manage company team, safari guides, and driver-guides for the public About page. Each
          category has its own tab. Set job titles, contact details, and publish when ready.
        </p>
        <div className='mt-4'>
          <Button onClick={() => openCreate('staff')} size='sm' type='button'>
            <Icons.add className='mr-2 size-4' />
            Add team member
          </Button>
        </div>
      </div>

      {TEAM_MEMBER_ROLE_OPTIONS.map((role) => {
        const list = grouped.get(role.value) ?? [];
        return (
          <div className={CMS_SURFACE} key={role.value}>
            <div className='flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4'>
              <div>
                <h2 className='text-lg font-semibold text-[#111827]'>{role.label}</h2>
                <p className='text-sm text-[#6B7280]'>
                  {list.length} profile{list.length === 1 ? '' : 's'}
                </p>
              </div>
              <Button
                onClick={() => openCreate(role.value)}
                size='sm'
                type='button'
                variant='outline'
              >
                <Icons.add className='mr-2 size-4' />
                Add
              </Button>
            </div>

            {list.length === 0 ? (
              <p className='text-muted-foreground px-6 py-8 text-sm'>
                No profiles in this group yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-12'>Order</TableHead>
                    <TableHead className='w-14'>Photo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Job title</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((member, index) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className='flex flex-col gap-0.5'>
                          <Button
                            aria-label='Move up'
                            className='size-7'
                            disabled={index === 0 || isReordering}
                            onClick={() => moveMember(role.value, member.id, -1)}
                            size='icon'
                            type='button'
                            variant='ghost'
                          >
                            <Icons.chevronUp className='size-4' />
                          </Button>
                          <Button
                            aria-label='Move down'
                            className='size-7'
                            disabled={index === list.length - 1 || isReordering}
                            onClick={() => moveMember(role.value, member.id, 1)}
                            size='icon'
                            type='button'
                            variant='ghost'
                          >
                            <Icons.chevronDown className='size-4' />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <MemberThumbnail mediaId={member.mediaId} />
                      </TableCell>
                      <TableCell className='font-medium'>{member.name}</TableCell>
                      <TableCell className='max-w-[180px]'>
                        <p className='line-clamp-2 text-sm'>{member.jobTitle || '—'}</p>
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-col gap-0.5 text-xs text-muted-foreground'>
                          {member.email ? <span>{member.email}</span> : null}
                          {member.phone ? <span>{member.phone}</span> : null}
                          {!member.email && !member.phone ? <span>—</span> : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.yearsExperience != null ? `${member.yearsExperience} yrs` : '—'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex rounded-[3px] px-2 py-0.5 text-xs font-medium',
                            member.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {member.status}
                        </span>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-1'>
                          <Button
                            onClick={() => openEdit(member)}
                            size='icon'
                            type='button'
                            variant='ghost'
                          >
                            <Icons.edit className='size-4' />
                          </Button>
                          <Button
                            onClick={() => setDeleteTarget(member)}
                            size='icon'
                            type='button'
                            variant='ghost'
                          >
                            <Icons.trash className='text-destructive size-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        );
      })}

      <TeamMemberFormDialog
        initial={editing}
        onOpenChange={setDialogOpen}
        onSaved={refresh}
        open={dialogOpen}
      />

      <Dialog onOpenChange={(open) => !open && setDeleteTarget(null)} open={Boolean(deleteTarget)}>
        <DialogContent className={cn(CMS_SURFACE, 'rounded-[3px] shadow-none')}>
          <DialogHeader>
            <DialogTitle>Remove team member?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `"${deleteTarget.name}" will be permanently removed from the About page.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDeleteTarget(null)} type='button' variant='ghost'>
              Cancel
            </Button>
            <Button
              disabled={isDeleting}
              isLoading={isDeleting}
              onClick={confirmDelete}
              type='button'
              variant='destructive'
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
