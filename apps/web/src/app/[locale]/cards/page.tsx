import type { Metadata } from 'next';
import { CardPool } from '@/features/card-pool';
import { localeParam } from '@/i18n/params';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]/cards'>): Promise<Metadata> {
   return pageMetadata('cards', await localeParam(params));
}

export default function CardPoolPage() {
   return <CardPool />;
}
