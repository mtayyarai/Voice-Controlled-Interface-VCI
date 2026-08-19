---
id: required-modules
title: Required modules
sidebar_position: 5
description: The four modules every VCI app needs — storage, ui, realtime, app — and their fixed contracts.
---

# Required modules

Every VCI app has these four modules. Names and language are flexible;
**contracts are not**.

## `storage`

Persistence layer. Owns domain state.

- `readState()` → current domain state (typically an array of items).
- One mutation function per state-changing action (`add`, `remove`,
  `update`, `setStatus`, etc.). Each returns the mutated entity or `null`.
- Backend: `localStorage` (default), IndexedDB, or a remote API.

## `ui`

DOM rendering. **No interactive controls for domain actions.**

- `renderState(state)` — repaint UI from state.
- `appendLog(userText, assistantText, kind)` — append a conversation entry
  so the user sees what was heard and what happened. `kind ∈ {info,
  success, error}`.
- `setStatus(status, label)` — see [Session lifecycle](./session-lifecycle)
  for statuses.
- `setMicListening(bool)` and `setMicEnabled(bool)`.
- `showKeyPanel(bool)` — one-time API key entry UI.

## `realtime`

OpenAI Realtime session over WebRTC. See the [wire protocol](./realtime-protocol)
and [connection recipe](./webrtc-recipe) for details.

- `connect({ apiKey, onTool, getContext, onEvent })` — resolves when
  connected; throws on failure. Mic track starts **muted**.
- `disconnect()` — closes peer connection, data channel, mic tracks.
- `isConnected()` → boolean.
- `refreshContext()` — resend `session.update` with fresh state context
  (call after mutations so the model always sees current state).
- `startTurn()` — unmute the mic and clear the input audio buffer.
  Call on Push-to-Talk press.
- `endTurn()` — mute the mic, commit the buffered audio, request a
  response. Call on Push-to-Talk release.
- `interruptResponse()` — cancel the model's in-progress response so
  the user can barge in.

## `app`

Orchestration layer.

- Mic button wiring: click → connect / disconnect.
- Tool-call handler that dispatches to `storage` mutations, calls
  `ui.renderState`, and returns fresh state to the model.
- API-key entry flow (single `sk-` input, stored in `localStorage` for
  personal use; ephemeral-token backend for anything public — see
  [Security](./security)).
