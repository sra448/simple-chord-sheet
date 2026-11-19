import {
	isPitch,
	type Letter,
	letterDistance,
	MIDI_BY_PITCH,
	type Pitch,
	type PitchClass,
	transposeLetter,
	transposeSemitones,
	toPitch,
	toPitchClass
} from './pitch.js';

// INTERVALS

// An interval is a quality + a number. The number counts letter-names spanned (unison = 1,
// 2nd = 2, … octave = 8, 9th = 9 …); the quality says how its size compares to the diatonic
// reference. Numbers split into two families that take different qualities:
//   - perfect-class — 1, 4, 5, 8 (and compounds 11, 12, 15): take P, can be A (+1) or d (−1).
//   - major/minor-class — 2, 3, 6, 7 (and compounds 9, 10, 13, 14): take M or m (M−1),
//     can be A (M+1) or d (m−1, i.e. M−2).
// The d-offset asymmetry (−1 for perfect, −2 for major) is why the maths below branches on class.

type PerfectNumber = 1 | 4 | 5 | 8 | 11 | 12 | 15;
type ImperfectNumber = 2 | 3 | 6 | 7 | 9 | 10 | 13 | 14;

/** A named interval — quality + number, up to a double octave ('M3', 'P5', 'A4', 'm9', 'P11'). */
export type Interval =
	`${'P' | 'A' | 'd'}${PerfectNumber}` | `${'M' | 'm' | 'A' | 'd'}${ImperfectNumber}`;

// Semitones of the major-scale degrees within an octave — the reference size of each letter-step.
const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11] as const;

/** Whether a 0-based letter-step is a perfect-class degree (unison, 4th, 5th). */
function isPerfectStep(step: number): boolean {
	return step === 0 || step === 3 || step === 4;
}

/** The semitone offset a quality applies to its diatonic reference, given the interval's class. */
function qualityOffset(quality: string, perfect: boolean): number | undefined {
	const offsets: Record<string, number> = perfect
		? { P: 0, A: 1, d: -1 }
		: { M: 0, m: -1, A: 1, d: -2 };
	return offsets[quality];
}

/**
 * The [letter-step, semitone] vector of an interval, computed from its name — no lookup table.
 * 'M3' → [2, 4], 'P5' → [4, 7]; compounds fall out for free ('M9' → [8, 14], 'P11' → [10, 17]).
 */
function intervalVector(interval: Interval): [letterStep: number, semitone: number] {
	const letterDelta = Number(interval.slice(1)) - 1;
	const step = letterDelta % 7;
	const base = Math.floor(letterDelta / 7) * 12 + MAJOR_STEPS[step];
	// The Interval type guarantees the quality matches the class, so the offset is always defined.
	const offset = qualityOffset(interval[0], isPerfectStep(step))!;
	return [letterDelta, base + offset];
}

/** Inverts intervalVector: names the interval for a [letter-step, semitone] vector, or undefined. */
function intervalName(letterDelta: number, semitones: number): Interval | undefined {
	const step = letterDelta % 7;
	const diff = semitones - (Math.floor(letterDelta / 7) * 12 + MAJOR_STEPS[step]);
	const quality = isPerfectStep(step)
		? diff === 0
			? 'P'
			: diff === 1
				? 'A'
				: diff === -1
					? 'd'
					: undefined
		: diff === 0
			? 'M'
			: diff === -1
				? 'm'
				: diff === 1
					? 'A'
					: diff === -2
						? 'd'
						: undefined;

	return quality ? (`${quality}${letterDelta + 1}` as Interval) : undefined;
}

/**
 * Transposes a pitch or pitch class by a named interval (e.g. 'M3', 'P5'), defaulting to
 * ascending. Output spelling follows the interval's letter step (so 'm3' above F → Ab, not G#).
 * The subject's kind is preserved: a pitch moves to a pitch ('F4' → 'Ab4'), a pitch class to a
 * pitch class ('F' → 'Ab').
 */
export function transpose(target: Pitch, by: Interval, direction?: 'up' | 'down'): Pitch;
export function transpose(target: PitchClass, by: Interval, direction?: 'up' | 'down'): PitchClass;
export function transpose(
	target: Pitch | PitchClass,
	by: Interval,
	direction: 'up' | 'down' = 'up'
): Pitch | PitchClass {
	if (!isPitch(target)) return toPitchClass(transpose(toPitch(target), by, direction));

	const [letterDelta, semitones] = intervalVector(by);
	const multiplier = direction === 'up' ? 1 : -1;
	const preferredLetter = transposeLetter(target[0] as Letter, letterDelta * multiplier);
	return transposeSemitones(target, semitones * multiplier, preferredLetter);
}

/**
 * Returns the named interval between two pitches (within an octave), or undefined if no
 * standard interval matches the letter-step + semitone combination.
 */
export function intervalBetween(from: Pitch, to: Pitch): Interval | undefined {
	const letterDelta = letterDistance(from[0] as Letter, to[0] as Letter);
	const semitones = MIDI_BY_PITCH[to] - MIDI_BY_PITCH[from];

	return intervalName(letterDelta, semitones);
}
