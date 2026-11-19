import { describe, it, expect } from 'vitest';
import { PROGRESSION_NAMES, progression, realize } from './index.js';

describe('progression catalog', () => {
	it('offers the three blues variants', () => {
		expect(PROGRESSION_NAMES).toEqual(['twelveBarBlues', 'quickChange', 'minorBlues']);
	});

	it('gives every progression twelve bars', () => {
		for (const name of PROGRESSION_NAMES) {
			expect(progression(name)).toHaveLength(12);
		}
	});

	it('puts the turnaround V in bar 12 of every variant, so the form loops', () => {
		for (const name of PROGRESSION_NAMES) {
			expect(progression(name)[11].root).toBe('P5');
		}
	});

	it('quickChange differs from the classic only in bar 2 (the early move to IV7)', () => {
		const classic = progression('twelveBarBlues');
		const quick = progression('quickChange');
		expect(quick[1]).toEqual({ root: 'P4', quality: 'dominant7' });
		quick.forEach((bar, i) => {
			if (i !== 1) expect(bar).toEqual(classic[i]);
		});
	});

	it('minorBlues shares the classic root movement exactly — only qualities differ', () => {
		const classic = progression('twelveBarBlues');
		const minor = progression('minorBlues');
		expect(minor.map((bar) => bar.root)).toEqual(classic.map((bar) => bar.root));
	});

	it('minorBlues keeps the dominant quality on V (the borrowed leading tone)', () => {
		const minor = progression('minorBlues');
		expect(minor[0].quality).toBe('minor7'); // i7
		expect(minor[4].quality).toBe('minor7'); // iv7
		expect(minor[8].quality).toBe('dominant7'); // V7 in bar 9
		expect(minor[11].quality).toBe('dominant7'); // V7 turnaround
	});
});

describe('realize', () => {
	it('realizes the classic blues in C as C7 / F7 / G7', () => {
		const bars = realize('C', progression('twelveBarBlues'));
		expect(bars[0]).toEqual({ root: 'C', quality: 'dominant7' });
		expect(bars[4]).toEqual({ root: 'F', quality: 'dominant7' });
		expect(bars[8]).toEqual({ root: 'G', quality: 'dominant7' });
	});

	it('spells sharp keys correctly (F♯ blues: IV = B, V = C♯)', () => {
		const bars = realize('Fs', progression('twelveBarBlues'));
		expect(bars[4].root).toBe('B');
		expect(bars[8].root).toBe('Cs');
	});

	it('spells flat keys correctly (E♭ blues: IV = A♭, V = B♭)', () => {
		const bars = realize('Eb', progression('twelveBarBlues'));
		expect(bars[4].root).toBe('Ab');
		expect(bars[8].root).toBe('Bb');
	});

	it('carries the qualities through untouched (minor blues in A)', () => {
		const bars = realize('A', progression('minorBlues'));
		expect(bars[0]).toEqual({ root: 'A', quality: 'minor7' });
		expect(bars[4]).toEqual({ root: 'D', quality: 'minor7' });
		expect(bars[8]).toEqual({ root: 'E', quality: 'dominant7' });
	});
});
