import type { Metadata } from 'next';
import { Faq } from '@/components/faq';
import { JsonLd } from '@/components/json-ld';
import { DeckBuilder } from '@/features/deck-builder';
import { localeParam } from '@/i18n/params';
import { pageMetadata } from '@/lib/seo';
import { homeStructuredData } from '@/lib/structured-data';

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
   return pageMetadata('builder', await localeParam(params));
}

export default async function DeckBuilderPage({ params }: PageProps<'/[locale]'>) {
   const locale = await localeParam(params);

   return (
      <>
         <JsonLd data={homeStructuredData(locale)} />
         <DeckBuilder />
         <Faq locale={locale} />
      </>
   );
}
