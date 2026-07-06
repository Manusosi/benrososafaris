import { after } from 'next/server';

import { isAutoTranslateEnabled } from '@/lib/i18n/auto-translate-config';

export function scheduleAutoTranslate(task: () => Promise<void>): void {
  if (!isAutoTranslateEnabled()) return;

  after(async () => {
    try {
      await task();
    } catch (error) {
      console.error('[auto-translate] failed', error);
    }
  });
}
