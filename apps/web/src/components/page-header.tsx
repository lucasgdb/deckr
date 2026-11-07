import type { ReactNode } from 'react';

interface PageHeaderProps {
   /** Usually text; a `Skeleton` while the page's subject is loading. */
   title: ReactNode;
   /** One sentence about the data on this screen. */
   summary?: ReactNode;
   actions?: ReactNode;
}

export function PageHeader({ title, summary, actions }: PageHeaderProps) {
   return (
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pt-6 pb-5 sm:pt-9 sm:pb-6">
         <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-[-0.01em]">{title}</h1>
            {summary ? <p className="mt-1 text-pretty text-muted">{summary}</p> : null}
         </div>
         {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
   );
}
