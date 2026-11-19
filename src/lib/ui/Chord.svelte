<script lang="ts">
	import * as theory from '../theory/index.js';

	type Props = {
		pitchClasses: theory.PitchClass[];
		name: string;
		/** Roman numeral shown in the corner (e.g. 'IV7'). */
		numeral?: string;
	};

	const { pitchClasses, name, numeral }: Props = $props();
</script>

<div class="chord">
	{#if numeral}
		<span class="roman">{numeral}</span>
	{/if}
	<span class="name">{name}</span>
	<span class="notes">
		{#each pitchClasses as pitchClass (pitchClass)}
			<div class="pitchClass" class:accidental={pitchClass.length > 1}>
				{theory.format(pitchClass)}
			</div>
		{/each}
	</span>
</div>

<style>
	.chord {
		position: relative;
		box-sizing: border-box;
		/* Fills whatever cell it is placed in; the type scales with the tile. */
		width: 100%;
		height: 100%;
		min-height: 0;
		container-type: size;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.2rem;

		border: 1px solid var(--color-border);
		border-radius: 6px;
		background-color: var(--color-surface);
		transition: background-color 0.15s ease;
		overflow: hidden;
	}

	.roman {
		position: absolute;
		top: clamp(0.3rem, 4cqb, 0.7rem);
		left: clamp(0.4rem, 5cqi, 0.9rem);
		font-size: clamp(0.7rem, min(13cqi, 17cqb), 1.5rem);
		font-weight: 500;
		opacity: 0.6;
	}

	.name {
		flex: 2;
		display: flex;
		align-items: center;
		font-size: clamp(0.9rem, min(19cqi, 30cqb), 4rem);
		padding-top: 10cqb;
		font-weight: 600;
		line-height: 1;
	}

	.notes {
		flex: 1;
		width: 100%;
		display: flex;
		text-align: center;

		font-size: clamp(0.65rem, min(12cqi, 15cqb), 1.5rem);
		letter-spacing: 0.02em;
		opacity: 0.75;
		border-top: 1px solid var(--color-border);
	}

	.pitchClass {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--color-surface);
		font-weight: bold;

		&.accidental {
			background-color: var(--color-accidental-bg);
		}
	}
</style>
