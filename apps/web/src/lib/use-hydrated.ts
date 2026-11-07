import { useSyncExternalStore } from 'react';

const noSubscription = () => () => {};

/**
 * False on the server and during hydration, true afterwards. Data kept in this browser (localStorage) is only
 * known from then on, so screens show placeholders for it until this is true instead of a guess that changes.
 */
export function useHydrated(): boolean {
   return useSyncExternalStore(
      noSubscription,
      () => true,
      () => false,
   );
}
