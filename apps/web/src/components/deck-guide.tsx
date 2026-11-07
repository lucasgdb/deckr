import Link from 'next/link';
import { Card, CardTitle } from '@/components/ui/card';
import { getDictionary, type Locale, localizePath } from '@/i18n';

/**
 * How to build a deck, under the builder: plain text from the server (no JavaScript), for players who want to build
 * by hand and for search engines and answer engines.
 */
export function DeckGuide({ locale }: { locale: Locale }) {
   const { guide } = getDictionary(locale);

   return (
      <Card aria-labelledby="guide-title" className="mt-gap">
         <CardTitle id="guide-title">{guide.title}</CardTitle>
         <p className="mt-2 text-pretty text-muted">{guide.intro}</p>
         <ol className="mt-5 grid gap-x-10 gap-y-6 md:grid-cols-2">
            {guide.steps.map((step, index) => (
               <li key={step.title}>
                  <h3 className="font-medium text-ink">
                     <span className="num mr-2 text-gold">{index + 1}</span>
                     {step.title}
                  </h3>
                  <p className="mt-1.5 text-pretty text-muted">{step.body}</p>
               </li>
            ))}
         </ol>
         <p className="mt-6 text-pretty text-muted">
            {guide.pool.before}
            <Link
               href={localizePath('/cards', locale)}
               className="text-ink underline underline-offset-4 transition-colors hover:text-gold"
            >
               {guide.pool.link}
            </Link>
            {guide.pool.after}
         </p>
      </Card>
   );
}
