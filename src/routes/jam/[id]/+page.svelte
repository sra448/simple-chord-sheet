<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { BARS_PER_ROW } from '#lib/jam.js';
	import { jamStore } from '#lib/jams.svelte.js';
	import * as theory from '#lib/theory/index.js';
	import Chord from '#lib/ui/Chord.svelte';
	import OptionsGroup from '#lib/ui/OptionsGroup.svelte';
	import Pitch from '#lib/ui/Pitch.svelte';

	const NO_SCALE = 'none';
	const SCALE_OPTIONS = [NO_SCALE, ...theory.SCALE_NAMES] as const;

	const jam = $derived(jamStore.get(page.params.id ?? ''));

	// An empty jam has nothing to look at yet, so it opens straight into the editor.
	let editing = $state(jamStore.get(page.params.id ?? '')?.chords.length === 0);
	let selected = $state<number | null>(null);

	// What the chord picker shows while no chord is selected — the next chord to be added.
	const draft = $state<theory.ProgressionChord>({ root: 'P1', quality: 'major' });

	const chords = $derived(jam ? theory.realize(jam.key, jam.chords) : []);
	const rows = $derived(Math.ceil(chords.length / BARS_PER_ROW));
	const scaleTones = $derived(jam?.scale ? theory.scaleTones(jam.key, jam.scale) : []);

	// The chord the picker edits: the selected one, or the draft.
	const current = $derived(
		jam && selected !== null && jam.chords[selected] ? jam.chords[selected] : draft
	);

	// Accessor pairs for the form bindings — every write goes straight to storage.
	// (The bound controls only render while the jam exists; the fallbacks are for the types.)

	const getName = () => jam?.name ?? '';
	const setName = (name: string) => {
		if (!jam) return;
		jam.name = name;
		jamStore.save();
	};

	const getKey = (): theory.PitchClass => jam?.key ?? 'C';
	const setKey = (key: theory.PitchClass) => {
		if (!jam) return;
		jam.key = key;
		jamStore.save();
	};

	const getRoot = () => current.root;
	const setRoot = (root: theory.Interval) => {
		current.root = root;
		jamStore.save();
	};

	const getQuality = () => current.quality;
	const setQuality = (quality: theory.ChordQuality) => {
		current.quality = quality;
		jamStore.save();
	};

	type ScaleOption = (typeof SCALE_OPTIONS)[number];
	const getScale = (): ScaleOption => jam?.scale ?? NO_SCALE;
	const setScale = (name: ScaleOption) => {
		if (!jam) return;
		jam.scale = name === NO_SCALE ? undefined : name;
		jamStore.save();
	};

	// Option labels. Roots and chord types are shown as they sound in the current key.

	const formatRoot = (root: theory.Interval) => theory.format(theory.transpose(getKey(), root));
	const formatQuality = (quality: theory.ChordQuality) =>
		theory.formatChordName(theory.transpose(getKey(), current.root), quality);
	const formatScale = (name: ScaleOption) =>
		name === NO_SCALE ? 'none' : theory.formatScaleName(name);

	function toggleEditing() {
		editing = !editing;
		selected = null;
	}

	function addChord() {
		if (!jam) return;
		const index = selected === null ? jam.chords.length : selected + 1;
		jam.chords.splice(index, 0, $state.snapshot(current));
		selected = index;
		jamStore.save();
	}

	function removeChord() {
		if (!jam || selected === null) return;
		jam.chords.splice(selected, 1);
		selected = jam.chords.length === 0 ? null : Math.min(selected, jam.chords.length - 1);
		jamStore.save();
	}

	function moveChord(delta: -1 | 1) {
		if (!jam || selected === null) return;
		const target = selected + delta;
		if (target < 0 || target >= jam.chords.length) return;
		[jam.chords[selected], jam.chords[target]] = [jam.chords[target], jam.chords[selected]];
		selected = target;
		jamStore.save();
	}

	async function deleteJam() {
		if (!jam || !confirm(`Delete "${jam.name}"?`)) return;
		jamStore.remove(jam.id);
		await goto(resolve('/'));
	}
</script>

<svelte:head>
	<title>{jam?.name ?? 'Jam not found'}</title>
</svelte:head>

{#if !jam}
	<p>This jam doesn't exist (anymore).</p>
	<p><a class="btn" href={resolve('/')}>All jams</a></p>
{:else}
	<div class="jam" class:editing>
		<header>
			<a class="btn" href={resolve('/')} aria-label="All jams">←</a>
			{#if editing}
				<input class="title" aria-label="Jam name" bind:value={getName, setName} />
			{:else}
				<h1 class="title">{jam.name}</h1>
			{/if}
			<button class="btn" type="button" onclick={toggleEditing}>{editing ? 'Done' : 'Edit'}</button>
		</header>

		<div class="field">
			<span class="caption">Key</span>
			<OptionsGroup
				label="Key"
				options={theory.ROOTS}
				format={theory.format}
				bind:value={getKey, setKey}
			/>
		</div>

		<div class="body">
			<div class="main">
				{#if jam.chords.length === 0}
					<p class="hint">
						No chords yet — pick a root and a chord type below, then press “Add chord”.
					</p>
				{:else}
					<div class="sheet" style:--bars-per-row={BARS_PER_ROW} style:--rows={rows}>
						{#each chords as chord, i (i)}
							{@const numeral = theory.formatProgressionNumeral(jam.chords[i])}
							{@const name = theory.formatChordName(chord.root, chord.quality)}
							{#if editing}
								<button
									class="bar"
									type="button"
									aria-pressed={selected === i}
									aria-label="Bar {i + 1}: {name}"
									onclick={() => (selected = selected === i ? null : i)}
								>
									<Chord pitchClasses={theory.chordTones(chord)} {name} {numeral} />
								</button>
							{:else}
								<Chord pitchClasses={theory.chordTones(chord)} {name} {numeral} />
							{/if}
						{/each}
					</div>
				{/if}

				{#if jam.scale}
					<section class="scale">
						<h2>{theory.format(jam.key)} {theory.formatScaleName(jam.scale)}</h2>
						<div class="tones">
							{#each scaleTones as tone (tone)}
								<Pitch pitch={theory.toPitch(tone)} />
							{/each}
						</div>
					</section>
				{/if}
			</div>

			{#if editing}
				<section class="editor">
					<h2>{selected === null ? 'Next chord' : `Bar ${selected + 1}`}</h2>
					<div class="field">
						<span class="caption">Root</span>
						<OptionsGroup
							label="Chord root"
							options={theory.PROGRESSION_ROOTS}
							format={formatRoot}
							bind:value={getRoot, setRoot}
						/>
					</div>
					<div class="field">
						<span class="caption">Type</span>
						<OptionsGroup
							label="Chord type"
							options={theory.CHORD_NAMES}
							format={formatQuality}
							bind:value={getQuality, setQuality}
						/>
					</div>
					<div class="actions">
						<button class="btn" type="button" onclick={addChord}>
							{selected === null ? 'Add chord' : 'Add after'}
						</button>
						<button class="btn" type="button" disabled={selected === null} onclick={removeChord}>
							Remove
						</button>
						<button
							class="btn"
							type="button"
							aria-label="Move earlier"
							disabled={selected === null || selected === 0}
							onclick={() => moveChord(-1)}
						>
							←
						</button>
						<button
							class="btn"
							type="button"
							aria-label="Move later"
							disabled={selected === null || selected === jam.chords.length - 1}
							onclick={() => moveChord(1)}
						>
							→
						</button>
					</div>

					<h2>Scale</h2>
					<OptionsGroup
						label="Scale"
						options={SCALE_OPTIONS}
						format={formatScale}
						bind:value={getScale, setScale}
					/>

					<div class="actions danger">
						<button class="btn" type="button" onclick={deleteJam}>Delete jam</button>
					</div>
				</section>
			{/if}
		</div>
	</div>
{/if}

<style>
	/*
	 * The sheet is meant to be read from a music stand: while playing (not editing) the jam takes
	 * exactly one screen, and the chord tiles share whatever height is left between the controls
	 * and the scale. While editing, the page flows normally and the editor sits beside the sheet
	 * when there is room for it.
	 */
	.jam {
		--gap: clamp(0.4rem, 2vw, 1rem);
		--tile-min: 4.5rem;

		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		max-width: 90rem;
		margin: 0 auto;
	}

	.jam:not(.editing) {
		height: calc(100dvh - 2 * var(--page-pad));
	}

	.body {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.main {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		/* Lets the sheet measure the column it sits in (cqw below). */
		container-type: inline-size;
	}

	.editing .main {
		--tile-max: 9rem;
		flex: none;
	}

	@media (min-width: 62rem) {
		.editing .body {
			display: grid;
			grid-template-columns: minmax(0, 1fr) 24rem;
			align-items: start;
			gap: 2rem;
		}
	}

	header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.title {
		flex: 1;
		min-width: 0;
		margin: 0;
		font: inherit;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text);
	}

	input.title {
		padding: 0.1rem 0.4rem;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		background-color: var(--color-surface);
	}

	h2 {
		margin: 0;
		font-size: 1rem;
	}

	.field {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
	}

	.caption {
		flex: none;
		width: 2.4rem;
		font-size: 0.8rem;
		font-weight: 600;
		opacity: 0.75;
	}

	.hint {
		margin: 0;
		opacity: 0.75;
	}

	.sheet {
		--column: calc((100cqw - (var(--bars-per-row) - 1) * var(--gap)) / var(--bars-per-row));
		--row-gaps: calc((var(--rows) - 1) * var(--gap));

		display: grid;
		grid-template-columns: repeat(var(--bars-per-row), minmax(0, 1fr));
		grid-auto-rows: minmax(0, 1fr);
		gap: var(--gap);

		/* Ideally square tiles; shrink to fit the screen, but never below a readable height. */
		flex: 0 1 calc(var(--rows) * min(var(--column), var(--tile-max, 100cqw)) + var(--row-gaps));
		min-height: calc(var(--rows) * var(--tile-min) + var(--row-gaps));
	}

	.bar {
		display: grid;
		min-height: 0;
		padding: 0;
		border: none;
		border-radius: 6px;
		background: none;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}

	.bar[aria-pressed='true'] {
		outline: 3px solid var(--color-border);
		outline-offset: 2px;
	}

	.bar:focus-visible {
		outline: 3px dashed var(--color-border);
		outline-offset: 2px;
	}

	.scale,
	.editor {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.tones {
		--pitch-size: clamp(2.5rem, 5.5vw, 4rem);

		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}

	.editor {
		padding-top: 1.25rem;
		border-top: 1px solid var(--color-border);
	}

	@media (min-width: 62rem) {
		.editor {
			padding: 0 0 0 2rem;
			border-top: none;
			border-left: 1px solid var(--color-border);
		}
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-bottom: 0.75rem;
	}

	.danger {
		margin: 0.75rem 0 0;
	}
</style>
