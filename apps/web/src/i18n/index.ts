import type { Locale } from './config';
import en from './dictionaries/en';
import { type Dictionary, default as ptBr } from './dictionaries/pt-br';

export * from './config';
export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { 'pt-br': ptBr, en };

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];
