---
id: known-limitations
title: Known limitations
sidebar_position: 17
description: Cost, offline mode, hallucination of references, non-English accents, and API drift — the honest trade-offs of the VCI pattern.
---

# Known limitations

- **Cost.** Realtime API bills per minute of input and output audio.
  Short bursts are cheap; long continuous sessions add up.
- **No offline mode.** Every session requires OpenAI.
- **Occasional hallucination of references.** The
  `current_state`-in-every-tool-response pattern mitigates but does not
  fully eliminate this. When it matters (irreversible actions), have the
  model confirm first: "Delete buy milk — sure?"
- **Non-English accents.** For non-English users, set the transcription
  language explicitly in `audio.input.transcription.language` if quality
  drops.
- **API drift.** OpenAI has already renamed these endpoints once
  (`/v1/realtime/sessions` → `/v1/realtime/client_secrets`,
  `/v1/realtime` → `/v1/realtime/calls`). Expect further changes; verify
  against the official docs when implementing.
