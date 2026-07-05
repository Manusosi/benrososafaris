import { NavGroup } from '@/types';

export const portalNavGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/portal',
        icon: 'dashboard',
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: 'Enquiries',
        url: '/portal/enquiries',
        icon: 'mail',
        shortcut: ['e', 'q'],
        access: { minRole: 'sales' },
        items: []
      }
    ]
  },
  {
    label: 'Safari Content',
    items: [
      {
        title: 'Destinations',
        url: '/portal/destinations',
        icon: 'mapPin',
        access: { minRole: 'viewer' },
        items: []
      },
      {
        title: 'National Parks',
        url: '/portal/national-parks',
        icon: 'park',
        access: { minRole: 'viewer' },
        items: []
      },
      {
        title: 'Safari Tours',
        url: '/portal/tours',
        icon: 'compass',
        access: { minRole: 'viewer' },
        items: []
      },
      {
        title: 'Experiences',
        url: '/portal/experiences',
        icon: 'sparkles',
        access: { minRole: 'viewer' },
        items: []
      },
      {
        title: 'Accommodations',
        url: '/portal/accommodations',
        icon: 'lodging',
        access: { minRole: 'viewer' },
        items: []
      },
      {
        title: 'Our Fleet',
        url: '/portal/fleet',
        icon: 'fleet',
        access: { minRole: 'viewer' },
        items: []
      },
      {
        title: 'Team Members',
        url: '/portal/team-members',
        icon: 'profile',
        access: { minRole: 'editor' },
        items: []
      },
      {
        title: 'Blog',
        url: '/portal/blog',
        icon: 'post',
        access: { minRole: 'viewer' },
        items: []
      }
    ]
  },
  {
    label: 'Site Management',
    items: [
      {
        title: 'Subscribers',
        url: '/portal/subscribers',
        icon: 'send',
        access: { minRole: 'editor' },
        items: []
      },
      {
        title: 'Site Settings',
        url: '/portal/settings',
        icon: 'settings',
        access: { superAdminOnly: true },
        items: [
          {
            title: 'General',
            url: '/portal/settings',
            items: []
          },
          {
            title: 'Hero Sections',
            url: '/portal/settings/heroes',
            items: []
          }
        ]
      },
      {
        title: 'Media Library',
        url: '/portal/media',
        icon: 'media',
        access: { minRole: 'editor' },
        items: []
      },
      {
        title: 'Redirects',
        url: '/portal/redirects',
        icon: 'externalLink',
        access: { minRole: 'editor' },
        items: []
      },
      {
        title: 'Team & Roles',
        url: '/portal/team',
        icon: 'teams',
        access: { superAdminOnly: true },
        items: []
      }
    ]
  },
  {
    label: 'Public Site',
    items: [
      {
        title: 'View Website',
        url: '/en',
        icon: 'world',
        external: true,
        items: []
      },
      {
        title: 'About Page',
        url: '/en/about',
        icon: 'page',
        external: true,
        items: []
      },
      {
        title: 'Contact Page',
        url: '/en/contact',
        icon: 'phone',
        external: true,
        items: []
      }
    ]
  }
];
