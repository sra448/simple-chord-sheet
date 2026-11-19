// WHERE TO PICK UP
//
// The library is layered — pitch → interval → scale → chord — and each file imports only from
// the layers before it. This barrel re-exports the public API; module-level exports that are
// not re-exported here (Letter, MIDI_BY_PITCH, …) are internal to the theory package.
//
// Next feature (highest value) — CHORD SYMBOLS + VOICINGS, then chord detection:
// - A ChordSymbol models what a lead sheet writes: { root: PitchClass, quality, bass? } —
//   octave-free harmony. voice(symbol, octave?) realizes it as Pitch[]: close position from the
//   root, rotated until `bass` is lowest (G7/B → B-D-F-G, the 1st inversion). The octave anchors
//   the bass note; a non-chord-tone bass is deferred (decide: prepend below vs undefined).
//   Fills the empty INVERSIONS section in chord.ts.
// - chordQuality only matches root-position, ascending, exact shapes. A player on the MIDI
//   keyboard sends inversions and spread voicings (C major as E-G-C, doubled, across octaves).
//   To say "you played a C major triad, first inversion" you need to fold the notes to pitch
//   classes, find the root, then match — inversions and detection are the same problem from
//   two sides.
//
// Small conveniences (contained, build when needed):
// - midi -> Hz (440 * 2 ** ((midi - 69) / 12)) if the audio layer doesn't already own it;
//   it belongs next to pitchFromMidi in pitch.ts.
//
// Robustness papercuts (decide once, apply everywhere):
// - Out-of-range edge cases still crash: pitchFromMidi(0), transposeSemitones('B8', 1),
//   transpose('C0', 'P8', 'down'). Pick a policy (clamp / undefined / throw).
// - Hidden coupling between PITCH_CLASSES ordering and transposeSemitones (sharps-first,
//   flats-second). A comment at PITCH_CLASSES noting the order is load-bearing protects future-you.
//
// Deferred on purpose (only if a use case actually appears):
// - formatRomanNumeral assumes a 1-based degree from a 7-note scale. To re-enable Roman
//   numerals for pentatonic/blues, mint a branded ScaleDegree at the one spot degree is born.
// - Intervals are now computed up to the double octave (see intervalVector in interval.ts), so
//   9ths/11ths/13ths are expressible — extended chords just need entries added to CHORD_INTERVALS.

export {
	ROOTS,
	toPitch,
	pitchFromMidi,
	toPitchClass,
	isSamePitch,
	isSamePitchClass,
	diatonicStep,
	transposeSemitones,
	format
} from './pitch.js';
export type { PitchClass, Pitch, Octave } from './pitch.js';

export { transpose, intervalBetween } from './interval.js';
export type { Interval } from './interval.js';

export { SCALE_NAMES, scale, scaleTones, formatScaleName, keySignature } from './scale.js';
export type { ScaleName } from './scale.js';

export {
	CHORD_NAMES,
	chord,
	chordQuality,
	chordTones,
	CHORD_SIZES,
	diatonicChords,
	formatRomanNumeral,
	formatChordName
} from './chord.js';
export type { Chord, ChordQuality, DiatonicChord, ChordSize, ChordName } from './chord.js';

export {
	PROGRESSION_NAMES,
	PROGRESSION_ROOTS,
	progression,
	realize,
	formatProgressionNumeral
} from './progression.js';
export type { ProgressionChord, ProgressionName } from './progression.js';
