'use server';

import { revalidatePath } from 'next/cache';

import { requirePortalSession } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';

const WRITE_ROLES = new Set(['owner', 'admin', 'editor']);

async function assertCanWrite() {
  const session = await requirePortalSession();
  if (!WRITE_ROLES.has(session.role)) {
    throw new Error('You do not have permission to manage fleet photos.');
  }
}

export async function getFleetGalleryMediaIds(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('fleet_gallery_items')
    .select('media_id')
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) return [];
  return (data ?? []).map((row) => row.media_id as string);
}

export async function saveFleetGalleryMediaIds(mediaIds: string[]): Promise<{ ok: true }> {
  await assertCanWrite();
  const supabase = await createClient();
  const orderedIds = mediaIds.filter(Boolean);

  const { error: deleteError } = await supabase
    .from('fleet_gallery_items')
    .delete()
    .gte('position', 0);

  if (deleteError) throw new Error(deleteError.message);

  if (orderedIds.length) {
    const rows = orderedIds.map((mediaId, index) => ({
      media_id: mediaId,
      position: index
    }));
    const { error: insertError } = await supabase.from('fleet_gallery_items').insert(rows);
    if (insertError) throw new Error(insertError.message);
  }

  revalidatePath('/portal/fleet');
  revalidatePath('/en/our-fleet');
  revalidatePath('/our-fleet');

  return { ok: true };
}
