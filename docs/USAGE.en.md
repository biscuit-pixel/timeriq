# TimerIQ — User Guide

*Slovenská verzia: [USAGE.sk.md](./USAGE.sk.md)*

TimerIQ is a presentation timer that runs entirely in your browser (or as an installed offline app). There is no account, no server, and no data ever leaves your device — everything is stored locally.

## Quick start

1. Open the app. You'll see the **control panel**: a live preview on the left, and the **playlist** + **settings** on the right.
2. Build your running order in the playlist — add timed segments and breaks, drag to reorder, click a segment's time to edit it.
3. Click **Open output window** (or **Open on second screen**, if your browser supports placing it automatically) and move that window to the screen the audience/projector sees.
4. Press **Play** or hit **Space** to start. The output window updates instantly.

## Keyboard shortcuts

These work in either the control window or the output window (if the output window has focus, it forwards the command to the control window, which stays the source of truth):

| Key | Action |
| --- | --- |
| `Space` | Play / pause the current segment |
| `Esc` | Reset the current segment back to its full duration |
| `→` | Skip to the next segment |
| `←` | Skip to the previous segment |

Shortcuts are ignored while you're typing in a text field.

## Playlist

Each row is either a **timer** (a talk, a segment, a session) or a **break**. You can:

- **Add** a timer or break using the form at the bottom of the playlist (type a label and a duration as `mm:ss`, e.g. `12:30`).
- **Reorder** by dragging the handle on the left of a row.
- **Edit** the label inline, or click the duration chip to type a new one.
- **Duplicate** or **remove** a segment with the icon buttons.
- **Jump** to any segment by clicking its position number.

When a running segment reaches zero, TimerIQ automatically moves on to the next item in the list and keeps running — so a whole agenda (talk → break → talk → …) can flow unattended once started. The control window needs to stay open for auto-advance to keep working; the output window is just a mirror.

## Warning thresholds (color changes)

In **Settings → Warning thresholds** you define one or more trigger points, e.g. "5 minutes left → amber" and "1 minute left → red, pulsing." As the remaining time crosses a threshold, the accent color (numbers, progress bar/ring) switches automatically, and you can optionally make the screen pulse — a clear, wordless cue for the speaker. Add, edit, or remove thresholds freely; they apply to whichever segment is currently active.

## Dual-screen (control + output)

- **Open output window** opens a normal browser window at `/output` that mirrors the control panel's timer display — no controls, just the clean, presentation-ready view.
- **Open on second screen** (shown when your browser supports the Window Management API — currently Chrome/Edge) asks for permission once, then places the output window on your second monitor and fullscreens it automatically.
- If your browser doesn't support that, open the output window normally, drag it to the second display, and press your browser's fullscreen shortcut (`F11` on Windows/Linux, `Ctrl+Cmd+F` on macOS).
- The two windows sync in real time over `BroadcastChannel` (no network, no server) — keyboard shortcuts, playback, and settings changes all propagate instantly.

## Appearance & branding

In **Settings** you can set:

- **Theme** — dark (default) or light.
- **Accent color**, **font** (clean sans or monospace), **progress style** (bar, ring, or both), **background** (solid or gradient).
- **Clock** — show the current time on the output screen, 24h or 12h.
- **Logo** — upload an image (it's downscaled and stored locally); choose which corner it sits in, or center it for an idle/waiting screen.

## Offline use

TimerIQ is a Progressive Web App. After your first visit, it keeps working with no internet connection. To install it as a standalone app: use your browser's "Install app" / "Add to Home screen" option (usually in the address bar or browser menu).

## Data & privacy

Your playlist and settings are stored in your browser's local storage, on your device only. Clearing your browser's site data for TimerIQ (or using **Settings → Reset all data**) removes everything.

---
Made by **møušn**.
