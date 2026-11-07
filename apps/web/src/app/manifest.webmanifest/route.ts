import { manifestResponse } from '@/lib/pwa';

/** The app manifest in Portuguese (the default language). English: /manifest.en.webmanifest. */
export const dynamic = 'force-static';

export function GET() {
   return manifestResponse('pt-br');
}
