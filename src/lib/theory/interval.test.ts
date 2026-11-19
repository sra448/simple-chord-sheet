import { describe, it, expect } from 'vitest';
import { intervalBetween, transpose } from './index.js';

describe('transpose', () => {
	it('spells a minor third above F as Ab (not G#)', () => {
		// The case where letter-aware transposition beats raw semitones
		expect(transpose('F4', 'm3')).toBe('Ab4');
	});

	it('spells a major third above C as E', () => {
		expect(transpose('C4', 'M3')).toBe('E4');
	});

	it('distinguishes A4 from d5 even though they sound identical', () => {
		// Same semitone count (6), different letter steps -> different spellings
		expect(transpose('C4', 'A4')).toBe('Fs4');
		expect(transpose('C4', 'd5')).toBe('Gb4');
	});

	it('crosses an octave correctly for a major third above B', () => {
		expect(transpose('B4', 'M3')).toBe('Ds5');
	});

	it('returns the root for a perfect unison', () => {
		expect(transpose('G4', 'P1')).toBe('G4');
	});

	it('moves down a perfect 5th from C5 to F4', () => {
		expect(transpose('C5', 'P5', 'down')).toBe('F4');
	});

	it('moves down a major 3rd from G4 to Eb4 (flat-key spelling)', () => {
		expect(transpose('G4', 'M3', 'down')).toBe('Eb4');
	});

	it('moves down a minor 3rd from E4 to Cs4 (sharp landing)', () => {
		expect(transpose('E4', 'm3', 'down')).toBe('Cs4');
	});

	it('moves down a perfect octave to the same letter, one octave lower', () => {
		expect(transpose('C4', 'P8', 'down')).toBe('C3');
	});

	it('moves down a perfect 5th from F4 to Bb3 (spelling-aware, descending)', () => {
		expect(transpose('F4', 'P5', 'down')).toBe('Bb3');
	});

	// COMPOUND INTERVALS — now expressible since intervals are computed, not table-bound.

	it('spells a major 9th above C4 as D5 (octave + M2)', () => {
		expect(transpose('C4', 'M9')).toBe('D5');
	});

	it('spells a perfect 11th above C4 as F5 (octave + P4)', () => {
		expect(transpose('C4', 'P11')).toBe('F5');
	});

	it('spells a minor 13th above C4 as Ab5 (octave + m6, flat-aware)', () => {
		expect(transpose('C4', 'm13')).toBe('Ab5');
	});

	it('keeps simple intervals identical to the old table (m3 above F → Ab)', () => {
		// regression guard: the computed vector must match the hand-written values it replaced
		expect(transpose('F4', 'm3')).toBe('Ab4');
		expect(transpose('C4', 'A4')).toBe('Fs4');
		expect(transpose('C4', 'd5')).toBe('Gb4');
		expect(transpose('C4', 'P8')).toBe('C5');
	});

	// PITCH CLASSES — the overload dispatches on the subject: no octave in, no octave out.

	it('transposes a pitch class to a pitch class, spelling-aware (F + m3 → Ab)', () => {
		expect(transpose('F', 'm3')).toBe('Ab');
	});

	it('crosses the octave seam invisibly for pitch classes (B + M3 → Ds)', () => {
		expect(transpose('B', 'M3')).toBe('Ds');
	});

	it('respects direction for pitch classes (C down a M3 → Ab, not E)', () => {
		expect(transpose('C', 'M3', 'down')).toBe('Ab');
	});

	it('collapses an octave to the identity for pitch classes (G + P8 → G)', () => {
		expect(transpose('G', 'P8')).toBe('G');
	});
});

describe('intervalBetween', () => {
	it('identifies a P5 within an octave', () => {
		expect(intervalBetween('C4', 'G4')).toBe('P5');
	});

	it('identifies a P5 across the octave boundary (F4 → C5)', () => {
		// the case that exercises the letterDistance wrap fix
		expect(intervalBetween('F4', 'C5')).toBe('P5');
	});

	it('identifies a m3 across the octave boundary (B4 → D5)', () => {
		expect(intervalBetween('B4', 'D5')).toBe('m3');
	});

	it('identifies a d5 across the octave boundary (B4 → F5)', () => {
		expect(intervalBetween('B4', 'F5')).toBe('d5');
	});

	it('distinguishes A4 from d5 by letter step (same semitones, different letters)', () => {
		expect(intervalBetween('C4', 'Fs4')).toBe('A4');
		expect(intervalBetween('C4', 'Gb4')).toBe('d5');
	});
});
