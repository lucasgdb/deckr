import type { Metadata } from 'next';
import { SavedDecks } from '@/features/saved-decks';
import { localeParam } from '@/i18n/params';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]/decks'>): Promise<Metadata> {
   return pageMetadata('decks', await localeParam(params));
}

export default function SavedDecksPage() {
   return <SavedDecks />;
}
