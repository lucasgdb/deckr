import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApiRequestError, request } from './api.ts';

const json = (status: number, body: unknown) =>
   new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

function mockFetch(responses: Response[]) {
   const calls: string[] = [];
   globalThis.fetch = (async (input: RequestInfo | URL) => {
      calls.push(String(input));
      const next = responses.shift();
      if (!next) throw new Error('no more responses');
      return next;
   }) as typeof fetch;
   return calls;
}

test('a request that never reached the API (5xx, no API body) is retried while the API wakes', async (t) => {
   t.mock.timers.enable({ apis: ['setTimeout'] });
   const calls = mockFetch([new Response('Internal Server Error', { status: 500 }), json(200, { player: null })]);
   const pending = request<{ player: null }>('/me', { method: 'POST' });
   await new Promise((resolve) => setImmediate(resolve));
   t.mock.timers.tick(1500);
   assert.deepEqual(await pending, { player: null });
   assert.equal(calls.length, 2);
});

test('it gives up after the last wait', async (t) => {
   t.mock.timers.enable({ apis: ['setTimeout'] });
   const calls = mockFetch([502, 502, 502].map((status) => new Response('Bad Gateway', { status })));
   const pending = request('/me');
   for (const ms of [1500, 3000]) {
      await new Promise((resolve) => setImmediate(resolve));
      t.mock.timers.tick(ms);
   }
   await assert.rejects(pending, (error: unknown) => error instanceof ApiRequestError && error.status === 502);
   assert.equal(calls.length, 3);
});

test('errors from the API itself are never retried', async () => {
   const calls = mockFetch([json(500, { code: 'internal', message: 'Something went wrong.' })]);
   await assert.rejects(request('/decks', { method: 'POST' }), (error: unknown) => {
      return error instanceof ApiRequestError && error.code === 'internal';
   });
   assert.equal(calls.length, 1);
});
