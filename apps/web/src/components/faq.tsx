import { Card, CardTitle } from '@/components/ui/card';
import { getDictionary, type Locale } from '@/i18n';

/**
 * Answers to what people ask about Deckr, as plain text on the page (a server component: no JavaScript), so
 * readers, search engines and answer engines all get the same answers.
 */
export function Faq({ locale }: { locale: Locale }) {
   const { faq } = getDictionary(locale);

   return (
      <Card aria-labelledby="faq-title" className="mt-gap">
         <CardTitle id="faq-title" className="mb-5">
            {faq.title}
         </CardTitle>
         <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
            {faq.items.map((item) => (
               <div key={item.question}>
                  <h3 className="font-medium text-ink">{item.question}</h3>
                  <p className="mt-1.5 text-pretty text-muted">{item.answer}</p>
               </div>
            ))}
         </div>
      </Card>
   );
}
