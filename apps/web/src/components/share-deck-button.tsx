'use client';

import { isCompleteDeck } from '@deckr/shared';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useI18n } from '@/i18n/provider';
import { shareDeck, useShareSupport } from '@/lib/deck-actions';

/**
 * Shares a deck through the device's native share sheet. Until support is known it shows disabled, so it doesn't
 * pop in; it's removed only in browsers without a share sheet.
 */
export function ShareDeckButton({ deck, className }: { deck: readonly number[]; className?: string }) {
   const { t } = useI18n();
   const support = useShareSupport();

   if (support === 'no') return null;

   return (
      <Button
         onClick={() => shareDeck(deck, t)}
         disabled={support === 'unknown' || !isCompleteDeck(deck)}
         className={className}
      >
         <Share2 aria-hidden />
         {t.common.share}
      </Button>
   );
}
