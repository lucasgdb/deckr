import type { Metadata } from 'next';
import { NotFoundView } from '@/features/not-found';
import { getDictionary } from '@/i18n';
import { localeParam } from '@/i18n/params';

/*
 * The 404 page for unknown addresses. The proxy rewrites them here with a 404 status, so the page renders on the
 * server in the visitor's language, inside the app's layout. (Throwing `notFound()` from a catch-all route only
 * rendered it in the browser.)
 */
export async function generateMetadata({ params }: PageProps<'/[locale]/not-found-page'>): Promise<Metadata> {
   const t = getDictionary(await localeParam(params));

   return { title: t.notFound.title, robots: { index: false, follow: true } };
}

export default function NotFoundPage() {
   return <NotFoundView />;
}
