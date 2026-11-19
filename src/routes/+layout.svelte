<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import '../app.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// Keeps an installed (home-screen) app up to date. Such an app is rarely loaded from scratch,
	// so look for a new version whenever it comes back to the foreground, and reload once a new
	// service worker has taken over. Nothing is lost: jams are saved on every change.
	$effect(() => {
		if (!('serviceWorker' in navigator)) return;
		const { serviceWorker } = navigator;

		// No controller yet means this is the first install, not an update.
		const isUpdate = serviceWorker.controller !== null;
		const reload = () => isUpdate && location.reload();
		const checkForUpdate = () => {
			if (document.visibilityState !== 'visible') return;
			void serviceWorker.getRegistration().then((registration) => registration?.update());
		};

		serviceWorker.addEventListener('controllerchange', reload);
		document.addEventListener('visibilitychange', checkForUpdate);
		return () => {
			serviceWorker.removeEventListener('controllerchange', reload);
			document.removeEventListener('visibilitychange', checkForUpdate);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
