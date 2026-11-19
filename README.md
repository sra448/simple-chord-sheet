# Simple Chord Sheet

A little jam helper for playing along with others on a keyboard. A _jam_ is a handful of chords plus, optionally, a scale to improvise with — a 12-bar blues, say, shown as three lines of chords with the blues scale underneath.

**Live version: <https://sra448.github.io/simple-chord-sheet/>**

## What it does

- **Jams** — start from a blank sheet or a template (12-bar blues, quick-change blues, minor blues).
- **Chord sheet** — four bars per line. Each tile shows the chord name, its tones and its Roman numeral.
- **Scale** — pick a scale and its tones appear in one line below the chords. The scale is always rooted on the jam's key.
- **Transposing** — tap another key and the chords and the scale move together.
- **Editing** — rename the jam, add, change, reorder and remove bars (triads, 7ths, sus chords), and choose the scale.
- **Offline** — after the first visit the app works without a connection, and it can be added to the home screen (on an iPad: Share → Add to Home Screen). In view mode the sheet fills the screen.

Jams are stored in your browser's localStorage. They stay on the device you created them on and are not synced anywhere.

## How it works

Chords are stored relative to the key, as an interval above the tonic plus a quality:

```json
{ "root": "P4", "quality": "dominant7" }
```

Rendering a jam means realizing those intervals on the current tonic, which is why transposing is nothing more than changing the key.

- `src/lib/theory/` — the music-theory library, layered pitch → interval → scale → chord → progression. Originally written for `auryn-play-piano`.
- `src/lib/jam.ts` — the jam model and templates.
- `src/lib/jams.svelte.ts` — the localStorage-backed store.
- `src/lib/ui/` — chord tile, pitch tile and option group components.
- `src/routes/` — the jam list (`/`) and the jam sheet (`/jam/[id]`).
- `src/service-worker/` — caches the built app so it runs offline.

## Developing

Built with SvelteKit and Svelte 5, using pnpm.

```sh
pnpm install
pnpm dev        # start the dev server
pnpm test       # unit tests for the theory library
pnpm check      # type-check
pnpm lint       # prettier + eslint
pnpm build      # static build into ./build
```

## Deploying

Every push to `main` runs `.github/workflows/deploy.yml`, which tests, builds and publishes the site to GitHub Pages.

The site is fully static (`adapter-static`). Since jams only exist in the browser, `404.html` doubles as the app shell for jam URLs. The base path comes from the `BASE_PATH` environment variable, which the workflow sets to `/<repo-name>`.
