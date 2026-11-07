'use client';

import type { LoginInput, LoginMethod, MeResponse, PlayerProfile, ServerInfo, SessionResponse } from '@deckr/shared';
import { useEffect, useSyncExternalStore } from 'react';
import { request } from './api';
import { rememberSignedIn } from './prepaint';

/*
 * The signed-in player, shared by every screen. Loaded once from /api/me; login, refresh and logout update it.
 */
export type SessionState =
   | { status: 'loading' }
   | { status: 'anonymous' }
   | { status: 'signed-in'; player: PlayerProfile; method: LoginMethod; syncing: boolean };

/**
 * Player data refreshes when the player logs in, when they press Refresh, and when they come back to Deckr with
 * a session still open (the next day, say) and the stored data is older than this. Nothing refreshes on a
 * schedule: data is only fetched for players who are actually using Deckr.
 */
const STALE_AFTER_MS = 30 * 60 * 1000;

let state: SessionState = { status: 'loading' };
let loaded = false;
const listeners = new Set<() => void>();

function set(next: SessionState) {
   if (next.status !== 'loading') rememberSignedIn(next.status === 'signed-in');
   state = next;
   for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
   listeners.add(listener);
   return () => listeners.delete(listener);
}

async function load() {
   try {
      const me = await request<MeResponse>('/me');

      if (!me.player) {
         set({ status: 'anonymous' });
         return;
      }

      const { player, method } = me;

      // Also covers sessions that started before the tag was remembered.
      saveTag(player.tag);
      set({ status: 'signed-in', player, method, syncing: false });

      // Back with an open session: show the stored data now and bring it up to date in the background.
      if (Date.now() - new Date(player.syncedAt).getTime() > STALE_AFTER_MS) {
         refreshPlayer().catch(() => {
            // Keep showing the stored data; the Refresh button reports errors when used.
         });
      }
   } catch {
      // The server couldn't be reached: the app stays usable without a player.
      set({ status: 'anonymous' });
   }
}

export function useSession(): SessionState {
   const current = useSyncExternalStore(
      subscribe,
      () => state,
      () => state,
   );

   useEffect(() => {
      if (!loaded) {
         loaded = true;
         load();
      }
   }, []);

   return current;
}

/** The signed-in player, or null. */
export function usePlayer(): PlayerProfile | null {
   const session = useSession();
   return session.status === 'signed-in' ? session.player : null;
}

export async function login(input: LoginInput): Promise<PlayerProfile> {
   const { player, method } = await request<SessionResponse>('/session', {
      method: 'POST',
      body: JSON.stringify(input),
   });
   saveTag(player.tag);
   set({ status: 'signed-in', player, method, syncing: false });
   return player;
}

export async function logout() {
   await request<void>('/session', { method: 'DELETE' });
   set({ status: 'anonymous' });
}

/** Pulls fresh data from Clash Royale for the signed-in player. */
export async function refreshPlayer(): Promise<PlayerProfile> {
   if (state.status !== 'signed-in') throw new Error('Not signed in.');

   const previous = state;
   set({ ...previous, syncing: true });

   try {
      const { player, method } = await request<SessionResponse>('/me/sync', { method: 'POST' });
      set({ status: 'signed-in', player, method, syncing: false });
      return player;
   } catch (error) {
      set({ ...previous, syncing: false });
      throw error;
   }
}

export const fetchServerInfo = () => request<ServerInfo>('/server');

/* The login dialog is rendered once in the layout; any screen can open it. */
let loginOpen = false;
const loginListeners = new Set<() => void>();

function setLoginOpen(next: boolean) {
   loginOpen = next;
   for (const listener of loginListeners) listener();
}

export const openLogin = () => setLoginOpen(true);
export const closeLogin = () => setLoginOpen(false);

export function useLoginOpen(): boolean {
   return useSyncExternalStore(
      (listener) => {
         loginListeners.add(listener);
         return () => loginListeners.delete(listener);
      },
      () => loginOpen,
      () => false,
   );
}

/* The last tag used to log in, kept in this browser so the dialog can fill it in next time. */
const TAG_KEY = 'deckr.playerTag';

export function readSavedTag(): string {
   try {
      return localStorage.getItem(TAG_KEY) ?? '';
   } catch {
      return '';
   }
}

export function saveTag(tag: string) {
   try {
      localStorage.setItem(TAG_KEY, tag);
   } catch {
      // Storage unavailable (private mode): the tag just won't be remembered.
   }
}
