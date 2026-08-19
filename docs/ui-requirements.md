---
id: ui-requirements
title: UI requirements
sidebar_position: 10
description: Required UI elements — state panel, conversation log, three session buttons, PTT hint, status pill, API-key panel, hidden audio element — and accessibility rules.
---

# UI requirements

- **State panel** — renders `storage.readState()`. Visually distinguish
  entity states (e.g. done vs open). No click handlers for domain actions.
- **Conversation log** — most recent at bottom, auto-scroll. Populated
  from transcription + assistant events.
- **Three session buttons** — Start Session, Push to Talk, End Session
  (see [Session lifecycle](./session-lifecycle)). Visibility swaps based
  on the current phase; the PTT button pulses while recording.
- **PTT hint text** — a one-line label under the buttons: *"Hold Push to
  Talk (or Space) to speak. Session auto-closes after 3 minutes of
  silence."* Helps first-time users.
- **Status pill** — reflects the states listed in
  [Session lifecycle](./session-lifecycle#status-pill-states).
- **API-key panel** — shown on first load; hidden once a key is stored.
  Include a "reset key" link.
- **Hidden `<audio id="assistant-audio" autoplay playsinline>`** — the
  peer connection's remote audio track attaches here.

## Accessibility

- Give each button an `aria-label` matching its visible text.
- Space bar acts as PTT (skip when a text input has focus).
- Use `aria-live="polite"` on the status pill and log.
- The recording state must not rely on color alone — the label text
  ("Recording…" vs "Hold to Talk") and animation both change.
