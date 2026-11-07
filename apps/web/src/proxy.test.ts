import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NextRequest } from 'next/server.js';
import { proxy } from './proxy.ts';

const run = (path: string) => proxy(new NextRequest(new URL(path, 'https://deckr.test')));
const rewrittenTo = (response: Response) => {
   const target = response.headers.get('x-middleware-rewrite');
   return target ? new URL(target).pathname : null;
};

test('Portuguese URLs are served from the pt-br pages, with a 200', () => {
   const cases: [string, string][] = [
      ['/', '/pt-br'],
      ['/cards', '/pt-br/cards'],
      ['/next', '/pt-br/next'],
   ];

   for (const [path, internal] of cases) {
      const response = run(path);
      assert.equal(rewrittenTo(response), internal, path);
      assert.equal(response.status, 200, path);
   }
});

test('English URLs are served as they are', () => {
   for (const path of ['/en', '/en/cards', '/en/profile']) {
      const response = run(path);
      assert.equal(rewrittenTo(response), null, path);
      assert.equal(response.headers.get('x-middleware-next'), '1', path);
   }
});

test('the internal /pt-br prefix redirects permanently to the root URL', () => {
   const page = run('/pt-br/cards?x=1');
   assert.equal(page.status, 308);
   assert.equal(page.headers.get('location'), 'https://deckr.test/cards?x=1');
   assert.equal(run('/pt-br').headers.get('location'), 'https://deckr.test/');
});

test('unknown addresses get their language’s 404 page with a 404 status', () => {
   const cases: [string, string][] = [
      ['/nope', '/pt-br/not-found-page'],
      ['/en/nope', '/en/not-found-page'],
      ['/fr/cards', '/pt-br/not-found-page'],
      ['/not-found-page', '/pt-br/not-found-page'],
   ];

   for (const [path, internal] of cases) {
      const response = run(path);
      assert.equal(rewrittenTo(response), internal, path);
      assert.equal(response.status, 404, path);
   }
});
