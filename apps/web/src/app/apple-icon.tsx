import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** The Deckr mark on the app's black ground, for home-screen icons. */
export default function AppleIcon() {
   return new ImageResponse(
      <div
         style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000',
         }}
      >
         <svg width="120" height="140" viewBox="0 0 24 28" role="img" aria-label="Deckr">
            <rect x="1" y="1" width="22" height="26" rx="5" fill="#f2b33d" />
            <path d="M8 8h4.2c3.3 0 5.3 2.3 5.3 6s-2 6-5.3 6H8z" fill="none" stroke="#000" strokeWidth="2.6" />
         </svg>
      </div>,
      size,
   );
}
