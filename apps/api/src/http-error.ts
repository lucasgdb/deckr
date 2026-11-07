import type { ApiErrorCode, ApiErrorParams } from '@deckr/shared';

/** A failure the client is told about: its HTTP status, a code the web app translates, and an English message. */
export class HttpError extends Error {
   readonly status: number;
   readonly code: ApiErrorCode;
   readonly params: ApiErrorParams | undefined;

   constructor(status: number, code: ApiErrorCode, message: string, params?: ApiErrorParams) {
      super(message);
      this.status = status;
      this.code = code;
      this.params = params;
   }
}
