import { unstable_cache } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { TeamMemberRoleType } from '@/features/portal/cms/team-members/api/types';
import { teamMemberRoleLabel } from '@/features/portal/cms/team-members/api/types';
import { createEnquiryPublicClient } from '@/lib/supabase/service-role';

export type PublicTeamMember = {
  id: string;
  roleType: TeamMemberRoleType;
  roleLabel: string;
  name: string;
  jobTitle: string;
  email: string | null;
  phone: string | null;
  yearsExperience: number | null;
  bio: string;
  imageUrl: string | null;
  imageAlt: string | null;
};

async function publicClient(): Promise<SupabaseClient> {
  return createEnquiryPublicClient() as unknown as SupabaseClient;
}

async function fetchPublishedTeamMembers(): Promise<PublicTeamMember[]> {
  const supabase = await publicClient();

  const { data, error } = await supabase
    .from('team_members')
    .select(
      'id, role_type, name, job_title, email, phone, years_experience, bio, position, media:media_assets!team_members_media_id_fkey(url, alt)'
    )
    .eq('status', 'published')
    .order('role_type', { ascending: true })
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (error || !data?.length) return [];

  return data.map((row) => {
    const media = Array.isArray(row.media) ? row.media[0] : row.media;
    return {
      id: row.id as string,
      roleType: row.role_type as TeamMemberRoleType,
      roleLabel: teamMemberRoleLabel(row.role_type as TeamMemberRoleType),
      name: row.name as string,
      jobTitle: ((row.job_title as string) ?? '').trim(),
      email: (row.email as string | null) ?? null,
      phone: (row.phone as string | null) ?? null,
      yearsExperience: (row.years_experience as number | null) ?? null,
      bio: (row.bio as string) ?? '',
      imageUrl: (media?.url as string | null) ?? null,
      imageAlt: (media?.alt as string | null) ?? `${row.name} portrait`
    };
  });
}

export async function getPublishedTeamMembers(): Promise<PublicTeamMember[]> {
  return unstable_cache(fetchPublishedTeamMembers, ['published-team-members'], {
    revalidate: 300,
    tags: ['team-members']
  })();
}

export function groupTeamMembersByRole(
  members: PublicTeamMember[]
): Record<TeamMemberRoleType, PublicTeamMember[]> {
  return {
    staff: members.filter((member) => member.roleType === 'staff'),
    safari_guide: members.filter((member) => member.roleType === 'safari_guide'),
    driver: members.filter((member) => member.roleType === 'driver')
  };
}
