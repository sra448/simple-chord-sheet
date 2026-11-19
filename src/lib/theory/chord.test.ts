import { describe, it, expect } from 'vitest';
import {
	chord,
	chordQuality,
	diatonicChords,
	formatChordName,
	formatRomanNumeral,
	scale
} from './index.js';

describe('chord', () => {
	it('builds a C major triad', () => {
		expect(chord('C4', 'major')).toEqual(['C4', 'E4', 'G4']);
	});

	it('builds an A minor triad with the octave wrap', () => {
		expect(chord('A4', 'minor')).toEqual(['A4', 'C5', 'E5']);
	});

	it('builds a C augmented triad with G# (not Ab) — the A5 case', () => {
		expect(chord('C4', 'augmented')).toEqual(['C4', 'E4', 'Gs4']);
	});

	it('builds a C diminished 7th with Bbb (not A) — the d7 case', () => {
		expect(chord('C4', 'diminished7')).toEqual(['C4', 'Eb4', 'Gb4', 'Bbb4']);
	});

	it('builds a C sus4 with no third', () => {
		expect(chord('C4', 'sus4')).toEqual(['C4', 'F4', 'G4']);
	});
});

describe('chordQuality', () => {
	it('identifies a major triad', () => {
		expect(chordQuality(['C4', 'E4', 'G4'])).toBe('major');
	});

	it('identifies a minor triad', () => {
		expect(chordQuality(['D4', 'F4', 'A4'])).toBe('minor');
	});

	it('identifies a diminished triad (B–D–F across the octave)', () => {
		expect(chordQuality(['B4', 'D5', 'F5'])).toBe('diminished');
	});

	it('identifies an augmented triad (the A5 case, not m6)', () => {
		expect(chordQuality(['C4', 'E4', 'Gs4'])).toBe('augmented');
	});

	it('distinguishes diminished7 from halfDiminished7', () => {
		expect(chordQuality(['C4', 'Eb4', 'Gb4', 'Bbb4'])).toBe('diminished7');
		expect(chordQuality(['C4', 'Eb4', 'Gb4', 'Bb4'])).toBe('halfDiminished7');
	});

	it('distinguishes the two augmented sevenths by their 7th (M7 vs m7)', () => {
		expect(chordQuality(['C4', 'E4', 'Gs4', 'B4'])).toBe('augmentedMajor7');
		expect(chordQuality(['C4', 'E4', 'Gs4', 'Bb4'])).toBe('augmented7');
	});

	it('returns undefined for non-standard interval combos', () => {
		// [P1, M3, M6] — not a triad shape in CHORD_INTERVALS
		expect(chordQuality(['C4', 'E4', 'A4'])).toBeUndefined();
	});
});

describe('diatonicChords', () => {
	it('identifies the C major chord qualities as I-ii-iii-IV-V-vi-vii°', () => {
		const result = diatonicChords(scale('C4', 'major'));
		expect(result.map((c) => c.quality)).toEqual([
			'major', // I
			'minor', // ii
			'minor', // iii
			'major', // IV
			'major', // V
			'minor', // vi
			'diminished' // vii°
		]);
	});

	it('tags each chord with its 1-indexed scale degree', () => {
		const result = diatonicChords(scale('C4', 'major'));
		expect(result.map((c) => c.degree)).toEqual([1, 2, 3, 4, 5, 6, 7]);
	});

	it('handles the octave wrap so V in C major is G4-B4-D5', () => {
		const result = diatonicChords(scale('C4', 'major'));
		expect(result[4].pitches).toEqual(['G4', 'B4', 'D5']);
	});

	it('identifies the augmented III+ in harmonic minor', () => {
		const result = diatonicChords(scale('A4', 'harmonicMinor'));
		expect(result.map((c) => c.quality)).toEqual([
			'minor', // i
			'diminished', // ii°
			'augmented', // III+
			'minor', // iv
			'major', // V
			'major', // VI
			'diminished' // vii°
		]);
	});

	// TODO: re-enable once non-7-tone scales (SCALE_INTERVALS_2) are wired back into scale().
	// it('produces some undefined qualities for non-7-note scales (blues)', () => {
	// 	const result = diatonicChords(scale('C4', 'blues'));
	// 	expect(result.some((c) => c.quality === undefined)).toBe(true);
	// });

	it('builds seventh chords in C major when type is "seventh"', () => {
		const result = diatonicChords(scale('C4', 'major'), 'seventh');
		expect(result.map((c) => c.quality)).toEqual([
			'major7', // Imaj7
			'minor7', // ii7
			'minor7', // iii7
			'major7', // IVmaj7
			'dominant7', // V7
			'minor7', // vi7
			'halfDiminished7' // viiø7
		]);
	});

	it('stacks a fourth note for sevenths, with octave wrap (V7 in C major is G4-B4-D5-F5)', () => {
		const result = diatonicChords(scale('C4', 'major'), 'seventh');
		expect(result[4].pitches).toEqual(['G4', 'B4', 'D5', 'F5']);
	});

	it('names every seventh chord of harmonic minor (incl. minorMajor7 and augmentedMajor7)', () => {
		const result = diatonicChords(scale('A4', 'harmonicMinor'), 'seventh');
		expect(result.map((c) => c.quality)).toEqual([
			'minorMajor7', // i(maj7)
			'halfDiminished7', // iiø7
			'augmentedMajor7', // III+maj7 — now in the dictionary
			'minor7', // iv7
			'dominant7', // V7
			'major7', // VImaj7
			'diminished7' // vii°7
		]);
	});

	it('still defaults to triads (three notes) when type is omitted', () => {
		const result = diatonicChords(scale('C4', 'major'));
		expect(result[0].pitches).toHaveLength(3);
	});
});

describe('formatChordName', () => {
	it('names a major triad with just the letter', () => {
		expect(formatChordName('C', 'major')).toBe('C');
	});

	it('names a minor triad with m', () => {
		expect(formatChordName('A', 'minor')).toBe('Am');
	});

	it('names a diminished triad with dim', () => {
		expect(formatChordName('B', 'diminished')).toBe('Bdim');
	});

	it('names an augmented triad with aug', () => {
		expect(formatChordName('C', 'augmented')).toBe('Caug');
	});

	it('names a dominant 7th with a bare 7', () => {
		expect(formatChordName('G', 'dominant7')).toBe('G7');
	});

	it('names a major 7th with maj7', () => {
		expect(formatChordName('C', 'major7')).toBe('Cmaj7');
	});

	it('names a minor 7th with m7', () => {
		expect(formatChordName('D', 'minor7')).toBe('Dm7');
	});

	it('names a diminished 7th with dim7', () => {
		expect(formatChordName('C', 'diminished7')).toBe('Cdim7');
	});

	it('names a half-diminished 7th with m7♭5', () => {
		expect(formatChordName('B', 'halfDiminished7')).toBe('Bm7♭5');
	});

	it('names a minor-major 7th with mMaj7', () => {
		expect(formatChordName('C', 'minorMajor7')).toBe('CmMaj7');
	});

	it('names an augmented major 7th with maj7♯5', () => {
		expect(formatChordName('C', 'augmentedMajor7')).toBe('Cmaj7♯5');
	});

	it('names an augmented (dominant) 7th with 7♯5', () => {
		expect(formatChordName('C', 'augmented7')).toBe('C7♯5');
	});

	it('names sus2 and sus4 chords', () => {
		expect(formatChordName('C', 'sus2')).toBe('Csus2');
		expect(formatChordName('C', 'sus4')).toBe('Csus4');
	});

	it('marks an unrecognized quality with ?', () => {
		expect(formatChordName('C', undefined)).toBe('C?');
	});

	it('renders an accidental root through format (F♯ minor)', () => {
		expect(formatChordName('Fs', 'minor')).toBe('F♯m');
	});

	it('renders a flat root through format (E♭ major 7)', () => {
		expect(formatChordName('Eb', 'major7')).toBe('E♭maj7');
	});
});

describe('formatRomanNumeral', () => {
	it('numbers the C major diatonic triads I–ii–iii–IV–V–vi–vii°', () => {
		// case carries the quality: uppercase = major, lowercase = minor, ° = diminished
		const result = diatonicChords(scale('C4', 'major'));
		expect(result.map((c) => formatRomanNumeral(c.degree, c.quality))).toEqual([
			'I',
			'ii',
			'iii',
			'IV',
			'V',
			'vi',
			'vii°'
		]);
	});

	it('numbers the A harmonic minor triads i–ii°–III+–iv–V–VI–vii°', () => {
		// adds the augmented (+) case and an uppercase III
		const result = diatonicChords(scale('A4', 'harmonicMinor'));
		expect(result.map((c) => formatRomanNumeral(c.degree, c.quality))).toEqual([
			'i',
			'ii°',
			'III+',
			'iv',
			'V',
			'VI',
			'vii°'
		]);
	});

	it('maps degree 1 to the first numeral, not the second (off-by-one guard)', () => {
		expect(formatRomanNumeral(1, 'major')).toBe('I');
	});

	it('maps degree 7 to vii°, exercising the top of the range', () => {
		expect(formatRomanNumeral(7, 'diminished')).toBe('vii°');
	});

	it('lowercases the numeral for a minor chord', () => {
		expect(formatRomanNumeral(2, 'minor')).toBe('ii');
	});

	it('keeps the numeral uppercase and adds + for an augmented chord', () => {
		expect(formatRomanNumeral(3, 'augmented')).toBe('III+');
	});

	// SEVENTH CHORDS — the cases the membership-list casing gets wrong.
	// In Roman analysis the lowercase already encodes the minor third, so the
	// suffix must NOT repeat it (i7, not im7; vii°7, not viidim7; iiø7, not iim7♭5).

	it('writes a dominant 7th as an uppercase numeral + 7 (V7)', () => {
		expect(formatRomanNumeral(5, 'dominant7')).toBe('V7');
	});

	it('writes a major 7th as an uppercase numeral + maj7', () => {
		expect(formatRomanNumeral(1, 'major7')).toBe('Imaj7');
	});

	it('lowercases a minor 7th and uses a bare 7 (ii7, not IIm7)', () => {
		expect(formatRomanNumeral(2, 'minor7')).toBe('ii7');
	});

	it('lowercases a diminished 7th with the ° symbol (vii°7, not VIIdim7)', () => {
		expect(formatRomanNumeral(7, 'diminished7')).toBe('vii°7');
	});

	it('lowercases a half-diminished 7th with the ø symbol (iiø7, not IIm7♭5)', () => {
		expect(formatRomanNumeral(2, 'halfDiminished7')).toBe('iiø7');
	});

	it('lowercases a minor-major 7th, keeping maj7 for the raised 7th (imaj7)', () => {
		expect(formatRomanNumeral(1, 'minorMajor7')).toBe('imaj7');
	});

	it('keeps an augmented major 7th uppercase with +maj7 (III+maj7)', () => {
		expect(formatRomanNumeral(3, 'augmentedMajor7')).toBe('III+maj7');
	});

	it('keeps an augmented 7th uppercase with +7 (V+7)', () => {
		expect(formatRomanNumeral(5, 'augmented7')).toBe('V+7');
	});

	// SUS CHORDS — no third, so the case is conventional (uppercase by default).

	it('renders sus chords uppercase, with the suffix carrying the meaning', () => {
		expect(formatRomanNumeral(1, 'sus2')).toBe('Isus2');
		expect(formatRomanNumeral(5, 'sus4')).toBe('Vsus4');
	});

	it('marks an unknown quality with ? (the non-7-note diatonic case)', () => {
		expect(formatRomanNumeral(1, undefined)).toBe('I?');
	});
});
