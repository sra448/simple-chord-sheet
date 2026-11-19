import { version } from '$app/env';
import { assets, immutable, prerendered } from '$app/manifest';
import { self } from '$app/service-worker';

// Makes the app work offline: everything the build produced is cached when the worker installs,
// and served from that cache afterwards. Each deploy gets its own cache; the previous one is
// dropped once the new worker takes over (the next time the app is opened from scratch).

const CACHE = `app-${version}`;
const scope = self.registration.scope;

/** Resolves a path from the build manifest (relative to the base path) to a full URL. */
const toUrl = (path: string) => new URL(path.replace(/^\//, ''), scope).href;

const PRECACHED = new Set([...immutable, ...assets, ...prerendered].map(({ path }) => toUrl(path)));

// The static adapter's fallback page: an empty app shell that renders whatever URL it is served
// for. Jam pages only exist in the browser, so this is what answers their URLs.
const SHELL = toUrl('404.html');

async function install() {
	const cache = await caches.open(CACHE);
	await cache.addAll([...PRECACHED]);
	// Only exists in the production build, so it must not fail the install elsewhere.
	await cache.add(SHELL).catch(() => {});
}

async function activate() {
	const keys = await caches.keys();
	await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
}

async function respond(request: Request): Promise<Response> {
	const cache = await caches.open(CACHE);

	if (PRECACHED.has(request.url)) {
		const cached = await cache.match(request.url);
		if (cached) return cached;
	}

	if (request.mode === 'navigate') {
		const shell = await cache.match(SHELL);
		if (shell) return shell;
	}

	return fetch(request);
}

self.addEventListener('install', (event) => event.waitUntil(install()));
self.addEventListener('activate', (event) => event.waitUntil(activate()));

self.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
	event.respondWith(respond(request));
});
