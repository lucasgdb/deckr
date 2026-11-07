import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** A flat placeholder at the real size of what is loading (a card, a track). No shimmer. */
export function Skeleton({ className, ...props }: ComponentProps<'span'>) {
   return <span aria-hidden className={cn('block rounded bg-raised', className)} {...props} />;
}

/**
 * A placeholder for text. Put it inside the same element, with the same classes, as the text it stands for:
 * it's one glyph tall and sits on the text line, so the element keeps its real line height and nothing
 * around it moves when the text arrives. Set its width with a `w-*` class.
 */
export function TextSkeleton({ className, ...props }: ComponentProps<'span'>) {
   // The outer span carries the text line: inside a flex parent it becomes a block that still holds one full
   // line (the parent's line height), where a bare inline-block would shrink to the placeholder's own height.
   return (
      <span aria-hidden>
         <span
            className={cn('inline-block h-[1em] w-24 rounded-[0.25em] bg-raised align-[-0.15em]', className)}
            {...props}
         />
      </span>
   );
}
