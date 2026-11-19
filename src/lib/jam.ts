import * as theory from './theory/index.js';

/** One section of a song — intro, verse, chorus, … — with its own run of chords. */
export type Part = {
	id: string;
	/** May be empty; see partLabel(). */
	name: string;
	chords: theory.ProgressionChord[];
};

/** Whether a key is major or minor. */
export type Mode = 'major' | 'minor';

/**
 * A jam: one or more parts of chords plus an optional scale to improvise with. Chords are stored
 * relative to the tonic (root interval + quality), so transposing the whole jam is just changing
 * `key`. The scale is always rooted on the key.
 *
 * `mode` names the key (E♭ major vs. E♭ minor) and decides how its tonic is spelled; it does not
 * change the chords. Jams saved before it existed have none and count as major.
 */
export type Jam = {
	id: string;
	name: string;
	key: theory.PitchClass;
	mode?: Mode;
	parts: Part[];
	scale?: theory.ScaleName;
};

/** Renders a key the way a chord of that name would be written ('Eb' + 'minor' → 'E♭m'). */
export function formatKey(tonic: theory.PitchClass, mode: Mode = 'major'): string {
	return theory.format(tonic) + (mode === 'minor' ? 'm' : '');
}

/** Names offered as suggestions when naming a part. */
export const PART_NAMES = ['Intro', 'Verse', 'Pre-chorus', 'Chorus', 'Bridge', 'Solo', 'Outro'];

export function newPart(name = '', chords: readonly theory.ProgressionChord[] = []): Part {
	return { id: crypto.randomUUID(), name, chords: chords.map((chord) => ({ ...chord })) };
}

/** What to call a part on screen: its name, or its position if it has none. */
export function partLabel(jam: Jam, part: Part): string {
	return part.name.trim() || `Part ${jam.parts.indexOf(part) + 1}`;
}

/**
 * Brings a stored jam up to the current shape. Jams saved before parts existed have a single
 * flat `chords` list, which becomes their one unnamed part.
 */
export function migrateJam(
	stored: Jam | (Omit<Jam, 'parts'> & { chords: theory.ProgressionChord[] })
): Jam {
	if ('parts' in stored) return stored;
	const { chords, ...rest } = stored;
	return { ...rest, parts: [newPart('', chords)] };
}

/** Chords shown per line of the sheet (so a 12-bar blues is three lines). */
export const BARS_PER_ROW = 4;

type Template = {
	label: string;
	mode?: Mode;
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
	minorBlues: {
		label: 'Minor blues',
		mode: 'minor',
		chords: theory.progression('minorBlues'),
		scale: 'blues'
	}
} as const satisfies Record<string, Template>;

export type TemplateName = keyof typeof TEMPLATES;

export const TEMPLATE_NAMES = Object.keys(TEMPLATES) as TemplateName[];

export function jamFromTemplate(name: TemplateName): Jam {
	const template: Template = TEMPLATES[name];
	return {
		id: crypto.randomUUID(),
		name: name === 'blank' ? 'New jam' : template.label,
		key: 'C',
		mode: template.mode ?? 'major',
		parts: [newPart('', template.chords)],
		scale: template.scale
	};
}

/** One-line summary for lists ('Cm · 2 parts · 12 bars · blues'). */
export function describeJam(jam: Jam): string {
	const count = jam.parts.reduce((sum, part) => sum + part.chords.length, 0);
	const summary = [formatKey(jam.key, jam.mode)];
	if (jam.parts.length > 1) summary.push(`${jam.parts.length} parts`);
	summary.push(`${count} ${count === 1 ? 'bar' : 'bars'}`);
	if (jam.scale) summary.push(theory.formatScaleName(jam.scale));
	return summary.join(' · ');
}
