import { type Letter, type Pitch, type PitchClass, toPitchClass } from './pitch.js';
import { type Interval, transpose } from './interval.js';

// SCALES

const SCALE_INTERVALS = {
	major: ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'M7'],
	naturalMinor: ['P1', 'M2', 'm3', 'P4', 'P5', 'm6', 'm7'],
	harmonicMinor: ['P1', 'M2', 'm3', 'P4', 'P5', 'm6', 'M7'],
	melodicMinor: ['P1', 'M2', 'm3', 'P4', 'P5', 'M6', 'M7'],
	dorian: ['P1', 'M2', 'm3', 'P4', 'P5', 'M6', 'm7'],
	phrygian: ['P1', 'm2', 'm3', 'P4', 'P5', 'm6', 'm7'],
	lydian: ['P1', 'M2', 'M3', 'A4', 'P5', 'M6', 'M7'],
	mixolydian: ['P1', 'M2', 'M3', 'P4', 'P5', 'M6', 'm7'],
	locrian: ['P1', 'm2', 'm3', 'P4', 'd5', 'm6', 'm7'],
	// Non-heptatonic scales: fine to play over, but diatonicChords / Roman numerals assume 7 notes.
	blues: ['P1', 'm3', 'P4', 'd5', 'P5', 'm7'],
	majorPentatonic: ['P1', 'M2', 'M3', 'P5', 'M6'],
	minorPentatonic: ['P1', 'm3', 'P4', 'P5', 'm7']
} as const satisfies Record<string, readonly Interval[]>;

export type ScaleName = keyof typeof SCALE_INTERVALS;

export const SCALE_NAMES = Object.keys(SCALE_INTERVALS) as ScaleName[];

/** Builds the named scale starting from the root pitch (e.g. scale('C4', 'major')). */
export function scale(root: Pitch, patternName: ScaleName): Pitch[] {
	return SCALE_INTERVALS[patternName].map((interval) => transpose(root, interval));
}

/** The pitch classes of the named scale on a tonic — octave-free (scaleTones('C', 'blues')). */
export function scaleTones(tonic: PitchClass, patternName: ScaleName): PitchClass[] {
	return SCALE_INTERVALS[patternName].map((interval) => transpose(tonic, interval));
}

/** Renders a scale name for display ('naturalMinor' → 'natural minor'). */
export function formatScaleName(name: ScaleName): string {
	return name.replace(/[A-Z]/g, (upper) => ' ' + upper.toLowerCase());
}

// KEY SIGNATURES

// The order accidentals appear in a signature: each sharp is a 5th up, each flat a 4th up.
const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B'] as const satisfies readonly Letter[];
const FLAT_ORDER = ['B', 'E', 'A', 'D', 'G', 'C', 'F'] as const satisfies readonly Letter[];

/** Whether the letters are exactly a contiguous prefix of the order (so they form a valid signature). */
function isOrderPrefix(letters: Set<Letter>, order: readonly Letter[]): boolean {
	return [...letters].every((letter) => order.indexOf(letter) < letters.size);
}

/**
 * The key signature implied by a set of pitches: how many sharps or flats, when the accidentals
 * form a valid signature — a contiguous prefix of the canonical order (F C G D A E B for sharps,
 * B E A D G C F for flats). Count 0 is a natural key (C major / A minor). Returns undefined when
 * the accidentals don't form a clean signature (e.g. harmonic minor, whose raised 7th is an
 * accidental, not part of the signature) — callers should fall back to per-note accidentals.
 */
export function keySignature(
	pitches: Pitch[]
): { accidental: 'sharp' | 'flat'; count: number } | undefined {
	const sharps = new Set<Letter>();
	const flats = new Set<Letter>();
	for (const p of pitches) {
		const pc = toPitchClass(p);
		const letter = pc[0] as Letter;
		if (pc.includes('s')) sharps.add(letter);
		else if (pc.includes('b')) flats.add(letter);
	}

	if (sharps.size > 0 && flats.size > 0) return undefined; // mixed accidentals → no clean signature
	if (flats.size === 0 && isOrderPrefix(sharps, SHARP_ORDER)) {
		return { accidental: 'sharp', count: sharps.size };
	}
	if (sharps.size === 0 && isOrderPrefix(flats, FLAT_ORDER)) {
		return { accidental: 'flat', count: flats.size };
	}
	return undefined;
}
