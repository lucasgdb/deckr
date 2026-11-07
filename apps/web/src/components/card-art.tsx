import { getCard } from '@deckr/shared';
import Image from 'next/image';
import { arenaImage, CARD_HEIGHT, CARD_WIDTH, cardImage } from '@/lib/assets';
import { cn } from '@/lib/utils';

interface CardArtProps {
   index: number;
   /** Empty when a visible label already names the card. */
   alt?: string;
   sizes: string;
   /** Above the fold on first paint: load it right away, ahead of other images, instead of lazily. */
   eager?: boolean;
   className?: string;
}

/** A card's art in the game's frame, or a named placeholder in the same frame when no art is available. */
export function CardArt({ index, alt = '', sizes, eager, className }: CardArtProps) {
   const src = cardImage(index);
   const frame = 'aspect-[302/363] w-full';

   if (!src) {
      return (
         // The card's name is the placeholder's visible text, so it doubles as the alternative text.
         <div
            className={cn(
               frame,
               'flex items-center justify-center rounded-art bg-raised p-2 text-center text-xs font-medium text-muted',
               className,
            )}
         >
            {alt || getCard(index).name}
         </div>
      );
   }

   return (
      <Image
         src={src}
         alt={alt}
         width={CARD_WIDTH}
         height={CARD_HEIGHT}
         sizes={sizes}
         {...(eager ? { loading: 'eager', fetchPriority: 'high' } : {})}
         draggable={false}
         className={cn(frame, 'object-contain', className)}
      />
   );
}

/** An arena's art, or its Trophy Road number on a tile when no art is available. */
export function ArenaArt({ slug, level, className }: { slug: string; level: number; className?: string }) {
   const src = arenaImage(slug);

   if (!src) {
      return (
         <div
            aria-hidden
            className={cn(
               'num flex size-14 shrink-0 items-center justify-center rounded-[12px] bg-raised text-base font-semibold text-muted',
               className,
            )}
         >
            {level}
         </div>
      );
   }

   return (
      <Image src={src} alt="" width={56} height={56} className={cn('size-14 shrink-0 object-contain', className)} />
   );
}
