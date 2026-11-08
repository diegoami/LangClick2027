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
	targetPack?: string;
	compareWith: string | null;
	explainIn: string;
}

function readSaved(): Saved | undefined {
	try {
		const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
		if (typeof parsed !== 'object' || parsed === null) return undefined;
		const { compareWith, explainIn, targetPack } = parsed as Partial<Saved>;
		if (typeof explainIn !== 'string' || !locales[explainIn]) return undefined;
		return {
			compareWith: typeof compareWith === 'string' ? compareWith : null,
			explainIn,
			targetPack: typeof targetPack === 'string' ? targetPack : undefined
		};
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
let targetPack = $state<string | undefined>(saved?.targetPack);

function save() {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ compareWith, explainIn, targetPack }));
	} catch {
		// Blocked storage only means asking again next time.
	}
}

/** Last explicitly selected course; the picker validates it against available packs. */
export function targetPackId(): string | undefined {
	return targetPack;
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

export function chooseLanguages(next: Saved): void {
	compareWith = next.compareWith;
	explainIn = next.explainIn;
	targetPack = next.targetPack;
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
export function resetLanguages(next?: Saved): void {
	compareWith = next?.compareWith ?? null;
	explainIn = next?.explainIn ?? FALLBACK;
	targetPack = next?.targetPack;
}
