import type { MetadataRoute } from 'next';
import { defaultLocale, getDictionary, localeConfig } from '@/i18n';

export default function manifest(): MetadataRoute.Manifest {
   const { meta } = getDictionary(defaultLocale);

   return {
      name: meta.title,
      short_name: 'Deckr',
      description: meta.description,
      lang: localeConfig[defaultLocale].htmlLang,
      start_url: '/',
      display: 'standalone',
      background_color: '#000000',
      theme_color: '#000000',
      icons: [
         { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
         { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
      ],
   };
}
