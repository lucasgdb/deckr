import type { ApiError, ApiErrorCode, ApiErrorParams, UpcomingChest } from '@deckr/shared';
import type { Dictionary } from '@/i18n';

/** A failed request. `code` says why, so the message can be shown in the reader's language. */
export class ApiRequestError extends Error {
   readonly status: number;
   readonly code: ApiErrorCode | null;
   readonly params: ApiErrorParams;

   constructor(status: number, message: string, code: ApiErrorCode | null = null, params: ApiErrorParams = {}) {
      super(message);
      this.status = status;
      this.code = code;
      this.params = params;
   }
}

/** Waits before retrying a request that didn't reach the API: it may be waking from sleep (it's serverless). */
const WAKE_RETRY_DELAYS_MS = [1500, 3000];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
   for (let attempt = 0; ; attempt += 1) {
      let response: Response;

      try {
         response = await fetch(`/api${path}`, {
            ...init,
            headers: { 'content-type': 'application/json', ...init?.headers },
         });
      } catch {
         throw new ApiRequestError(0, 'Couldn’t reach the Deckr server.');
      }

      if (response.ok) return response.status === 204 ? (undefined as T) : ((await response.json()) as T);

      let body: Partial<ApiError> = {};

      try {
         body = (await response.json()) as ApiError;
      } catch {
         // Body was not JSON; the status alone explains it.
      }

      // A 5xx without the API's own error body came from in front of it (the web server's proxy, or Railway while
      // the API wakes up): the API never saw the request, so sending it again is safe, whatever the method.
      const delay = WAKE_RETRY_DELAYS_MS[attempt];
      if (response.status >= 500 && !body.code && delay !== undefined) {
         await sleep(delay);
         continue;
      }

      throw new ApiRequestError(
         response.status,
         body.message || `The server answered with status ${response.status}.`,
         body.code ?? null,
         body.params ?? {},
      );
   }
}

export const api = {
   upcomingChests: (tag: string) => request<UpcomingChest[]>(`/chests/${encodeURIComponent(tag)}`),
};

/** What went wrong, in the reader's language. */
export function errorMessage(error: unknown, t: Dictionary): string {
   if (!(error instanceof ApiRequestError)) return t.errors.generic;
   if (error.status === 0) return t.errors.network;

   const message = error.code ? t.errors.api[error.code] : undefined;

   return message ? message(error.params) : t.errors.status(error.status);
}
