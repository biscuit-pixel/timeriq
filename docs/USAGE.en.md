# timeriq — User Guide

*Slovenská verzia: [USAGE.sk.md](./USAGE.sk.md)*

timeriq is a presentation timer that runs entirely in your browser (or as an installed offline app). There is no account, no server, and no data ever leaves your device — everything is stored locally.

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

## Editing times with the keyboard

Every duration field (playlist rows, the add form, warning thresholds, default break, single timer) is a keyboard-driven `mm:ss` editor. Click it (or Tab to it), then use `←` / `→` to choose the digit, `↑` / `↓` to add or subtract at that digit (it carries over, e.g. `0:59` + 1 s = `1:00`), or type a number to overwrite the selected digit. `Enter` / `Esc` leaves the field.

## Single timer mode

Don't need an agenda? Use the **Playlist / Single timer** switch above the list. Single timer mode shows just one label and one duration, hides skip buttons and "up next", and stops when it reaches zero. Your playlist is kept and comes back when you switch back.

## Playlist

Each row is either a **timer** (a talk, a segment, a session) or a **break**. You can:

- **Add** a timer or break using the form at the bottom of the playlist (type a label and set the duration).
- **Reorder** by dragging the handle on the left of a row.
- **Edit** the label inline, or edit the duration with the keyboard (see above).
- **Duplicate** or **remove** a segment with the icon buttons.
- **Jump** to any segment by clicking its position number.

When a running segment reaches zero, timeriq automatically moves on to the next item in the list and keeps running — so a whole agenda (talk → break → talk → …) can flow unattended once started. The control window needs to stay open for auto-advance to keep working; the output window is just a mirror.

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
- **Accent color**, **font** (clean sans or monospace), **progress style** (bar, ring, or both), **background** (solid or gradient), and **animated particles** that drift behind the timer (they take on the warning color too).
- **Clock** — show the current time on the output screen, 24h or 12h.
- **Logo** — upload an image (it's downscaled and stored locally); choose which corner it sits in (or center it), and scale it with the **Logo size** slider.

## Debate timer

A separate tool for panel discussions and debates — switch to it with the **Presentation / Debate** tabs at the top.

- **Rounds** — a row of tabs just below the main nav lets you set up multiple segments of the same debate (e.g. "Opening statements" at 10 minutes per person, then "Rapid fire" at 2 minutes per person). Each round keeps its own roster, times, and running state completely independent of the others — switching rounds freezes whichever clock was running exactly where it stood, so coming back to an earlier round continues right where you left off. Use **+** to add a blank round, the duplicate icon on the active tab to copy the current roster into a new round (handy for a same-people, different-time format), the pencil to rename it, and the trash icon to remove it (you can't remove the last round). The round's name is also shown as the headline on the output screen.
- Use **Time per person** + **Apply to all** above the participant list to set everyone's allotted time in the active round at once.
- Add participants with a name and an optional photo (click their avatar in the list to upload one; no photo falls back to initials).
- Give each participant their own time budget. Every participant keeps a separate, independent clock.
- Click **Spotlight** on a participant to bring them to center stage and start their clock; the previously active participant's time is banked exactly where it stood and they move to the row of smaller timers at the bottom. Only one clock ever runs at a time.
- Use **+ Add Q&A timer** for a reusable "host questions" slot (shown with a distinct badge). Its row has its own reset button, so you can snap it back to the full allotted time after every question without resetting whoever else is currently spotlighted.
- `Space` play/pauses whoever is currently spotlighted (without switching), `Esc` resets their time to the amount you assigned, `←`/`→` switch the spotlight to the previous/next participant.
- Add a **discussion name** and/or a **logo** (with its own size/position) in settings — shown on the output screen.
- **Open output window** / **Open on second screen** work exactly like the presentation tool.
- **Open lower third** opens a small, transparent window showing just the current speaker's name, photo and time — add it as a Browser Source in OBS (or similar) for a livestream overlay; it has no background to key out. In **Settings → Lower third** you can toggle showing the round name, add custom caption text (e.g. an event hashtag), and show the other participants' times as small chips beneath the main bar.
- **Open overview** opens a scoreboard-style window listing every participant in the active round at once with their current time, the active one highlighted with a pulsing indicator — handy for a second monitor or projecting between segments.
- **Presets**, in Settings, save the current rounds, roster and settings as a named, reusable template (every clock resets to full when saved) — load one later to set up a recurring debate format in one click, or delete ones you no longer need.

## Offline use

timeriq is a Progressive Web App. After your first visit, it keeps working with no internet connection. To install it as a standalone app: use your browser's "Install app" / "Add to Home screen" option (usually in the address bar or browser menu).

## Data & privacy

Your playlist and settings are stored in your browser's local storage, on your device only. Clearing your browser's site data for timeriq (or using **Settings → Reset all data**) removes everything.

---
Made by **møušn**.
