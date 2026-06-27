import PageContainer from '@/components/layout/page-container';
import { PortalModulePage } from '@/features/portal/components/portal-module-page';
import { getPortalContentList } from '@/features/portal/api/service';

type ModuleKey = 'destinations' | 'tours' | 'packages' | 'experiences' | 'accommodations' | 'fleet';

interface ModuleConfig {
  title: string;
  publicPath: string;
  /** Set once a module has a wizard, to enable the "Add new" and row-edit links. */
  newHref?: string;
  editBasePath?: string;
}

const MODULES: Record<ModuleKey, ModuleConfig> = {
  destinations: {
    title: 'Destinations',
    publicPath: '/en/destinations',
    newHref: '/portal/destinations/new',
    editBasePath: '/portal/destinations'
  },
  tours: {
    title: 'Safari Tours',
    publicPath: '/en/tours'
  },
  packages: {
    title: 'Safari Packages',
    publicPath: '/en/safari-packages'
  },
  experiences: {
    title: 'Experiences',
    publicPath: '/en/experiences',
    newHref: '/portal/experiences/new',
    editBasePath: '/portal/experiences'
  },
  accommodations: {
    title: 'Accommodations',
    publicPath: '/en/accommodations',
    newHref: '/portal/accommodations/new',
    editBasePath: '/portal/accommodations'
  },
  fleet: {
    title: 'Our Fleet',
    publicPath: '/en/our-fleet'
  }
};

export async function renderPortalContentPage(moduleKey: ModuleKey) {
  const config = MODULES[moduleKey];
  const data = await getPortalContentList(moduleKey);

  return (
    <PageContainer pageTitle={config.title}>
      <PortalModulePage
        data={data}
        publicPath={config.publicPath}
        newHref={config.newHref}
        editBasePath={config.editBasePath}
      />
    </PageContainer>
  );
}
