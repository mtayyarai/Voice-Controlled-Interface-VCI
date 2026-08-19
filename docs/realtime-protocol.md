---
id: realtime-protocol
title: OpenAI Realtime API — wire protocol
sidebar_position: 7
description: Endpoints, model, voices, token request, SDP exchange, session.update, function call round-trip, and events to listen for.
---

# OpenAI Realtime API — current wire protocol

As of 2026.

## Endpoints

| Purpose               | Method + URL                                    |
|-----------------------|-------------------------------------------------|
| Mint ephemeral token  | `POST https://api.openai.com/v1/realtime/client_secrets` |
| WebRTC SDP exchange   | `POST https://api.openai.com/v1/realtime/calls?model=<model>` |

## Model + voices

- **Model:** `gpt-realtime` (GA).
- **Voices:** `alloy`, `ash`, `ballad`, `cedar`, `coral`, `echo`, `marin`,
  `sage`, `shimmer`, `verse`.
- Recommended defaults: `marin` (warm, natural) or `coral` (friendly).

## Token request

```http
POST /v1/realtime/client_secrets
Authorization: Bearer <apiKey>
Content-Type: application/json

{
  "session": {
    "type":  "realtime",
    "model": "gpt-realtime",
    "audio": { "output": { "voice": "marin" } }
  }
}
```

Response (top-level `value` is the ephemeral token, prefixed `ek_`):

```json
{ "value": "ek_...", "expires_at": 1234567890, "session": { } }
```

## SDP exchange

```http
POST /v1/realtime/calls?model=gpt-realtime
Authorization: Bearer <ephemeralToken>
Content-Type: application/sdp

<raw SDP offer>
```

Returns raw SDP answer text (`Content-Type: application/sdp`).

## `session.update` event (over data channel)

Send this the moment the data channel opens, and again after every state
mutation. **VCI uses manual turn detection** — the client explicitly
demarcates every user turn via `input_audio_buffer.clear` on Push-to-Talk
press and `input_audio_buffer.commit` on release.

```json
{
  "type": "session.update",
  "session": {
    "type": "realtime",
    "instructions": "<see Adapting → Session instructions>",
    "tools": [ /* see Adapting → Tool schemas */ ],
    "tool_choice": "auto",
    "audio": {
      "input": {
        "transcription":   { "model": "whisper-1" },
        "turn_detection":  null
      },
      "output": { "voice": "marin" }
    }
  }
}
```

If you prefer hands-free conversation instead of push-to-talk, swap
`turn_detection: null` for the server-VAD block below and skip the PTT
button; the model will auto-detect turn starts/stops:

```json
"turn_detection": {
  "type": "server_vad",
  "threshold": 0.5,
  "prefix_padding_ms": 300,
  "silence_duration_ms": 500
}
```

## Function call round-trip

When the model calls a tool, the data channel emits:

```json
{
  "type": "response.function_call_arguments.done",
  "call_id": "call_...",
  "name": "add_note",
  "arguments": "{\"title\":\"...\"}"
}
```

Reply with the tool result:

```json
{
  "type": "conversation.item.create",
  "item": {
    "type":    "function_call_output",
    "call_id": "<same call_id>",
    "output":  "<JSON.stringify(result)>"
  }
}
```

Then trigger the spoken confirmation:

```json
{ "type": "response.create" }
```

## Useful events to listen for

| Event type                                                    | Use for                     |
|---------------------------------------------------------------|-----------------------------|
| `input_audio_buffer.speech_started`                           | status → "listening"        |
| `input_audio_buffer.speech_stopped`                           | status → "thinking"         |
| `conversation.item.input_audio_transcription.completed`       | log the heard user text     |
| `response.function_call_arguments.done`                       | execute tool → reply → respond |
| `response.created`                                            | status → "speaking"         |
| `response.audio_transcript.done`                              | log the assistant's text    |
| `response.done`                                               | status → "idle"             |
| `error`                                                       | log + status → "error"      |
