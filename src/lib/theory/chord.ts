import { strictObjectEntries } from '../utils.js';
import { format, type Pitch, type PitchClass } from './pitch.js';
import { type Interval, intervalBetween, transpose } from './interval.js';

// CHORDS

const CHORD_INTERVALS = {
	major: ['P1', 'M3', 'P5'],
	minor: ['P1', 'm3', 'P5'],
	diminished: ['P1', 'm3', 'd5'],
	augmented: ['P1', 'M3', 'A5'],
	dominant7: ['P1', 'M3', 'P5', 'm7'],
	major7: ['P1', 'M3', 'P5', 'M7'],
	minor7: ['P1', 'm3', 'P5', 'm7'],
	minorMajor7: ['P1', 'm3', 'P5', 'M7'],
	diminished7: ['P1', 'm3', 'd5', 'd7'],
	halfDiminished7: ['P1', 'm3', 'd5', 'm7'],
	augmentedMajor7: ['P1', 'M3', 'A5', 'M7'],
	augmented7: ['P1', 'M3', 'A5', 'm7'],
	sus2: ['P1', 'M2', 'P5'],
	sus4: ['P1', 'P4', 'P5']
} as const satisfies Record<string, readonly Interval[]>;

export const CHORD_NAMES = Object.keys(CHORD_INTERVALS) as (keyof typeof CHORD_INTERVALS)[];

export type ChordQuality = keyof typeof CHORD_INTERVALS;

export type Chord = {
	root: PitchClass;
	quality: ChordQuality;
	bass?: PitchClass;
};

/** A diatonic chord: its scale degree (1-based), pitches, and identified quality (if any). */
export type DiatonicChord = {
	degree: number;
	pitches: Pitch[];
	quality?: ChordQuality;
};

/** Builds the named chord type starting from the root pitch (e.g. chord('C4', 'minor')). */
export function chordTones(chord: Chord): PitchClass[] {
	return CHORD_INTERVALS[chord.quality].map((interval) => transpose(chord.root, interval));
}

/** Builds the named chord type starting from the root pitch (e.g. chord('C4', 'minor')). */
export function chord(root: Pitch, name: ChordQuality): Pitch[] {
	return CHORD_INTERVALS[name].map((interval) => transpose(root, interval));
}

/**
 * Identifies a chord's quality (major, minor, diminished, etc.) from its pitches.
 * Expects pitches in root position, ascending. Returns undefined for unrecognized shapes.
 */
export function chordQuality(chordPitches: Pitch[]): ChordQuality | undefined {
	const chordIntervals = chordPitches.map((pitchName, i) =>
		i === 0 ? 'P1' : intervalBetween(chordPitches[0], pitchName)
	);

	if (chordIntervals.some((x) => !x)) return undefined;

	return strictObjectEntries(CHORD_INTERVALS).find(
		([, intervals]) => intervals.join(' ') === chordIntervals.join(' ')
	)?.[0];
}

// INVERSIONS

// DIATONIC CHORDS

/** Scale-degree offsets to stack from each root, by chord size. */
const STACKED_THIRDS = {
	triad: [0, 2, 4],
	seventh: [0, 2, 4, 6]
	// ninth: [0, 2, 4, 6, 8]
} as const;

/** Chord sizes offered as picker options (radio buttons). */
export const CHORD_SIZES = Object.keys(STACKED_THIRDS) as (keyof typeof STACKED_THIRDS)[];

export type ChordSize = keyof typeof STACKED_THIRDS;

/** Returns the pitch at `index`, wrapping past the top of the collection up the octaves. */
function pitchAt(pitches: Pitch[], index: number): Pitch {
	const length = pitches.length;
	let pitch = pitches[index % length];
	for (let octave = 0; octave < Math.floor(index / length); octave++) {
		pitch = transpose(pitch, 'P8');
	}
	return pitch;
}

/**
 * Builds the diatonic chords of a scale by stacking thirds from each scale degree.
 * `type` chooses how many thirds to stack (triad → 3 notes, seventh → 4, ninth → 5). Returns one
 * chord per scale pitch; octave wrap is handled at the scale boundary.
 */
export function diatonicChords(scalePitches: Pitch[], type: ChordSize = 'triad'): DiatonicChord[] {
	return scalePitches.map((_root, i) => {
		const pitches = STACKED_THIRDS[type].map((offset) => pitchAt(scalePitches, i + offset));
		return {
			degree: i + 1,
			quality: chordQuality(pitches),
			pitches
		};
	});
}

// HUMAN READABLE NAMES

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'] as const;
const ROMAN_QUALITIES = {
	major: { case: 'upper', suffix: '' },
	minor: { case: 'lower', suffix: '' },
	diminished: { case: 'lower', suffix: '°' },
	augmented: { case: 'upper', suffix: '+' },
	dominant7: { case: 'upper', suffix: '7' },
	major7: { case: 'upper', suffix: 'maj7' },
	minor7: { case: 'lower', suffix: '7' },
	minorMajor7: { case: 'lower', suffix: 'maj7' },
	diminished7: { case: 'lower', suffix: '°7' },
	halfDiminished7: { case: 'lower', suffix: 'ø7' },
	augmentedMajor7: { case: 'upper', suffix: '+maj7' },
	augmented7: { case: 'upper', suffix: '+7' },
	sus2: { case: 'upper', suffix: 'sus2' },
	sus4: { case: 'upper', suffix: 'sus4' }
} as const satisfies Record<ChordQuality, { case: 'upper' | 'lower'; suffix: string }>;

/**
 * Formats a chord as a Roman numeral for harmonic analysis (degree 2 + 'minor' → 'ii').
 * Case encodes the third (upper = major, lower = minor) and a suffix marks the quality
 * (°, +, 7, …). Expects a 1-based degree from a 7-note scale; unknown quality → trailing '?'.
 */
export function formatRomanNumeral(degree: number, quality: ChordQuality | undefined): string {
	const numeral = ROMAN_NUMERALS[degree - 1];
	if (!quality) return numeral + '?';
	const { case: casing, suffix } = ROMAN_QUALITIES[quality];
	return (casing === 'lower' ? numeral.toLowerCase() : numeral) + suffix;
}

const CHORD_QUALITY_SYMBOLS = {
	major: '',
	minor: 'm',
	diminished: 'dim',
	augmented: 'aug',
	dominant7: '7',
	major7: 'maj7',
	minor7: 'm7',
	minorMajor7: 'mMaj7',
	diminished7: 'dim7',
	halfDiminished7: 'm7♭5',
	augmentedMajor7: 'maj7♯5',
	augmented7: '7♯5',
	sus2: 'sus2',
	sus4: 'sus4'
} as const satisfies Record<ChordQuality, string>;

export type ChordName = `${PitchClass}${(typeof CHORD_QUALITY_SYMBOLS)[ChordQuality]}`;

/**
 * Formats a chord as a lead-sheet symbol ('Eb4' + 'minor7' → 'E♭m7'). The root is rendered
 * with proper accidental glyphs; unknown quality → trailing '?'.
 */
export function formatChordName(root: PitchClass, quality: ChordQuality | undefined): string {
	const symbol = format(root);
	if (!quality) return symbol + '?';
	return symbol + CHORD_QUALITY_SYMBOLS[quality];
}
