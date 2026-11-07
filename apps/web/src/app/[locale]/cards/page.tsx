import type { Metadata } from 'next';
import { JsonLd } from '@/components/json-ld';
import { CardPool } from '@/features/card-pool';
import { localeParam } from '@/i18n/params';
import { pageMetadata } from '@/lib/seo';
import { pageStructuredData } from '@/lib/structured-data';

export async function generateMetadata({ params }: PageProps<'/[locale]/cards'>): Promise<Metadata> {
   return pageMetadata('cards', await localeParam(params));
}

export default async function CardPoolPage({ params }: PageProps<'/[locale]/cards'>) {
   const locale = await localeParam(params);

   return (
      <>
         <JsonLd data={pageStructuredData('cards', locale)} />
         <CardPool />
      </>
   );
}
