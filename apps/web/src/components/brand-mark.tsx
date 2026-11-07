import { cn } from '@/lib/utils';

/** Deckr's mark: a playing card in Clash Royale gold with a D cut out of it. Same drawing as `app/icon.svg`. */
export function BrandMark({ className }: { className?: string }) {
   return (
      <svg viewBox="0 0 24 28" aria-hidden className={cn('h-6 w-auto', className)}>
         <rect x="1" y="1" width="22" height="26" rx="5" fill="var(--color-gold)" />
         <path d="M8 8h4.2c3.3 0 5.3 2.3 5.3 6s-2 6-5.3 6H8z" fill="none" stroke="#000" strokeWidth="2.6" />
      </svg>
   );
}
