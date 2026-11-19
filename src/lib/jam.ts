import * as theory from './theory/index.js';

/**
 * A jam: a chord chart plus an optional scale to improvise with. Chords are stored relative to
 * the tonic (root interval + quality), so transposing the whole jam is just changing `key`.
 * The scale is always rooted on the key.
 */
export type Jam = {
	id: string;
	name: string;
	key: theory.PitchClass;
	chords: theory.ProgressionChord[];
	scale?: theory.ScaleName;
};

/** Chords shown per line of the sheet (so a 12-bar blues is three lines). */
export const BARS_PER_ROW = 4;

type Template = {
	label: string;
	chords: readonly theory.ProgressionChord[];
	scale?: theory.ScaleName;
};

export const TEMPLATES = {
	blank: { label: 'Blank', chords: [] },
	twelveBarBlues: {
		label: '12-bar blues',
		chords: theory.progression('twelveBarBlues'),
		scale: 'blues'
	},
	quickChange: {
		label: 'Quick-change blues',
		chords: theory.progression('quickChange'),
		scale: 'blues'
	},
	minorBlues: { label: 'Minor blues', chords: theory.progression('minorBlues'), scale: 'blues' }
} as const satisfies Record<string, Template>;

export type TemplateName = keyof typeof TEMPLATES;

export const TEMPLATE_NAMES = Object.keys(TEMPLATES) as TemplateName[];

export function jamFromTemplate(name: TemplateName): Jam {
	const template: Template = TEMPLATES[name];
	return {
		id: crypto.randomUUID(),
		name: name === 'blank' ? 'New jam' : template.label,
		key: 'C',
		chords: template.chords.map((chord) => ({ ...chord })),
		scale: template.scale
	};
}

/** One-line summary for lists ('C · 12 bars · blues'). */
export function describeJam(jam: Jam): string {
	const bars = `${jam.chords.length} ${jam.chords.length === 1 ? 'bar' : 'bars'}`;
	const parts = [theory.format(jam.key), bars];
	if (jam.scale) parts.push(theory.formatScaleName(jam.scale));
	return parts.join(' · ');
}
