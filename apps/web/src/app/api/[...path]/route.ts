/*
 * /api/* is forwarded to the API service. A route handler instead of a `rewrites()` entry because the API sleeps
 * when idle (Railway's serverless mode): the first request wakes it, and it takes a few seconds to listen. A
 * rewrite fails that request at once with a 500; this waits for the API to come up and then sends it.
 *
 * Only connection failures are retried (refused, timed out, reset before a response): the API never saw those
 * requests, so sending them again is safe whatever the method. Any response from the API is passed through as is.
 */

/** Read per request, so the same build works in Docker, on Railway and in development. */
const apiUrl = () => (process.env.API_URL ?? 'http://localhost:3001').replace(/\/+$/, '');

/** How long to keep trying while the API wakes up. A cold start takes about 5 s. */
const WAKE_TIMEOUT_MS = 20_000;
const RETRY_DELAY_MS = 500;

/** Request headers that describe this hop, not the request; fetch sets its own. */
const dropRequest = new Set(['host', 'connection', 'keep-alive', 'transfer-encoding', 'content-length', 'expect']);
/** fetch already decoded the body, so its encoding and length no longer apply. */
const dropResponse = new Set(['content-encoding', 'content-length', 'transfer-encoding', 'connection', 'keep-alive']);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function forward(request: Request): Promise<Response> {
   const url = new URL(request.url);
   const target = `${apiUrl()}${url.pathname}${url.search}`;

   const headers = new Headers();
   for (const [name, value] of request.headers) {
      if (!dropRequest.has(name)) headers.set(name, value);
   }
   headers.set('x-forwarded-host', request.headers.get('x-forwarded-host') ?? url.host);
   headers.set('x-forwarded-proto', request.headers.get('x-forwarded-proto') ?? url.protocol.slice(0, -1));

   // Buffered (requests are small JSON), so it can be sent again after a failed connection.
   const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer();
   const deadline = Date.now() + WAKE_TIMEOUT_MS;

   for (;;) {
      try {
         const response = await fetch(target, { method: request.method, headers, body, redirect: 'manual' });

         const out = new Headers();
         for (const [name, value] of response.headers) {
            if (!dropResponse.has(name) && name !== 'set-cookie') out.set(name, value);
         }
         // Several cookies come as several headers; Headers#set would keep only the last one.
         for (const cookie of response.headers.getSetCookie()) out.append('set-cookie', cookie);

         return new Response(response.body, { status: response.status, statusText: response.statusText, headers: out });
      } catch (error) {
         if (Date.now() + RETRY_DELAY_MS > deadline) {
            console.error(`API unreachable after ${WAKE_TIMEOUT_MS / 1000}s: ${request.method} ${url.pathname}`, error);
            return Response.json(
               { message: 'The Deckr API is unavailable. Try again in a moment.' },
               { status: 503, headers: { 'retry-after': '5' } },
            );
         }
         await sleep(RETRY_DELAY_MS);
      }
   }
}

export const dynamic = 'force-dynamic';

export { forward as DELETE, forward as GET, forward as HEAD, forward as PATCH, forward as POST, forward as PUT };
