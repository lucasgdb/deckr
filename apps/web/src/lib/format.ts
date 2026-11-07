import { type Locale, localeConfig } from '@/i18n/config';

const steps: [Intl.RelativeTimeFormatUnit, number][] = [
   ['year', 365 * 24 * 3600],
   ['month', 30 * 24 * 3600],
   ['week', 7 * 24 * 3600],
   ['day', 24 * 3600],
   ['hour', 3600],
   ['minute', 60],
];

const relativeFormats = new Map<Locale, Intl.RelativeTimeFormat>();

function relativeFormat(locale: Locale) {
   let format = relativeFormats.get(locale);

   if (!format) {
      format = new Intl.RelativeTimeFormat(localeConfig[locale].intl, { numeric: 'auto' });
      relativeFormats.set(locale, format);
   }

   return format;
}

/** "3 hours ago" / "há 3 horas", "yesterday" / "ontem", "now" / "agora". */
export function timeAgo(iso: string, locale: Locale, now = Date.now()): string {
   const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
   const format = relativeFormat(locale);

   for (const [unit, size] of steps) {
      if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
   }

   return format.format(0, 'second');
}

/** 12,345 in English, 12.345 in Portuguese. */
export const formatNumber = (value: number, locale: Locale) => value.toLocaleString(localeConfig[locale].intl);

/** 52.3% / 52,3%. */
export const formatPercent = (part: number, whole: number, locale: Locale) =>
   whole > 0
      ? (part / whole).toLocaleString(localeConfig[locale].intl, {
           style: 'percent',
           minimumFractionDigits: 1,
           maximumFractionDigits: 1,
        })
      : '—';

/** Signed change: "+30", "−28", "0". */
export function formatChange(value: number): string {
   if (value > 0) return `+${value}`;
   if (value < 0) return `−${Math.abs(value)}`;
   return '0';
}

/** One decimal place in the reader's format: 3.4 / 3,4. */
export const formatDecimal = (value: number, locale: Locale) =>
   value.toLocaleString(localeConfig[locale].intl, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
