import { describe, it, expect } from 'vitest';
import {
	diatonicStep,
	format,
	isSamePitchClass,
	pitchFromMidi,
	scale,
	toPitchClass,
	transposeSemitones
} from './index.js';

/** The pitch-class spellings of a scale — the natural way to build a spelling preference. */
function spellingsOf(...args: Parameters<typeof scale>) {
	return scale(...args).map(toPitchClass);
}

describe('pitchFromMidi', () => {
	it('returns middle C for MIDI 60', () => {
		expect(pitchFromMidi(60)).toBe('C4');
	});

	it('returns A0 for the lowest standard piano key (MIDI 21)', () => {
		expect(pitchFromMidi(21)).toBe('A0');
	});

	it('returns C8 for the highest standard piano key (MIDI 108)', () => {
		expect(pitchFromMidi(108)).toBe('C8');
	});

	it('picks the natural spelling first for black-key pitches', () => {
		// MIDI 61 is enharmonically C#/Db; the natural-sharp comes first in PITCH_CLASSES
		expect(pitchFromMidi(61)).toBe('Cs4');
	});

	it('spells a black key as a sharp when the preferred spellings contain the sharp (D major → C♯)', () => {
		expect(pitchFromMidi(61, spellingsOf('D4', 'major'))).toBe('Cs4');
	});

	it('spells the same black key as a flat in a flat key (A♭ major → D♭)', () => {
		expect(pitchFromMidi(61, spellingsOf('Ab4', 'major'))).toBe('Db4');
	});

	it('flips the spelling of one MIDI note based on the preference', () => {
		// the headline: same input, opposite spelling
		expect(pitchFromMidi(61, spellingsOf('D4', 'major'))).toBe('Cs4');
		expect(pitchFromMidi(61, spellingsOf('Ab4', 'major'))).toBe('Db4');
	});

	it('falls back to the canonical spelling for a note foreign to the preference (C♯ in C major)', () => {
		// neither C# nor Db is diatonic to C major, so there is no key-correct spelling
		expect(pitchFromMidi(61, spellingsOf('C4', 'major'))).toBe(pitchFromMidi(61));
	});

	it('picks the exact enharmonic spelling even in a remote key (F♯ major → E♯, not F)', () => {
		expect(pitchFromMidi(65)).toBe('F4');
		expect(pitchFromMidi(65, spellingsOf('Fs4', 'major'))).toBe('Es4');
	});

	it('spells a flat via a minor key (C natural minor → E♭, not D♯)', () => {
		expect(pitchFromMidi(63)).toBe('Ds4');
		expect(pitchFromMidi(63, spellingsOf('C4', 'naturalMinor'))).toBe('Eb4');
	});

	it("respects the caller's scale choice: harmonic minor's raised 7th (A harmonic minor → G♯)", () => {
		expect(pitchFromMidi(68, spellingsOf('A4', 'harmonicMinor'))).toBe('Gs4');
	});

	it('accepts any preference list, not just a scale', () => {
		// the reason the parameter is spellings, not a key: callers with non-7-note note
		// sets (blues scale, pentatonics) can spell too
		expect(pitchFromMidi(61, ['Db'])).toBe('Db4');
	});
});

describe('transposeSemitones', () => {
	it('moves up within an octave', () => {
		expect(transposeSemitones('C4', 7)).toBe('G4');
	});

	it('crosses octave boundaries upward', () => {
		expect(transposeSemitones('B4', 1)).toBe('C5');
	});

	it('prefers a sharp spelling when ascending into a black key', () => {
		expect(transposeSemitones('C4', 1)).toBe('Cs4');
	});

	it('prefers a flat spelling when descending into a black key', () => {
		// the descending-chromatic convention: down moves use flats
		expect(transposeSemitones('C4', -2)).toBe('Bb3');
	});

	it('returns the natural when descending lands on a white key', () => {
		expect(transposeSemitones('C4', -1)).toBe('B3');
	});

	it('descends by an octave to the same letter', () => {
		expect(transposeSemitones('C4', -12)).toBe('C3');
	});
});

describe('format', () => {
	it('leaves a natural pitch class untouched', () => {
		expect(format('C')).toBe('C');
	});

	it('renders a single sharp as ♯', () => {
		expect(format('Cs')).toBe('C♯');
	});

	it('renders a single flat as ♭', () => {
		expect(format('Db')).toBe('D♭');
	});

	it('renders a double sharp as the single 𝄪 glyph (not ♯♯)', () => {
		expect(format('Css')).toBe('C𝄪');
	});

	it('renders a double flat as the single 𝄫 glyph (not ♭♭)', () => {
		expect(format('Dbb')).toBe('D𝄫');
	});

	it('passes the octave digit through unchanged', () => {
		expect(format('Cs4')).toBe('C♯4');
	});

	it('does not mistake the letter B for a flat (Bb4 → B♭4)', () => {
		// 'Bb4' has only one lowercase 'b', so the 'bb' rule must not fire
		expect(format('Bb4')).toBe('B♭4');
	});

	it('handles a double flat with an octave (Bbb4 → B𝄫4)', () => {
		expect(format('Bbb4')).toBe('B𝄫4');
	});
});

describe('isSamePitchClass', () => {
	it('treats a pitch class as equal to itself', () => {
		expect(isSamePitchClass('C', 'C')).toBe(true);
	});

	it('treats enharmonic spellings as equal (C♯ and D♭)', () => {
		expect(isSamePitchClass('Cs', 'Db')).toBe(true);
	});

	it('is symmetric (D♭ and C♯)', () => {
		expect(isSamePitchClass('Db', 'Cs')).toBe(true);
	});

	it('equates a natural with its double-accidental spellings (C, B♯, D𝄫)', () => {
		expect(isSamePitchClass('C', 'Bs')).toBe(true);
		expect(isSamePitchClass('C', 'Dbb')).toBe(true);
	});

	it('equates white-key enharmonics (B and C♭, E and F♭)', () => {
		expect(isSamePitchClass('B', 'Cb')).toBe(true);
		expect(isSamePitchClass('E', 'Fb')).toBe(true);
	});

	it('returns false for adjacent but distinct pitch classes (C♯ vs D)', () => {
		expect(isSamePitchClass('Cs', 'D')).toBe(false);
	});

	it('returns false for clearly different pitch classes (C vs G)', () => {
		expect(isSamePitchClass('C', 'G')).toBe(false);
	});
});

describe('diatonicStep', () => {
	it('counts letter-steps from C0 (C0 = 0)', () => {
		expect(diatonicStep('C0')).toBe(0);
	});

	it('places middle C at step 28 (4 octaves × 7 letters)', () => {
		expect(diatonicStep('C4')).toBe(28);
	});

	it('matches the treble staff lines: E4 (bottom) = 30, F5 (top) = 38', () => {
		expect(diatonicStep('E4')).toBe(30);
		expect(diatonicStep('F5')).toBe(38);
	});

	it('ignores accidentals — C♯4 and C♭4 share C4’s step', () => {
		expect(diatonicStep('Cs4')).toBe(diatonicStep('C4'));
		expect(diatonicStep('Cb4')).toBe(diatonicStep('C4'));
	});

	it('still distinguishes different letters (D♭4 sits a step above C4)', () => {
		expect(diatonicStep('Db4')).toBe(diatonicStep('C4') + 1);
	});
});
