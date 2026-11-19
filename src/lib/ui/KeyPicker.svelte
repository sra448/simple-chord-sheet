<script lang="ts">
	import { formatKey, type Mode } from '../jam.js';
	import * as theory from '../theory/index.js';

	type Props = {
		tonic: theory.PitchClass;
		mode: Mode;
		/** Called with the newly chosen key; the overlay closes itself. */
		onchange: (tonic: theory.PitchClass, mode: Mode) => void;
	};

	const { tonic, mode, onchange }: Props = $props();

	const GROUPS = [
		{ mode: 'major', label: 'Major', tonics: theory.ROOTS },
		{ mode: 'minor', label: 'Minor', tonics: theory.MINOR_ROOTS }
	] as const;

	let dialog = $state<HTMLDialogElement>();

	function choose(newTonic: theory.PitchClass, newMode: Mode) {
		onchange(newTonic, newMode);
		dialog?.close();
	}
</script>

<button class="btn" type="button" aria-haspopup="dialog" onclick={() => dialog?.showModal()}>
	<span class="prefix">Key</span>
	{formatKey(tonic, mode)}
</button>

<!-- A click on the backdrop lands on the dialog element itself; clicks inside land on children. -->
<dialog
	bind:this={dialog}
	aria-label="Choose a key"
	onclick={(event) => event.target === dialog && dialog?.close()}
>
	<div class="content">
		<header>
			<h2>Key</h2>
			<button class="btn" type="button" aria-label="Close" onclick={() => dialog?.close()}>
				✕
			</button>
		</header>

		{#each GROUPS as group (group.mode)}
			<section>
				<h3>{group.label}</h3>
				<div class="keys">
					{#each group.tonics as option (option)}
						<button
							class="btn"
							type="button"
							aria-pressed={group.mode === mode && theory.isSamePitchClass(option, tonic)}
							onclick={() => choose(option, group.mode)}
						>
							{formatKey(option, group.mode)}
						</button>
					{/each}
				</div>
			</section>
		{/each}
	</div>
</dialog>

<style>
	.prefix {
		margin-right: 0.3rem;
		font-size: 0.8em;
		font-weight: 600;
		opacity: 0.7;
	}

	dialog {
		width: min(34rem, calc(100vw - 2rem));
		padding: 0;
		border: 1px solid var(--color-border);
		border-radius: 10px;
		background-color: var(--color-bg);
		color: var(--color-text);
	}

	dialog::backdrop {
		background-color: rgb(13 83 14 / 0.35);
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.25rem;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	h2,
	h3 {
		margin: 0;
	}

	h2 {
		font-size: 1.2rem;
	}

	h3 {
		margin-bottom: 0.4rem;
		font-size: 0.85rem;
		opacity: 0.75;
	}

	.keys {
		display: grid;
		grid-template-columns: repeat(6, minmax(0, 1fr));
		gap: 0.4rem;
	}

	.keys .btn {
		padding: 0.7rem 0;
		font-size: 1rem;
	}

	.keys .btn[aria-pressed='true'] {
		background-color: var(--color-border);
		color: var(--color-bg);
	}
</style>
