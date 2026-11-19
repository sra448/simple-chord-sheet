<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import '../app.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app">
	{@render children()}
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		max-width: 40rem;
		margin: 0 auto;
	}
</style>
