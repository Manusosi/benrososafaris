import { TeamMembersGrid } from '@/components/public/about/team-members-grid';
import { SectionHeader } from '@/components/public/ui/section-header';
import { localePath } from '@/lib/public/locale-path';
import type { PublicTeamMember } from '@/lib/public/team';

type TeamMembersSectionProps = {
  anchorId?: string;
  description: string;
  emptyMessage: string;
  emptyTitle: string;
  eyebrow: string;
  locale: string;
  members: PublicTeamMember[];
  onReadBio?: (member: PublicTeamMember) => void;
  title: string;
};

export function TeamMembersSection({
  anchorId = 'team',
  description,
  emptyMessage,
  emptyTitle,
  eyebrow,
  locale,
  members,
  onReadBio,
  title
}: TeamMembersSectionProps) {
  return (
    <div className='space-y-0 bg-white' id={anchorId}>
      <section className='benroso-section'>
        <div className='benroso-container mx-auto max-w-3xl'>
          <SectionHeader description={description} eyebrow={eyebrow} title={title} />
        </div>
      </section>

      <div aria-hidden className='benroso-container'>
        <div className='h-px w-full bg-[var(--benroso-line)]' />
      </div>

      <section className='benroso-section pt-0'>
        <div className='benroso-container'>
          <TeamMembersGrid
            emptyActionHref={localePath(locale, '/contact')}
            emptyActionLabel='Speak with our team'
            emptyMessage={emptyMessage}
            emptyTitle={emptyTitle}
            members={members}
            onReadBio={onReadBio}
          />
        </div>
      </section>
    </div>
  );
}
