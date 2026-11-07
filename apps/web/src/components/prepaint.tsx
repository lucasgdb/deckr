import type { ReactNode } from 'react';
import type { PrepaintFlag } from '@/lib/prepaint';

interface PrepaintProps {
   /** True once the real value is known; then only `children` show. */
   ready: boolean;
   /** What the value depends on. If the browser has any of it stored, the placeholder shows until `ready`. */
   deps: readonly PrepaintFlag[];
   /** What first-time visitors see before `ready`: the value computed from defaults, which is already right. */
   children?: ReactNode;
   placeholder: ReactNode;
}

/**
 * Before `ready`, renders both the default value and its placeholder; CSS shows one of them from the flags the
 * prepaint script set (see lib/prepaint.ts). Both wrappers are `display: contents`, so layout is unchanged.
 */
export function Prepaint({ ready, deps, children, placeholder }: PrepaintProps) {
   const flags = deps.join(' ');

   // The wrapper stays once ready (only its attribute goes), so React keeps the same nodes: replacing them would
   // repaint content that didn't change, and the browser would count that as a later Largest Contentful Paint.
   return (
      <>
         <span data-prepaint-default={ready ? undefined : flags} className="contents">
            {children}
         </span>
         {ready ? null : (
            <span data-prepaint-placeholder={flags} className="contents">
               {placeholder}
            </span>
         )}
      </>
   );
}
