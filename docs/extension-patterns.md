---
id: extension-patterns
title: Extension patterns
sidebar_position: 18
description: Multi-entity domains, destructive-action confirmations, search-as-a-tool, rich responses, and client-side wake words.
---

# Extension patterns

- **Multi-entity domains** — one tool schema per entity type, prefix tool
  names with the entity (`add_task`, `add_note`). Keep total ≤ 8.
- **Confirmations for destructive actions** — add a `confirm: boolean`
  argument, or split into `soft_delete` + `restore` tools instead of
  hard delete.
- **Search/filter as a tool** — expose `search(query)` as a tool that
  returns matches; the model can then reference results by id in
  follow-up turns.
- **Rich responses** — for actions that need to convey more than a short
  confirmation (e.g. "read my week"), let the model speak longer;
  server VAD will still let the user interrupt.
- **Client-side wake word** — for "always listening" UX, add a small
  wake-word detector (e.g. Porcupine) before starting the Realtime
  session. Do not stream mic to OpenAI 24/7.
