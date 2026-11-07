/*
 * Digital Asset Links: lets an Android app built from this PWA (a Trusted Web Activity, e.g. with Bubblewrap or
 * PWABuilder) open Deckr full screen, without the browser bar. Set ANDROID_PACKAGE_NAME and
 * ANDROID_CERT_FINGERPRINTS (SHA-256 of the signing key, comma-separated; Play App Signing shows it) once the app
 * exists. Until then it lists nothing. See README → "Installable app".
 */
export const dynamic = 'force-dynamic';

export function GET() {
   const packageName = process.env.ANDROID_PACKAGE_NAME;
   const fingerprints = (process.env.ANDROID_CERT_FINGERPRINTS ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

   const statements =
      packageName && fingerprints.length > 0
         ? [
              {
                 relation: ['delegate_permission/common.handle_all_urls'],
                 target: {
                    namespace: 'android_app',
                    package_name: packageName,
                    sha256_cert_fingerprints: fingerprints,
                 },
              },
           ]
         : [];

   return Response.json(statements);
}
