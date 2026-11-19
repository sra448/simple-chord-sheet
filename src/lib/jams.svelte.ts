import { type Jam, jamFromTemplate, type TemplateName } from './jam.js';

// Jams live in this browser's localStorage. The stored objects are handed out as reactive
// state: mutate a jam in place, then call save().

const STORAGE_KEY = 'simple-chord-sheet:jams';

function load(): Jam[] {
	try {
		const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
		return Array.isArray(parsed) ? (parsed as Jam[]) : [];
	} catch {
		return [];
	}
}

const jams = $state<Jam[]>(load());

export const jamStore = {
	get all(): Jam[] {
		return jams;
	},

	get(id: string): Jam | undefined {
		return jams.find((jam) => jam.id === id);
	},

	/** Persists the current state of all jams. Call after mutating a jam. */
	save(): void {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(jams));
	},

	create(template: TemplateName): Jam {
		const jam = jamFromTemplate(template);
		jams.push(jam);
		this.save();
		return jam;
	},

	remove(id: string): void {
		const index = jams.findIndex((jam) => jam.id === id);
		if (index === -1) return;
		jams.splice(index, 1);
		this.save();
	}
};
