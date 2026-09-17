# TimerIQ

A sleek, offline-capable presentation timer for conferences, talks, and events. Built as a PWA (React + TypeScript + Vite) so it runs equally well as a hosted web app, installed offline app, or opened straight from a local build — no backend required.

Made by **møušn**.

## Features

- **English / Slovak** UI, switchable at any time
- **Fully offline** after first load (installable PWA, service-worker cached)
- **Space** to play/pause, **Esc** to reset the current segment, arrow keys to skip
- Animated progress bar / ring showing time remaining
- **Configurable warning thresholds** — the display changes accent color (and can pulse) as time runs low; edit the trigger points, colors and labels in Settings
- **Playlist / queue** — chain multiple timed segments and breaks back to back, reorder by drag-and-drop, jump to any segment
- **Dual-screen control + output mode** — open a second window (optionally auto-placed on a second monitor via the Window Management API) that mirrors the control panel in real time over `BroadcastChannel`; the operator can drive playback from either window
- **Dark mode by default**, with a light mode toggle
- Optional **clock** overlay on the output screen
- Optional **logo upload** (auto-downscaled, stored locally) with position control, for branding per event
- Visual customization: accent color, font, progress style, background style

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
```

```bash
npm run build      # production build in dist/
npm run preview    # serve the production build locally
```

Everything is client-side and stored in the browser's `localStorage` — there is no server component and no data leaves the device.

## Using it live

1. Build the playlist in the control panel (left: live preview, right: playlist + settings).
2. Click **Open output window** (or **Open on second screen** where the browser supports the Window Management API) and move/fullscreen it on the projector.
3. Drive playback from either window with the play/pause button, `Space`, or `Esc` to reset.

## Tech

- Vite + React + TypeScript
- Zustand for state, persisted to `localStorage`
- `BroadcastChannel` for control ⇄ output window sync (no server)
- `vite-plugin-pwa` for offline support / installability
- Hand-written CSS design system (no UI framework)

## Deployment

Static build (`npm run build` → `dist/`), deployable anywhere that serves static files. Configured for Cloudflare Workers static assets (`wrangler.jsonc`, SPA fallback via `not_found_handling`) — connect the repo under **Workers & Pages → Create → Connect to Git** for auto-deploy on push, or run `npm run deploy` locally with `wrangler` authenticated.

## Documentation

- [User guide (English)](./docs/USAGE.en.md)
- [Používateľská príručka (slovenčina)](./docs/USAGE.sk.md)
