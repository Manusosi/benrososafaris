'use server';

import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';

import { requirePortalSession } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';
import type { TeamMemberInput, TeamMemberRow, TeamMemberRoleType, TeamMemberStatus } from './types';

const WRITE_ROLES = new Set(['owner', 'admin', 'editor']);

async function assertCanWrite() {
  const session = await requirePortalSession();
  if (!WRITE_ROLES.has(session.role)) {
    throw new Error('You do not have permission to manage team members.');
  }
}

async function genericClient(): Promise<SupabaseClient> {
  return (await createClient()) as unknown as SupabaseClient;
}

function mapRow(row: Record<string, unknown>): TeamMemberRow {
  return {
    id: row.id as string,
    roleType: row.role_type as TeamMemberRoleType,
    mediaId: (row.media_id as string | null) ?? null,
    name: row.name as string,
    jobTitle: (row.job_title as string) ?? '',
    email: (row.email as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    yearsExperience: (row.years_experience as number | null) ?? null,
    bio: (row.bio as string) ?? '',
    status: row.status as TeamMemberStatus,
    position: (row.position as number) ?? 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string
  };
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length ? trimmed : null;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function listTeamMembers(): Promise<TeamMemberRow[]> {
  await requirePortalSession();
  const supabase = await genericClient();
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('role_type', { ascending: true })
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function saveTeamMember(input: TeamMemberInput): Promise<TeamMemberRow> {
  await assertCanWrite();

  const name = input.name.trim();
  const jobTitle = input.jobTitle.trim();
  const bio = input.bio.trim();
  const email = normalizeOptionalText(input.email);
  const phone = normalizeOptionalText(input.phone);

  if (name.length < 2) throw new Error('Name must be at least 2 characters.');
  if (!jobTitle.length) throw new Error('Job title is required.');
  if (!bio.length) throw new Error('Bio is required.');
  if (bio.length > 700) throw new Error('Bio must be 700 characters or fewer.');
  if (email && !isValidEmail(email))
    throw new Error('Enter a valid email address or leave it blank.');

  const supabase = await genericClient();
  const now = new Date().toISOString();
  const payload = {
    role_type: input.roleType,
    media_id: input.mediaId,
    name,
    job_title: jobTitle,
    email,
    phone,
    years_experience: input.yearsExperience,
    bio,
    status: input.status,
    updated_at: now
  };

  if (input.id) {
    const { data, error } = await supabase
      .from('team_members')
      .update(payload)
      .eq('id', input.id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    revalidateTeamPaths();
    return mapRow(data as Record<string, unknown>);
  }

  const { data: siblings } = await supabase
    .from('team_members')
    .select('position')
    .eq('role_type', input.roleType)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = ((siblings?.[0]?.position as number | undefined) ?? -1) + 1;

  const { data, error } = await supabase
    .from('team_members')
    .insert({ ...payload, position: nextPosition })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  revalidateTeamPaths();
  return mapRow(data as Record<string, unknown>);
}

export async function deleteTeamMember(id: string): Promise<void> {
  await assertCanWrite();
  const supabase = await genericClient();
  const { error } = await supabase.from('team_members').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidateTeamPaths();
}

export async function reorderTeamMembers(
  roleType: TeamMemberRoleType,
  orderedIds: string[]
): Promise<void> {
  await assertCanWrite();
  const supabase = await genericClient();
  const now = new Date().toISOString();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from('team_members')
        .update({ position: index, updated_at: now })
        .eq('id', id)
        .eq('role_type', roleType)
    )
  );

  revalidateTeamPaths();
}

function revalidateTeamPaths() {
  revalidatePath('/portal/team-members');
  revalidatePath('/en/about');
  revalidatePath('/about');
}
