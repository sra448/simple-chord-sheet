import { strictFromEntries, strictObjectEntries, wrapIndex } from '../utils.js';

// PITCH LETTERS

const PITCH_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;

export type Letter = (typeof PITCH_LETTERS)[number];

export function transposeLetter(letter: Letter, delta: number): Letter {
	const index = PITCH_LETTERS.findIndex((l) => l === letter);
	return PITCH_LETTERS[wrapIndex(index + delta, PITCH_LETTERS.length)];
}

export function letterDistance(from: Letter, to: Letter): number {
	const fromIndex = PITCH_LETTERS.findIndex((letter) => from === letter);
	const toIndex = PITCH_LETTERS.findIndex((letter) => to === letter);
	return wrapIndex(toIndex - fromIndex, PITCH_LETTERS.length);
}

// PITCH CLASSES

const PITCH_CLASSES = [
	['C', 'Bs', 'Dbb'],
	['Cs', 'Db'],
	['D', 'Css', 'Ebb'],
	['Ds', 'Eb', 'Fbb'],
	['E', 'Fb', 'Dss'],
	['F', 'Es', 'Gbb'],
	['Fs', 'Gb'],
	['G', 'Fss', 'Abb'],
	['Gs', 'Ab'],
	['A', 'Gss', 'Bbb'],
	['As', 'Bb', 'Cbb'],
	['B', 'Cb', 'Ass']
] as const;

/** A pitch class — letter + accidental, no octave (e.g. 'C', 'Cs', 'Db', 'Dbb'). */
export type PitchClass = (typeof PITCH_CLASSES)[number][number];

// TODO: maybe these should be the first entries of PITCH_CLASSES?
export const ROOTS: PitchClass[] = [
	'C',
	'Db',
	'D',
	'Eb',
	'E',
	'F',
	'Fs',
	'G',
	'Ab',
	'A',
	'Bb',
	'B'
];

// PITCHES

const OCTAVES = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;
const MIDI_C0 = 12;

export const MIDI_BY_PITCH = strictFromEntries(
	OCTAVES.flatMap((octave) =>
		PITCH_CLASSES.flatMap((names, i) =>
			names.map((name) => [
				`${name}${octave}` as const,
				octave * PITCH_CLASSES.length + i + MIDI_C0
			])
		)
	)
);

const PITCH_BY_MIDI = strictObjectEntries(MIDI_BY_PITCH).reduce(
	(acc, [pitch, midi]) => {
		if (!acc[midi]) acc[midi] = [];
		acc[midi].push(pitch);
		return acc;
	},
	{} as Record<number, Pitch[]>
);

/** An octave number (0–8). */
export type Octave = (typeof OCTAVES)[number];

/** A specific pitch — pitch class with an explicit octave (e.g. 'C4', 'Fs5'). Range: C0–B8. */
export type Pitch = keyof typeof MIDI_BY_PITCH;

/** Constructs a pitch from a pitch class and octave (e.g. 'Cs' + 4 → 'Cs4'). */
export function toPitch(pitchClass: PitchClass, octave: Octave = 4): Pitch {
	return `${pitchClass}${octave}`;
}

/**
 * Returns the Pitch for a MIDI note number (60 → 'C4'), optionally favoring the first matching
 * spelling from `preferredSpellings` — e.g. pass a scale's pitch classes
 * (`scale(...).map(toPitchClass)`) to spell notes the way that key would.
 */
export function pitchFromMidi(midi: number, preferredSpellings?: PitchClass[]): Pitch {
	const pitches = PITCH_BY_MIDI[midi];

	if (preferredSpellings) {
		const symbol = preferredSpellings.find((pc) => pitches.some((p) => toPitchClass(p) === pc));
		if (symbol) return (symbol + Math.floor(midi / 12 - 1)) as Pitch;
	}

	return pitches[0];
}

/** Strips the octave from a pitch, returning its pitch class ('Fs5' → 'Fs'). */
export function toPitchClass(pitch: Pitch): PitchClass {
	return pitch.slice(0, -1) as PitchClass;
}

/**
 * Whether the string is a Pitch rather than a PitchClass. The two are disjoint — a pitch always
 * ends in an octave digit, a pitch class never does — so functions taking either can dispatch.
 */
export function isPitch(pitchOrPitchClass: Pitch | PitchClass): pitchOrPitchClass is Pitch {
	return pitchOrPitchClass in MIDI_BY_PITCH;
}

/**
 * Whether two pitches are enharmonically equal — the same key and octave, however spelled
 * ('Cs4' and 'Db4' → true; 'Cs4' and 'D4' → false). A pitch always equals itself.
 */
export function isSamePitch(a: Pitch, b: Pitch): boolean {
	return MIDI_BY_PITCH[a] === MIDI_BY_PITCH[b];
}

/**
 * Whether two pitch classes are enharmonically equal — the same key, however spelled
 * ('Cs' and 'Db' → true; 'Cs' and 'D' → false). A pitch class always equals itself.
 */
export function isSamePitchClass(a: PitchClass, b: PitchClass): boolean {
	return MIDI_BY_PITCH[`${a}4`] === MIDI_BY_PITCH[`${b}4`];
}

/**
 * The absolute diatonic position of a pitch, in letter-steps from C0 (C0 = 0, D0 = 1, … B0 = 6,
 * C1 = 7). Accidentals are ignored — C4 and C♯4 share a step — because that is exactly how a
 * staff places notes vertically (the accidental is drawn beside the notehead, not above/below it).
 */
export function diatonicStep(pitch: Pitch): number {
	const letter = pitch[0] as Letter;
	const octave = Number(pitch.slice(-1));
	return octave * PITCH_LETTERS.length + PITCH_LETTERS.indexOf(letter);
}

/**
 * Transposes a pitch by N semitones. Ascending prefers sharps/naturals, descending prefers
 * flats. Pass `preferredLetter` to force a specific letter (overrides direction-based choice).
 */
export function transposeSemitones(
	pitch: Pitch,
	semitones: number,
	preferredLetter?: Letter
): Pitch {
	const pitchNames = PITCH_BY_MIDI[MIDI_BY_PITCH[pitch] + semitones];

	if (preferredLetter) {
		return pitchNames.find((name) => name[0] === preferredLetter) ?? pitchNames[0];
	} else if (semitones < 0 && pitchNames[0].includes('s')) {
		return pitchNames[1];
	} else {
		return pitchNames[0];
	}
}

/**
 * Renders a pitch or pitch class for display, converting the internal ASCII accidentals to
 * their proper glyphs ('Cs4' → 'C♯4', 'Dbb' → 'D𝄫'). Octave digits pass through unchanged.
 */
export function format(pitchOrPitchClass: Pitch | PitchClass): string {
	return pitchOrPitchClass
		.replace('ss', '𝄪')
		.replace('bb', '𝄫')
		.replace('s', '♯')
		.replace('b', '♭');
}
