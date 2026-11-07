import assert from 'node:assert/strict';
import { test } from 'node:test';
import { localizePath, splitLocalePath, switchLocalePath } from './config.ts';

test('Portuguese pages live at the root, English ones under /en', () => {
   assert.equal(localizePath('/', 'pt-br'), '/');
   assert.equal(localizePath('/cards', 'pt-br'), '/cards');
   assert.equal(localizePath('/', 'en'), '/en');
   assert.equal(localizePath('/cards', 'en'), '/en/cards');
});

test('query strings and hashes survive localization', () => {
   assert.equal(localizePath('/?deck=1;2', 'en'), '/en?deck=1;2');
   assert.equal(localizePath('/next?tag=ABC', 'en'), '/en/next?tag=ABC');
   assert.equal(localizePath('/#faq', 'en'), '/en#faq');
});

test('a path splits into its language and page', () => {
   assert.deepEqual(splitLocalePath('/en/cards'), { locale: 'en', path: '/cards' });
   assert.deepEqual(splitLocalePath('/en'), { locale: 'en', path: '/' });
   assert.deepEqual(splitLocalePath('/cards'), { locale: 'pt-br', path: '/cards' });
   // Only a whole `/en` segment is English.
   assert.deepEqual(splitLocalePath('/english'), { locale: 'pt-br', path: '/english' });
});

test('switching language keeps the page', () => {
   assert.equal(switchLocalePath('/en/cards', 'pt-br'), '/cards');
   assert.equal(switchLocalePath('/next', 'en'), '/en/next');
   assert.equal(switchLocalePath('/en', 'pt-br'), '/');
});
