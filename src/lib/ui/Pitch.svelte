<script lang="ts">
	import * as theory from '../theory/index.js';

	type Props = {
		pitch: theory.Pitch;
	};

	const { pitch }: Props = $props();
</script>

<div class="pitch" class:accidental={pitch.length > 2}>
	{theory.format(theory.toPitchClass(pitch))}
</div>

<style>
	.pitch {
		display: flex;
		aspect-ratio: 1;
		width: 40px;
		justify-content: center;
		align-items: center;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		background-color: var(--color-surface);
		font-weight: bold;

		&.accidental {
			background-color: var(--color-accidental-bg);
		}
	}
</style>
