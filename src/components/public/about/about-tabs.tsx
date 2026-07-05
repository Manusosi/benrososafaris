'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { AboutAdvantagesSection } from '@/components/public/about/about-advantages-section';
import { AboutTabBar } from '@/components/public/about/about-tab-bar';
import { TeamMemberDetailDialog } from '@/components/public/about/team-members-grid';
import { TeamMembersSection } from '@/components/public/about/team-members-section';
import { WhoWeAreTab } from '@/components/public/about/who-we-are/who-we-are-tab';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ABOUT_TEAM_SECTION } from '@/lib/public/about-content';
import { localePath } from '@/lib/public/locale-path';
import { ABOUT_TAB_IDS, type AboutTabId } from '@/lib/public/about-placeholders';
import { groupTeamMembersByRole, type PublicTeamMember } from '@/lib/public/team';

function isValidTabId(value: string): value is AboutTabId {
  return (ABOUT_TAB_IDS as readonly string[]).includes(value);
}

function resolveTabFromHash(hash: string): AboutTabId {
  if (hash === 'who-we-are') return 'about';
  return isValidTabId(hash) ? hash : 'about';
}

type AboutTabsProps = {
  locale: string;
  teamMembers: PublicTeamMember[];
};

export function AboutTabs({ locale, teamMembers }: AboutTabsProps) {
  const [activeTab, setActiveTab] = useState<AboutTabId>('about');
  const [bioMember, setBioMember] = useState<PublicTeamMember | null>(null);
  const [bioOpen, setBioOpen] = useState(false);

  const contactHref = localePath(locale, '/contact');

  const membersByRole = useMemo(() => groupTeamMembersByRole(teamMembers), [teamMembers]);

  const openBio = useCallback((member: PublicTeamMember) => {
    setBioMember(member);
    setBioOpen(true);
  }, []);

  const handleBioOpenChange = useCallback((next: boolean) => {
    setBioOpen(next);
    if (!next) {
      window.setTimeout(() => setBioMember(null), 200);
    }
  }, []);

  const syncTabFromHash = useCallback(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setActiveTab(resolveTabFromHash(hash));
    }
  }, []);

  useEffect(() => {
    syncTabFromHash();
    window.addEventListener('hashchange', syncTabFromHash);
    return () => window.removeEventListener('hashchange', syncTabFromHash);
  }, [syncTabFromHash]);

  const handleTabChange = (value: string) => {
    if (!isValidTabId(value)) return;
    setActiveTab(value);
    const base = window.location.pathname;
    window.history.replaceState(null, '', value === 'about' ? base : `${base}#${value}`);
  };

  return (
    <Tabs className='gap-0' onValueChange={handleTabChange} value={activeTab}>
      <AboutTabBar activeTab={activeTab} onTabChange={handleTabChange} />

      <TabsContent className='mt-0' value='about'>
        <WhoWeAreTab />
      </TabsContent>

      <TabsContent className='mt-0' value='team'>
        <TeamMembersSection
          anchorId='team'
          description={ABOUT_TEAM_SECTION.staff.description}
          emptyMessage={ABOUT_TEAM_SECTION.staff.emptyMessage}
          emptyTitle={ABOUT_TEAM_SECTION.staff.emptyTitle}
          eyebrow={ABOUT_TEAM_SECTION.staff.eyebrow}
          locale={locale}
          members={membersByRole.staff}
          onReadBio={openBio}
          title={ABOUT_TEAM_SECTION.staff.title}
        />
      </TabsContent>

      <TabsContent className='mt-0' value='guides'>
        <TeamMembersSection
          anchorId='guides'
          description={ABOUT_TEAM_SECTION.safari_guide.description}
          emptyMessage={ABOUT_TEAM_SECTION.safari_guide.emptyMessage}
          emptyTitle={ABOUT_TEAM_SECTION.safari_guide.emptyTitle}
          eyebrow={ABOUT_TEAM_SECTION.safari_guide.eyebrow}
          locale={locale}
          members={membersByRole.safari_guide}
          onReadBio={openBio}
          title={ABOUT_TEAM_SECTION.safari_guide.title}
        />
      </TabsContent>

      <TabsContent className='mt-0' value='drivers'>
        <TeamMembersSection
          anchorId='drivers'
          description={ABOUT_TEAM_SECTION.driver.description}
          emptyMessage={ABOUT_TEAM_SECTION.driver.emptyMessage}
          emptyTitle={ABOUT_TEAM_SECTION.driver.emptyTitle}
          eyebrow={ABOUT_TEAM_SECTION.driver.eyebrow}
          locale={locale}
          members={membersByRole.driver}
          onReadBio={openBio}
          title={ABOUT_TEAM_SECTION.driver.title}
        />
      </TabsContent>

      <div aria-hidden className='benroso-container bg-white'>
        <div className='h-px w-full bg-[var(--benroso-line)]' />
      </div>
      <AboutAdvantagesSection contactHref={contactHref} />

      <TeamMemberDetailDialog
        member={bioMember}
        onOpenChange={handleBioOpenChange}
        open={bioOpen}
      />
    </Tabs>
  );
}
