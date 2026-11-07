import type { Metadata } from 'next';
import { NextChests } from '@/features/next-chests';
import { localeParam } from '@/i18n/params';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]/next'>): Promise<Metadata> {
   return pageMetadata('chests', await localeParam(params));
}

export default function NextChestsPage() {
   return <NextChests />;
}
