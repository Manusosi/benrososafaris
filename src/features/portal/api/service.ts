'use server';

import type { SupabaseClient } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/server';
import type { PortalContentList, PortalOverviewStats } from './types';

/**
 * Several helpers below operate on a runtime-chosen table/column name (generic
 * content modules). The typed client only accepts literal table names, so these
 * helpers use the untyped client surface intentionally.
 */
async function createGenericClient(): Promise<SupabaseClient> {
  return (await createClient()) as unknown as SupabaseClient;
}

async function countTable(table: string): Promise<number> {
  const supabase = await createGenericClient();
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });

  if (error) return 0;
  return count ?? 0;
}

async function countByStatus(table: string, status: string): Promise<number> {
  const supabase = await createGenericClient();
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .eq('status', status);

  if (error) return 0;
  return count ?? 0;
}

export async function getPortalOverviewStats(): Promise<PortalOverviewStats> {
  const supabase = await createClient();

  const [
    destinationsTotal,
    destinationsPublished,
    toursTotal,
    toursPublished,
    packagesTotal,
    packagesPublished,
    experiencesTotal,
    experiencesPublished,
    accommodationsTotal,
    accommodationsPublished,
    fleetTotal,
    fleetPublished,
    blogTotal,
    blogPublished,
    newEnquiries,
    totalEnquiries
  ] = await Promise.all([
    countTable('destinations'),
    countByStatus('destinations', 'published'),
    countTable('tours'),
    countByStatus('tours', 'published'),
    countTable('packages'),
    countByStatus('packages', 'published'),
    countTable('experiences'),
    countByStatus('experiences', 'published'),
    countTable('accommodations'),
    countByStatus('accommodations', 'published'),
    countTable('fleet_vehicles'),
    countByStatus('fleet_vehicles', 'published'),
    countTable('blog_posts'),
    countByStatus('blog_posts', 'published'),
    supabase
      .from('enquiries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .is('deleted_at', null)
      .then(({ count }) => count ?? 0),
    supabase
      .from('enquiries')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .then(({ count }) => count ?? 0)
  ]);

  return {
    modules: [
      {
        key: 'destinations',
        label: 'Destinations',
        total: destinationsTotal,
        published: destinationsPublished,
        draft: destinationsTotal - destinationsPublished,
        href: '/portal/destinations'
      },
      {
        key: 'tours',
        label: 'Safari Tours',
        total: toursTotal,
        published: toursPublished,
        draft: toursTotal - toursPublished,
        href: '/portal/tours'
      },
      {
        key: 'packages',
        label: 'Safari Packages',
        total: packagesTotal,
        published: packagesPublished,
        draft: packagesTotal - packagesPublished,
        href: '/portal/packages'
      },
      {
        key: 'experiences',
        label: 'Experiences',
        total: experiencesTotal,
        published: experiencesPublished,
        draft: experiencesTotal - experiencesPublished,
        href: '/portal/experiences'
      },
      {
        key: 'accommodations',
        label: 'Accommodations',
        total: accommodationsTotal,
        published: accommodationsPublished,
        draft: accommodationsTotal - accommodationsPublished,
        href: '/portal/accommodations'
      },
      {
        key: 'fleet',
        label: 'Our Fleet',
        total: fleetTotal,
        published: fleetPublished,
        draft: fleetTotal - fleetPublished,
        href: '/portal/fleet'
      },
      {
        key: 'blog',
        label: 'Blog Posts',
        total: blogTotal,
        published: blogPublished,
        draft: blogTotal - blogPublished,
        href: '/portal/blog'
      }
    ],
    newEnquiries,
    totalEnquiries
  };
}

type ContentModuleConfig = {
  baseTable: string;
  translationTable: string;
  foreignKey: string;
  titleField: string;
};

const CONTENT_MODULES: Record<string, ContentModuleConfig> = {
  destinations: {
    baseTable: 'destinations',
    translationTable: 'destination_translations',
    foreignKey: 'destination_id',
    titleField: 'name'
  },
  national_parks: {
    baseTable: 'national_parks',
    translationTable: 'national_park_translations',
    foreignKey: 'park_id',
    titleField: 'name'
  },
  tours: {
    baseTable: 'tours',
    translationTable: 'tour_translations',
    foreignKey: 'tour_id',
    titleField: 'title'
  },
  packages: {
    baseTable: 'packages',
    translationTable: 'package_translations',
    foreignKey: 'package_id',
    titleField: 'title'
  },
  experiences: {
    baseTable: 'experiences',
    translationTable: 'experience_translations',
    foreignKey: 'experience_id',
    titleField: 'title'
  },
  accommodations: {
    baseTable: 'accommodations',
    translationTable: 'accommodation_translations',
    foreignKey: 'accommodation_id',
    titleField: 'name'
  },
  fleet: {
    baseTable: 'fleet_vehicles',
    translationTable: 'fleet_vehicle_translations',
    foreignKey: 'vehicle_id',
    titleField: 'title'
  },
  blog: {
    baseTable: 'blog_posts',
    translationTable: 'blog_translations',
    foreignKey: 'post_id',
    titleField: 'title'
  }
};

export async function getPortalContentList(moduleKey: string): Promise<PortalContentList> {
  const config = CONTENT_MODULES[moduleKey];
  if (!config) {
    return { rows: [], total: 0 };
  }

  const supabase = await createGenericClient();

  const { data: baseRows, error: baseError } = await supabase
    .from(config.baseTable)
    .select('id, status, updated_at')
    .order('updated_at', { ascending: false })
    .limit(50);

  if (baseError || !baseRows?.length) {
    return { rows: [], total: 0 };
  }

  const ids = baseRows.map((row) => row.id);

  const { data: translations } = await supabase
    .from(config.translationTable)
    .select(`${config.foreignKey}, locale, ${config.titleField}`)
    .in(config.foreignKey, ids)
    .eq('locale', 'en');

  const titleById = new Map<string, string>();
  translations?.forEach((row) => {
    const id = row[config.foreignKey as keyof typeof row] as string;
    const title = row[config.titleField as keyof typeof row] as string;
    titleById.set(id, title);
  });

  const rows = baseRows.map((row) => ({
    id: row.id as string,
    title: titleById.get(row.id as string) ?? 'Untitled',
    status: row.status as string,
    locale: 'en',
    updatedAt: row.updated_at as string
  }));

  return { rows, total: rows.length };
}

export async function getPortalEnquiries() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('enquiries')
    .select('id, name, email, status, created_at, locale, message')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50);

  return data ?? [];
}

export type PortalTeamMember = {
  id: string;
  full_name: string | null;
  role: string;
  status: string;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
};

export async function getPortalTeam(): Promise<PortalTeamMember[]> {
  const supabase = await createClient();
  // Security-definer RPC joins profiles with auth.users for sign-in metadata
  // (auth.users is not readable under RLS). Falls back to profiles on error.
  const { data, error } = await supabase.rpc('get_portal_team');

  if (error || !data) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, role, status, avatar_url, created_at')
      .order('created_at', { ascending: true });

    return (profiles ?? []).map((row) => ({
      ...row,
      email: null,
      last_sign_in_at: null
    }));
  }

  return data as PortalTeamMember[];
}
