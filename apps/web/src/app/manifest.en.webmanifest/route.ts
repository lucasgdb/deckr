import { manifestResponse } from '@/lib/pwa';

/** The app manifest in English. */
export const dynamic = 'force-static';

export function GET() {
   return manifestResponse('en');
}
