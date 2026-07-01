'use server';

import { revalidatePath } from 'next/cache';

import { requireSuperAdmin } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';
import { PORTAL_ROLES, type PortalRole } from '@/lib/auth/roles';

export async function changeUserRole(input: {
  userId: string;
  role: PortalRole;
}): Promise<{ ok: true }> {
  const session = await requireSuperAdmin();
  if (!PORTAL_ROLES.includes(input.role)) {
    throw new Error('Invalid role.');
  }
  if (input.userId === session.userId) {
    throw new Error('You cannot change your own role.');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ role: input.role, updated_at: new Date().toISOString() })
    .eq('id', input.userId);

  if (error) throw new Error(error.message);

  revalidatePath('/portal/team');
  return { ok: true };
}

export async function setUserStatus(input: {
  userId: string;
  status: 'active' | 'disabled';
}): Promise<{ ok: true }> {
  const session = await requireSuperAdmin();
  if (input.status !== 'active' && input.status !== 'disabled') {
    throw new Error('Invalid status.');
  }
  if (input.userId === session.userId) {
    throw new Error('You cannot change your own status.');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ status: input.status, updated_at: new Date().toISOString() })
    .eq('id', input.userId);

  if (error) throw new Error(error.message);

  revalidatePath('/portal/team');
  return { ok: true };
}
