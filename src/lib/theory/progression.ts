import { type Chord, type ChordQuality, formatRomanNumeral } from './chord.js';
import { type Interval, transpose } from './interval.js';
import type { PitchClass } from './pitch.js';

// PROGRESSIONS

/** One bar of a key-independent progression: a root interval above the tonic, plus a quality. */
export type ProgressionChord = {
	root: Interval;
	quality: ChordQuality;
};

/**
 * The twelve chromatic root positions offered when building a progression by hand, one spelling
 * per semitone above the tonic (the tritone is spelled as a ♭5).
 */
export const PROGRESSION_ROOTS = [
	'P1',
	'm2',
	'M2',
	'm3',
	'M3',
	'P4',
	'd5',
	'P5',
	'm6',
	'M6',
	'm7',
	'M7'
] as const satisfies readonly Interval[];

/**
 * Formats a progression chord as a Roman numeral relative to the tonic, with an accidental for
 * chromatic roots ({ root: 'm3', quality: 'major' } → '♭III').
 */
export function formatProgressionNumeral({ root, quality }: ProgressionChord): string {
	const degree = ((Number(root.slice(1)) - 1) % 7) + 1;
	const accidental = root[0] === 'A' ? '♯' : root[0] === 'm' || root[0] === 'd' ? '♭' : '';
	return accidental + formatRomanNumeral(degree, quality);
}

// Local numeral constants so the catalog reads like a lead sheet. These are just identifiers —
// Roman numerals as *strings* stay a display format (see formatRomanNumeral), never a model.

const I7: ProgressionChord = { root: 'P1', quality: 'dominant7' };
const IV7: ProgressionChord = { root: 'P4', quality: 'dominant7' };
const V7: ProgressionChord = { root: 'P5', quality: 'dominant7' };
const i7: ProgressionChord = { root: 'P1', quality: 'minor7' };
const iv7: ProgressionChord = { root: 'P4', quality: 'minor7' };

/**
 * The 12-bar blues family. All entries share the classic three-phrase skeleton — tonic (bars
 * 1–4), subdominant (5–8), dominant + turnaround (9–12) — and differ in one deliberate way each:
 *  - twelveBarBlues: the classic, all-dominant harmony on I, IV, V.
 *  - quickChange: bar 2 moves to IV7 early; otherwise identical to the classic.
 *  - minorBlues: the classic root movement with i7/iv7 qualities; V7 stays dominant — the
 *    borrowed leading tone that keeps the pull back home.
 */
const PROGRESSIONS = {
	twelveBarBlues: [I7, I7, I7, I7, IV7, IV7, I7, I7, V7, IV7, I7, V7],
	quickChange: [I7, IV7, I7, I7, IV7, IV7, I7, I7, V7, IV7, I7, V7],
	minorBlues: [i7, i7, i7, i7, iv7, iv7, i7, i7, V7, iv7, i7, V7]
} as const satisfies Record<string, readonly ProgressionChord[]>;

export type ProgressionName = keyof typeof PROGRESSIONS;

/** Progression names offered as picker options, in catalog order. */
export const PROGRESSION_NAMES = Object.keys(PROGRESSIONS) as ProgressionName[];

/** Returns the named progression's bars — key-independent; feed them to realize(). */
export function progression(name: ProgressionName): readonly ProgressionChord[] {
	return PROGRESSIONS[name];
}

/** Realizes a key-independent progression in a key: each bar's root becomes a pitch class. */
export function realize(tonic: PitchClass, progression: readonly ProgressionChord[]): Chord[] {
	return progression.map(({ root, quality }) => ({ root: transpose(tonic, root), quality }));
}
