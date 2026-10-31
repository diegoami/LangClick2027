// What the learner is comparing with and reading in, and the interface text that
// follows. Interface strings live in locales/, outside the engine, so nothing here
// names a language: the two lists come from the locale files and the packs.

import en from '../../../locales/en.json';
import type { LayerChoice } from './packs';

type Key = keyof typeof en;
type Strings = Record<Key, string>;

const FALLBACK = 'en';
const STORAGE_KEY = 'langclick:settings:v1';

const localeFiles = import.meta.glob<Strings>('../../../locales/*.json', {
	eager: true,
	import: 'default'
});
const locales: Record<string, Strings> = Object.fromEntries(
	Object.entries(localeFiles).map(([file, strings]) => [
		file.replace(/^.*\/(.+)\.json$/, '$1'),
		strings
	])
);

export const availableLocales = Object.keys(locales).sort();

interface Saved {
	compareWith: string | null;
	explainIn: string;
}

function readSaved(): Saved | undefined {
	try {
		const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
		if (typeof parsed !== 'object' || parsed === null) return undefined;
		const { compareWith, explainIn } = parsed as Partial<Saved>;
		if (typeof explainIn !== 'string' || !locales[explainIn]) return undefined;
		return { compareWith: typeof compareWith === 'string' ? compareWith : null, explainIn };
	} catch {
		return undefined;
	}
}

function browserLocale(): string {
	const wanted = typeof navigator === 'undefined' ? FALLBACK : navigator.language.split('-')[0];
	return locales[wanted] ? wanted : FALLBACK;
}

const saved = readSaved();
let compareWith = $state<string | null>(saved?.compareWith ?? null);
let explainIn = $state<string>(saved?.explainIn ?? browserLocale());
let chosen = $state(saved !== undefined);

function save() {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ compareWith, explainIn }));
	} catch {
		// Blocked storage only means asking again next time.
	}
}

/** Whether the learner has been through the first choice yet. */
export function languagesChosen(): boolean {
	return chosen;
}

export function comparison(): string | null {
	return compareWith;
}

export function explanationLanguage(): string {
	return explainIn;
}

export function choice(): LayerChoice {
	return { compareWith: compareWith ?? undefined, explainIn };
}

export function chooseLanguages(next: { compareWith: string | null; explainIn: string }): void {
	compareWith = next.compareWith;
	explainIn = next.explainIn;
	chosen = true;
	save();
}

/** Interface text in the current language, with English behind any gap. */
export function t(key: Key, values: Record<string, string | number> = {}): string {
	const text = locales[explainIn]?.[key] ?? en[key];
	return text.replace(/\{(\w+)\}/g, (whole, name: string) => `${values[name] ?? whole}`);
}

/** A language's name, in the given language (its own by default). */
export function languageName(code: string, inLanguage: string = code): string {
	try {
		return new Intl.DisplayNames([inLanguage], { type: 'language' }).of(code) ?? code;
	} catch {
		return code;
	}
}

/** Tests only: as a reload with this saved. */
export function resetLanguages(next?: { compareWith: string | null; explainIn: string }): void {
	compareWith = next?.compareWith ?? null;
	explainIn = next?.explainIn ?? FALLBACK;
	chosen = next !== undefined;
}
