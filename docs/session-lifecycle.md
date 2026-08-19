---
id: session-lifecycle
title: Session lifecycle & Push-to-Talk
sidebar_position: 9
description: The standard three-button session model, phases, status pill, PTT interaction, barge-in, and the 3-minute inactivity auto-close.
---

# Session Lifecycle & Push-to-Talk (standard)

VCI apps use a **three-button session model** with an idle timeout. This
is the standard — implement it verbatim unless you have a specific
reason to deviate.

## The three buttons

| Button              | Visible when       | Behavior                                            |
|---------------------|--------------------|-----------------------------------------------------|
| **Start Session**   | `disconnected`     | Opens the WebRTC connection to OpenAI. Mic starts muted. Assistant briefly greets. |
| **Push to Talk**    | `connected`        | Hold to talk (or press Space). On release, audio is committed and the model responds. |
| **End Session**     | `connected` / `connecting` | Explicitly closes the WebRTC connection. |

## Session phases

| Phase           | Meaning                                                                  |
|-----------------|--------------------------------------------------------------------------|
| `disconnected`  | No WebRTC connection. Only Start Session is visible.                     |
| `connecting`    | Establishing WebRTC + minting ephemeral token.                            |
| `connected`     | Session live, mic muted, waiting for PTT press. PTT + End Session visible. |

## Status pill states

The status pill sits alongside the buttons and reflects the moment-to-moment
state of the assistant:

| Status      | Meaning                                              |
|-------------|------------------------------------------------------|
| `idle`      | No session, or session live but nothing happening.   |
| `listening` | User is holding PTT; mic is streaming.               |
| `thinking`  | Audio committed; model is processing / running a tool. |
| `speaking`  | Model is streaming its spoken response.              |
| `error`     | Something failed; details in log.                    |

## Push-to-Talk interaction

- **Press** (`pointerdown` on the PTT button OR `keydown` on Space):
  - Call `Realtime.startTurn()` — sends `input_audio_buffer.clear` and
    sets `micTrack.enabled = true`.
  - Set status → `listening`, apply the `.is-recording` visual state.
- **Release** (`pointerup` / `pointercancel` / `pointerleave` while
  recording, OR `keyup` on Space):
  - Call `Realtime.endTurn()` — sets `micTrack.enabled = false`, then
    sends `input_audio_buffer.commit` and `response.create`.
  - Set status → `thinking`, disable the PTT button briefly.
  - On `response.done`, re-enable PTT and set status → `idle`.
- **Barge-in**: if the user presses PTT while the model is speaking,
  call `Realtime.interruptResponse()` (sends `response.cancel`) before
  `startTurn()`.

Support both pointer events (mouse / touch / pen) **and** the Space bar
as an accessibility fallback. Ignore Space when typing in inputs.

## Inactivity timeout (auto-close)

Sessions auto-close after **3 minutes** with no PTT activity.

- Start a `setTimeout` when the phase enters `connected`.
- Reset the timeout every time PTT is released (i.e. after a completed
  user turn).
- On timeout: call `endSession()`, log `"Session auto-closed after 3
  minutes of inactivity."` in the conversation log.
- Clear the timeout when the phase leaves `connected` (manual end or
  connection failure).

:::info Why 3 minutes?
The Realtime API bills per minute of active connection. An abandoned
session sitting connected can accrue meaningful cost. Three minutes is a
good default; expose it as a constant so apps can tune it.
:::
