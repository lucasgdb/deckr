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

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
   let response: Response;

   try {
      response = await fetch(`/api${path}`, {
         ...init,
         headers: { 'content-type': 'application/json', ...init?.headers },
      });
   } catch {
      throw new ApiRequestError(0, 'Couldn’t reach the Deckr server.');
   }

   if (!response.ok) {
      let body: Partial<ApiError> = {};

      try {
         body = (await response.json()) as ApiError;
      } catch {
         // Body was not JSON; the status alone explains it.
      }

      throw new ApiRequestError(
         response.status,
         body.message || `The server answered with status ${response.status}.`,
         body.code ?? null,
         body.params ?? {},
      );
   }

   return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
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
