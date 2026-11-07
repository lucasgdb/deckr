import type { Metadata } from 'next';
import { Profile } from '@/features/profile';
import { localeParam } from '@/i18n/params';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]/profile'>): Promise<Metadata> {
   return pageMetadata('profile', await localeParam(params));
}

export default function ProfilePage() {
   return <Profile />;
}
