/** The public IP the server reaches the internet from: the one to allow on a Clash Royale API key. */
let cached: { ip: string | null; at: number } | null = null;
const TTL = 10 * 60 * 1000;

export async function serverPublicIp(): Promise<string | null> {
   if (cached && Date.now() - cached.at < TTL) return cached.ip;

   let ip: string | null = null;

   try {
      const response = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(5000) });
      const body = (await response.json()) as { ip?: unknown };
      ip = typeof body.ip === 'string' ? body.ip : null;
   } catch {
      ip = null;
   }

   cached = { ip, at: Date.now() };
   return ip;
}
