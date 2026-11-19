<script lang="ts" generics="T extends string">
	type Props = {
		/** The selectable values. */
		options: readonly T[];
		/** The currently selected value (two-way bindable). */
		value: T;
		/** Accessible group name (also the aria-label). */
		label: string;
		/** Optional renderer for an option's display text (defaults to the value itself). */
		format?: (option: T) => string;
	};

	let { options, value = $bindable(), label, format }: Props = $props();
</script>

<div class="options" role="radiogroup" aria-label={label}>
	{#each options as option (option)}
		<label class="option">
			<input type="radio" bind:group={value} value={option} />
			<span>{format ? format(option) : option}</span>
		</label>
	{/each}
</div>

<style>
	.options {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.option {
		position: relative;
		cursor: pointer;
	}

	/* Hide the native radio but keep it focusable and operable (arrow keys, etc.). */
	.option input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
	}

	/* The visible button — same palette as the chord tiles. */
	.option span {
		display: inline-block;
		padding: 0.35rem 0.7rem;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		background-color: var(--color-surface);
		font-size: 0.9rem;
		line-height: 1.2;
		user-select: none;
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
	}

	/* Roomier targets for fingers. */
	@media (pointer: coarse) {
		.option span {
			padding: 0.55rem 0.9rem;
			font-size: 1rem;
		}
	}

	.option:hover span {
		background-color: var(--color-surface-hover);
	}

	/* Selected = inverted: solid green tile with beige text. */
	.option:has(input:checked) span {
		background-color: var(--color-border);
		color: var(--color-bg);
	}

	.option input:focus-visible + span {
		outline: 2px solid var(--color-border);
		outline-offset: 2px;
	}
</style>
