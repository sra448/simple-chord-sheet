<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { describeJam, TEMPLATE_NAMES, TEMPLATES, type TemplateName } from '#lib/jam.js';
	import { jamStore } from '#lib/jams.svelte.js';

	async function create(template: TemplateName) {
		const jam = jamStore.create(template);
		await goto(resolve('/jam/[id]', { id: jam.id }));
	}
</script>

<svelte:head>
	<title>Jams</title>
</svelte:head>

<div class="home">
	<h1>Jams</h1>

	{#if jamStore.all.length === 0}
		<p class="empty">No jams yet. Start one below.</p>
	{:else}
		<ul class="jams">
			{#each jamStore.all as jam (jam.id)}
				<li>
					<a href={resolve('/jam/[id]', { id: jam.id })}>
						<span class="name">{jam.name}</span>
						<span class="summary">{describeJam(jam)}</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}

	<section>
		<h2>New jam</h2>
		<div class="templates">
			{#each TEMPLATE_NAMES as template (template)}
				<button class="btn" type="button" onclick={() => create(template)}>
					{TEMPLATES[template].label}
				</button>
			{/each}
		</div>
	</section>
</div>

<style>
	.home {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		max-width: 40rem;
		margin: 0 auto;
	}

	h1 {
		margin: 0;
	}

	h2 {
		margin: 0 0 0.5rem;
		font-size: 1rem;
	}

	.empty {
		margin: 0;
		opacity: 0.75;
	}

	.jams {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.jams a {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.25rem 1rem;
		padding: 0.75rem 1rem;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		background-color: var(--color-surface);
		color: var(--color-text);
		text-decoration: none;
		transition: background-color 0.15s ease;
	}

	.jams a:hover {
		background-color: var(--color-surface-hover);
	}

	.name {
		font-size: 1.1rem;
		font-weight: 600;
	}

	.summary {
		font-size: 0.9rem;
		opacity: 0.75;
	}

	.templates {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
</style>
