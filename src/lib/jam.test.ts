import { describe, expect, it } from 'vitest';
import { describeJam, jamFromTemplate, migrateJam, newPart, partLabel } from './jam.js';

describe('migrateJam', () => {
	it('turns a flat chord list into a single unnamed part', () => {
		const jam = migrateJam({
			id: 'a',
			name: 'Old blues',
			key: 'Eb',
			scale: 'blues',
			chords: [
				{ root: 'P1', quality: 'dominant7' },
				{ root: 'P4', quality: 'dominant7' }
			]
		});

		expect(jam).not.toHaveProperty('chords');
		expect(jam).toMatchObject({ id: 'a', name: 'Old blues', key: 'Eb', scale: 'blues' });
		expect(jam.parts).toHaveLength(1);
		expect(jam.parts[0].name).toBe('');
		expect(jam.parts[0].chords).toEqual([
			{ root: 'P1', quality: 'dominant7' },
			{ root: 'P4', quality: 'dominant7' }
		]);
	});

	it('leaves a jam that already has parts untouched', () => {
		const jam = jamFromTemplate('twelveBarBlues');
		expect(migrateJam(jam)).toBe(jam);
	});
});

describe('partLabel', () => {
	it('falls back to the position for unnamed parts', () => {
		const jam = jamFromTemplate('blank');
		jam.parts.push(newPart('Chorus'), newPart('  '));
		expect(jam.parts.map((part) => partLabel(jam, part))).toEqual(['Part 1', 'Chorus', 'Part 3']);
	});
});

describe('describeJam', () => {
	it('counts bars across parts', () => {
		const jam = jamFromTemplate('twelveBarBlues');
		expect(describeJam(jam)).toBe('C · 12 bars · blues');
		jam.parts.push(newPart('Bridge', [{ root: 'P5', quality: 'major' }]));
		expect(describeJam(jam)).toBe('C · 2 parts · 13 bars · blues');
	});
});
