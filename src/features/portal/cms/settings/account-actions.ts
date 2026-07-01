'use server';

import { revalidatePath } from 'next/cache';

import { requirePortalSession } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';

export async function updateAccountProfile(input: {
  fullName: string;
  avatarUrl: string | null;
}): Promise<{ ok: true }> {
  const session = await requirePortalSession();
  const fullName = input.fullName.trim();
  if (!fullName) {
    throw new Error('Name is required.');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      avatar_url:
        input.avatarUrl && input.avatarUrl.trim().length > 0 ? input.avatarUrl.trim() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', session.userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/portal/account');
  revalidatePath('/portal', 'layout');
  return { ok: true };
}

export async function changeAccountPassword(input: { newPassword: string }): Promise<{ ok: true }> {
  await requirePortalSession();
  if (input.newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters.');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: input.newPassword });
  if (error) {
    throw new Error(error.message);
  }

  return { ok: true };
}
