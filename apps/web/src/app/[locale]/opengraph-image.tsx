import { ImageResponse } from 'next/og';
import { getDictionary } from '@/i18n';
import { localeParam } from '@/i18n/params';

/*
 * The preview shown when a Deckr link is shared (Open Graph, and X through og:image), one per language.
 * Prerendered for each locale like the pages.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Deckr';

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
   const { meta } = getDictionary(await localeParam(params));

   return new ImageResponse(
      <div
         style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            padding: '0 96px',
            background: '#000',
            color: '#f5f5f5',
         }}
      >
         <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
            <svg width="120" height="140" viewBox="0 0 24 28" role="img" aria-label="Deckr">
               <rect x="1" y="1" width="22" height="26" rx="5" fill="#f2b33d" />
               <path d="M8 8h4.2c3.3 0 5.3 2.3 5.3 6s-2 6-5.3 6H8z" fill="none" stroke="#000" strokeWidth="2.6" />
            </svg>
            <div style={{ fontSize: 112, fontWeight: 700, letterSpacing: -3 }}>{meta.siteName}</div>
         </div>
         <div style={{ marginTop: 48, fontSize: 52, fontWeight: 600, color: '#f2b33d' }}>
            {`${meta.pages.builder.title} · Clash Royale`}
         </div>
         <div style={{ marginTop: 20, fontSize: 32, lineHeight: 1.35, color: '#a3a3a3', maxWidth: 980 }}>
            {meta.pages.builder.description}
         </div>
      </div>,
      size,
   );
}
