'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { portalNavGroups } from '@/config/portal-nav-config';
import { BENROSO_LOGO_HEIGHT, BENROSO_LOGO_PATH, BENROSO_LOGO_WIDTH } from '@/config/benroso';
import { useFilteredNavGroups } from '@/hooks/use-nav';
import { roleLabel, type PortalRole } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/browser';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface PortalSidebarProps {
  fullName: string | null;
  email: string;
  role: PortalRole;
}

export function PortalSidebar({ fullName, email, role }: PortalSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const filteredGroups = useFilteredNavGroups(portalNavGroups);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/portal/login');
    router.refresh();
  }

  return (
    <Sidebar collapsible='icon' className='border-sidebar-border'>
      <SidebarHeader className='border-sidebar-border border-b px-3 py-4'>
        <Link className='flex items-center gap-3 overflow-hidden' href='/portal'>
          <Image
            alt='Benroso Safaris'
            className='h-8 w-auto max-w-[160px] object-contain object-left'
            height={BENROSO_LOGO_HEIGHT}
            priority
            src={BENROSO_LOGO_PATH}
            width={BENROSO_LOGO_WIDTH}
          />
        </Link>
        <p className='text-sidebar-foreground/70 mt-2 truncate text-xs uppercase tracking-[0.12em] group-data-[collapsible=icon]:hidden'>
          Team Portal
        </p>
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        {filteredGroups.map((group) => (
          <SidebarGroup key={group.label || 'ungrouped'} className='py-0'>
            {group.label ? <SidebarGroupLabel>{group.label}</SidebarGroupLabel> : null}
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = item.icon ? Icons[item.icon] : Icons.dashboard;
                const isActive =
                  item.url === '/portal'
                    ? pathname === '/portal'
                    : pathname === item.url || pathname.startsWith(`${item.url}/`);

                if (item.items?.length) {
                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={item.isActive}
                      className='group/collapsible'
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                            <Icon />
                            <span>{item.title}</span>
                            <Icons.chevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                  <Link href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                      {item.external ? (
                        <a href={item.url} rel='noopener noreferrer' target='_blank'>
                          <Icon />
                          <span>{item.title}</span>
                          <Icons.externalLink className='ml-auto size-3.5 opacity-60' />
                        </a>
                      ) : (
                        <Link href={item.url}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className='border-sidebar-border border-t'>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  <div className='bg-sidebar-primary text-sidebar-primary-foreground flex size-8 items-center justify-center rounded-md text-xs font-semibold'>
                    {(fullName ?? email).charAt(0).toUpperCase()}
                  </div>
                  <div className='grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden'>
                    <span className='truncate font-medium'>{fullName ?? 'Team member'}</span>
                    <span className='text-sidebar-foreground/70 truncate text-xs'>
                      {roleLabel(role)}
                    </span>
                  </div>
                  <Icons.chevronsDown className='ml-auto size-4 group-data-[collapsible=icon]:hidden' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                side='bottom'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='px-2 py-2'>
                    <p className='text-sm font-medium'>{fullName ?? 'Team member'}</p>
                    <p className='text-muted-foreground text-xs'>{email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href='/portal/account'>
                    <Icons.user className='mr-2 h-4 w-4' />
                    My Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href='/en' rel='noopener noreferrer' target='_blank'>
                    <Icons.world className='mr-2 h-4 w-4' />
                    View public site
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <Icons.logout className='mr-2 h-4 w-4' />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function PortalBrandMark({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <Image
        alt='Benroso Safaris'
        className='h-12 w-auto object-contain'
        height={BENROSO_LOGO_HEIGHT}
        priority
        src={BENROSO_LOGO_PATH}
        width={BENROSO_LOGO_WIDTH}
      />
      <p className='text-muted-foreground mt-3 text-xs uppercase tracking-[0.14em]'>Team Portal</p>
    </div>
  );
}
