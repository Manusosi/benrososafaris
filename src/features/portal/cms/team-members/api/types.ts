export type TeamMemberRoleType = 'staff' | 'safari_guide' | 'driver';

export type TeamMemberStatus = 'draft' | 'published';

export type TeamMemberRow = {
  id: string;
  roleType: TeamMemberRoleType;
  mediaId: string | null;
  name: string;
  jobTitle: string;
  email: string | null;
  phone: string | null;
  yearsExperience: number | null;
  bio: string;
  status: TeamMemberStatus;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type TeamMemberInput = {
  id?: string;
  roleType: TeamMemberRoleType;
  mediaId: string | null;
  name: string;
  jobTitle: string;
  email: string | null;
  phone: string | null;
  yearsExperience: number | null;
  bio: string;
  status: TeamMemberStatus;
};

export const TEAM_MEMBER_ROLE_OPTIONS: Array<{
  value: TeamMemberRoleType;
  label: string;
  description: string;
  jobTitlePlaceholder: string;
}> = [
  {
    value: 'staff',
    label: 'Company Team',
    description: 'Leadership, reservations, operations, and guest care in Nairobi.',
    jobTitlePlaceholder: 'Chief Executive Officer (CEO)'
  },
  {
    value: 'safari_guide',
    label: 'Safari Guide',
    description: 'Professional guides who lead game drives, walks, and park interpretation.',
    jobTitlePlaceholder: 'Senior Safari Guide'
  },
  {
    value: 'driver',
    label: 'Driver-Guide',
    description:
      'Skilled drivers who handle routes, wildlife spotting, and guest safety on the road.',
    jobTitlePlaceholder: 'Senior Driver-Guide'
  }
];

export const TEAM_MEMBER_STATUS_OPTIONS: Array<{ value: TeamMemberStatus; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' }
];

export function teamMemberRoleLabel(roleType: TeamMemberRoleType): string {
  return TEAM_MEMBER_ROLE_OPTIONS.find((option) => option.value === roleType)?.label ?? roleType;
}

export function teamMemberRoleOption(roleType: TeamMemberRoleType) {
  return TEAM_MEMBER_ROLE_OPTIONS.find((option) => option.value === roleType);
}

export function isFieldRole(roleType: TeamMemberRoleType): boolean {
  return roleType === 'safari_guide' || roleType === 'driver';
}
