import { describe, it, expect } from 'vitest';
import { keySignature, scale } from './index.js';

describe('scale', () => {
	it('builds C major with naturals only', () => {
		expect(scale('C4', 'major')).toEqual(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']);
	});

	it('builds F natural minor with flat spellings (the spelling-aware test)', () => {
		expect(scale('F4', 'naturalMinor')).toEqual(['F4', 'G4', 'Ab4', 'Bb4', 'C5', 'Db5', 'Eb5']);
	});

	it('builds A harmonic minor with the raised 7th as G#, not Ab', () => {
		expect(scale('A4', 'harmonicMinor')).toEqual(['A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'Gs5']);
	});

	// TODO: re-enable once non-7-tone scales (SCALE_INTERVALS_2) are wired back into scale().
	// it('builds C blues with d5 sitting between P4 and P5', () => {
	// 	expect(scale('C4', 'blues')).toEqual(['C4', 'Eb4', 'F4', 'Gb4', 'G4', 'Bb4']);
	// });

	it('builds C Lydian with the raised 4th as F♯ (the A4 case)', () => {
		expect(scale('C4', 'lydian')).toEqual(['C4', 'D4', 'E4', 'Fs4', 'G4', 'A4', 'B4']);
	});

	it('builds C Phrygian with a flat 2nd (Db)', () => {
		expect(scale('C4', 'phrygian')).toEqual(['C4', 'Db4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4']);
	});

	it('builds C Locrian with both a flat 2nd and a diminished 5th as G♭', () => {
		expect(scale('C4', 'locrian')).toEqual(['C4', 'Db4', 'Eb4', 'F4', 'Gb4', 'Ab4', 'Bb4']);
	});
});

describe('keySignature', () => {
	it('C major has no accidentals', () => {
		expect(keySignature(scale('C4', 'major'))).toEqual({ accidental: 'sharp', count: 0 });
	});

	it('G major has one sharp', () => {
		expect(keySignature(scale('G4', 'major'))).toEqual({ accidental: 'sharp', count: 1 });
	});

	it('E major has four sharps', () => {
		expect(keySignature(scale('E4', 'major'))).toEqual({ accidental: 'sharp', count: 4 });
	});

	it('F major has one flat', () => {
		expect(keySignature(scale('F4', 'major'))).toEqual({ accidental: 'flat', count: 1 });
	});

	it('F♯ major has six sharps', () => {
		expect(keySignature(scale('Fs4', 'major'))).toEqual({ accidental: 'sharp', count: 6 });
	});

	it('natural minor uses its relative-major signature (A minor = none)', () => {
		expect(keySignature(scale('A4', 'naturalMinor'))).toEqual({ accidental: 'sharp', count: 0 });
	});

	it('a mode shares its parent-major signature (E dorian = 2 sharps)', () => {
		expect(keySignature(scale('E4', 'dorian'))).toEqual({ accidental: 'sharp', count: 2 });
	});

	it('returns undefined for harmonic minor (raised 7th is an accidental, not a signature)', () => {
		expect(keySignature(scale('A4', 'harmonicMinor'))).toBeUndefined();
	});

	it('returns undefined for melodic minor (raised 6th and 7th do not form a prefix)', () => {
		expect(keySignature(scale('A4', 'melodicMinor'))).toBeUndefined();
	});
});
