'use client';

import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { MediaGalleryField } from '@/features/portal/cms/media/components/media-picker';
import { saveFleetGalleryMediaIds } from '@/features/portal/cms/fleet/service';
import { CMS_SURFACE } from '@/features/portal/cms/shared/surface';

type FleetGalleryManagerProps = {
  initialMediaIds: string[];
};

export function FleetGalleryManager({ initialMediaIds }: FleetGalleryManagerProps) {
  const [mediaIds, setMediaIds] = React.useState(initialMediaIds);

  const mutation = useMutation({
    mutationFn: saveFleetGalleryMediaIds,
    onSuccess: () => {
      toast.success('Fleet gallery saved.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Could not save fleet gallery.');
    }
  });

  return (
    <div className={CMS_SURFACE}>
      <div className='border-b border-[#E5E7EB] px-6 py-5'>
        <h2 className='text-lg font-semibold text-[#111827]'>Fleet page photos</h2>
        <p className='mt-1 text-sm text-[#6B7280]'>
          These images appear on the public Our Fleet page. The first image is also used as the page
          hero background. You can include the same photo more than once. Hover a thumbnail and use
          the plus icon to duplicate it.
        </p>
      </div>

      <div className='space-y-6 p-6'>
        <MediaGalleryField
          allowDuplicates
          description='Select safari vehicle photos from the media library or upload new ones.'
          label='Vehicle gallery'
          onChange={setMediaIds}
          value={mediaIds}
        />

        <div className='flex justify-end border-t border-[#E5E7EB] pt-4'>
          <Button
            disabled={mutation.isPending}
            isLoading={mutation.isPending}
            onClick={() => mutation.mutate(mediaIds)}
            type='button'
          >
            Save gallery
          </Button>
        </div>
      </div>
    </div>
  );
}
