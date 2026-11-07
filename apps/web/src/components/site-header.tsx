'use client';

import { Collapsible } from '@base-ui/react/collapsible';
import {
   Check,
   ChevronDown,
   Languages,
   LogIn,
   LogOut,
   Menu as MenuIcon,
   RefreshCw,
   Trophy,
   UserRound,
   X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type ComponentProps, Suspense, useEffect, useRef, useState } from 'react';
import { Button, Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger, Skeleton, toast } from '@/components/ui';
import { localeConfig, locales, switchLocalePath } from '@/i18n';
import { useI18n } from '@/i18n/provider';
import { errorMessage } from '@/lib/api';
import { formatNumber } from '@/lib/format';
import { logout, openLogin, refreshPlayer, useSession } from '@/lib/session';
import { cn } from '@/lib/utils';
import { BrandMark } from './brand-mark';
import { Prepaint } from './prepaint';
import { InstallApp } from './pwa';
import { LanguageLinks } from './site-footer';

const links = [
   { path: '/', key: 'builder' },
   { path: '/decks', key: 'decks' },
   { path: '/cards', key: 'cards' },
   { path: '/next', key: 'chests' },
] as const;

const profileLink = { path: '/profile', key: 'profile' } as const;

function NavLinks({ pathname, className }: { pathname: string; className?: string }) {
   const session = useSession().status;
   const profile = <NavLink item={profileLink} pathname={pathname} className={className} />;

   return (
      <>
         {links.map((item) => (
            <NavLink key={item.path} item={item} pathname={pathname} className={className} />
         ))}
         {/* While the session loads, kept in place when this browser was signed in last time (lib/prepaint.ts). */}
         {session === 'signed-in' ? profile : null}
         {session === 'loading' ? <Prepaint ready={false} deps={['session']} placeholder={profile} /> : null}
      </>
   );
}

function NavLink({
   item,
   pathname,
   className,
}: {
   item: (typeof links)[number] | typeof profileLink;
   pathname: string;
   className?: string;
}) {
   const { t, href } = useI18n();

   const link = { href: href(item.path), label: t.nav[item.key] };
   const active = link.href === pathname;

   return (
      <li key={link.href}>
         <Link
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={cn('rounded-full transition-colors hover:text-ink', active ? 'text-ink' : 'text-nav', className)}
         >
            {link.label}
         </Link>
      </li>
   );
}

export function SiteHeader() {
   const { t, href } = useI18n();
   const pathname = usePathname();
   const [menuOpen, setMenuOpen] = useState(false);
   const firstRender = useRef(true);

   // Close the phone menu after navigating, and move focus to the new page for screen readers.
   // biome-ignore lint/correctness/useExhaustiveDependencies: runs on every route change by design.
   useEffect(() => {
      setMenuOpen(false);

      if (firstRender.current) {
         firstRender.current = false;
         return;
      }

      document.getElementById('main')?.focus({ preventScroll: true });
   }, [pathname]);

   useEffect(() => {
      if (!menuOpen) return;

      const onKeyDown = (event: KeyboardEvent) => {
         if (event.key === 'Escape') setMenuOpen(false);
      };

      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
   }, [menuOpen]);

   // On phones the links fold into a panel under the bar.

   return (
      <Collapsible.Root
         open={menuOpen}
         onOpenChange={setMenuOpen}
         render={<header />}
         className="sticky top-0 z-30 border-b border-white/[0.06] bg-ground/70 backdrop-blur-xl backdrop-saturate-150"
      >
         <div className="page flex h-16 items-center gap-6">
            <Link href={href('/')} className="flex h-11 items-center gap-3 rounded-full text-lg font-semibold">
               <BrandMark className="h-7" />
               Deckr
            </Link>

            {/* Phones and portrait tablets fold the links into the menu panel; they sit in the bar from `lg`. */}
            <nav aria-label={t.nav.main} className="ml-auto hidden lg:block">
               <ul className="flex items-center gap-6 font-medium">
                  <NavLinks pathname={pathname} />
               </ul>
            </nav>

            <div className="ml-auto flex min-w-0 items-center gap-1 lg:ml-0">
               {/* The query string is only known in the browser. In the menu panel below `lg`. */}
               <div className="hidden lg:block">
                  <Suspense fallback={<LanguageMenuTrigger disabled />}>
                     <LanguageMenu />
                  </Suspense>
               </div>
               <Account />
               <Collapsible.Trigger
                  className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-nav hover:text-ink lg:hidden"
                  aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
               >
                  {menuOpen ? <X aria-hidden className="size-5" /> : <MenuIcon aria-hidden className="size-5" />}
               </Collapsible.Trigger>
            </div>
         </div>

         <Collapsible.Panel className="h-(--collapsible-panel-height) overflow-hidden border-t border-white/[0.06] transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0 lg:hidden">
            <nav aria-label={t.nav.main}>
               <ul className="page py-2 text-base font-medium">
                  <NavLinks pathname={pathname} className="flex h-12 items-center" />
               </ul>
            </nav>
            <LanguageLinks className="page border-t border-white/[0.06] py-1 text-sm text-faint" />
            <InstallApp className="mx-4 mb-4 sm:mx-6" />
         </Collapsible.Panel>
      </Collapsible.Root>
   );
}

/** "Log in", or the signed-in player's menu: profile, refresh from Clash Royale, log out. */
function Account() {
   const { locale, t, href } = useI18n();
   const router = useRouter();
   const session = useSession();

   const logIn = (
      <Button variant="secondary" onClick={openLogin}>
         <LogIn aria-hidden />
         {t.common.logIn}
      </Button>
   );

   // While the session loads: "Log in" (the server's version), or a placeholder for the player's button when this
   // browser was signed in last time (lib/prepaint.ts).
   if (session.status !== 'signed-in') {
      return (
         <Prepaint
            ready={session.status === 'anonymous'}
            deps={['session']}
            placeholder={<Skeleton className="h-11 w-32 rounded-full pointer-fine:sm:h-9 sm:w-40" />}
         >
            {logIn}
         </Prepaint>
      );
   }

   const { player, syncing } = session;

   const refresh = async () => {
      try {
         await refreshPlayer();
         toast.success(t.common.playerDataRefreshed);
      } catch (error) {
         toast.error(t.common.couldNotRefresh(errorMessage(error, t)));
      }
   };

   return (
      <Menu>
         <MenuTrigger
            render={
               <Button
                  variant="ghost"
                  className="max-w-40 min-w-0 pr-3 pl-3 text-ink sm:max-w-56"
                  aria-label={t.account.label(player.name)}
               />
            }
         >
            <span className="truncate">{player.name}</span>
            <span className="num hidden items-center gap-1 text-muted sm:inline-flex">
               <Trophy aria-hidden className="text-gold" />
               {formatNumber(player.trophies, locale)}
            </span>
            <ChevronDown aria-hidden className="hidden text-muted sm:block" />
         </MenuTrigger>
         <MenuContent>
            <MenuItem onClick={() => router.push(href('/profile'))}>
               <UserRound aria-hidden />
               {t.account.profile}
            </MenuItem>
            <MenuItem onClick={refresh} disabled={syncing}>
               <RefreshCw aria-hidden className={cn(syncing && 'animate-spin')} />
               {syncing ? t.common.refreshing : t.account.refresh}
            </MenuItem>
            <MenuSeparator />
            <MenuItem
               onClick={async () => {
                  await logout();
                  toast.success(t.account.loggedOut);
               }}
            >
               <LogOut aria-hidden />
               {t.account.logOut}
            </MenuItem>
         </MenuContent>
      </Menu>
   );
}

function LanguageMenuTrigger(props: ComponentProps<typeof Button>) {
   const { locale, t } = useI18n();

   return (
      <Button
         variant="ghost"
         className="px-3 text-nav hover:text-ink"
         aria-label={t.nav.changeLanguage(localeConfig[locale].label)}
         {...props}
      >
         <Languages aria-hidden />
         <span className="text-xs font-semibold tracking-wide">{localeConfig[locale].label}</span>
      </Button>
   );
}

/** Switches to the same page, with the same query, in another language. */
function LanguageMenu() {
   const { locale } = useI18n();
   const router = useRouter();
   const pathname = usePathname();
   const query = useSearchParams().toString();

   return (
      <Menu>
         <MenuTrigger render={<LanguageMenuTrigger />} />
         <MenuContent>
            {locales.map((other) => (
               <MenuItem
                  key={other}
                  lang={localeConfig[other].htmlLang}
                  onClick={() => router.push(`${switchLocalePath(pathname, other)}${query ? `?${query}` : ''}`)}
               >
                  <Check aria-hidden className={cn(other !== locale && 'invisible')} />
                  {localeConfig[other].name}
               </MenuItem>
            ))}
         </MenuContent>
      </Menu>
   );
}
