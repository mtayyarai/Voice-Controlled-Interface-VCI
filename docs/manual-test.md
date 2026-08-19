---
id: manual-test
title: Manual test script
sidebar_position: 15
description: Eight scenarios every VCI app should pass — golden path, ambiguous reference, chit-chat, empty state, reload, invalid key, mic denied, interrupt.
---

# Manual test script

For each domain action, verify:

1. **Golden path** — speak an unambiguous command → tool called with
   correct args → state mutated → assistant confirms briefly in voice.
2. **Ambiguous reference** — assistant asks for clarification, no
   mutation.
3. **Unrelated chit-chat** — assistant chats briefly, no tool call.
4. **Empty state read-back** — assistant says something meaningful, not
   silence.
5. **Reload** — UI shows the last confirmed state.
6. **Invalid API key** — session start fails cleanly, error shown in log.
7. **Mic denied** — session start fails cleanly, error shown in log.
8. **Interrupt** — user talks over the assistant → server VAD interrupts
   the response and starts a new turn.
9. **MCP tool (if enabled)** — voice command triggers an MCP call →
   approval prompt surfaced (for `require_approval: "always"`) →
   executed → confirmed. See [MCP Support](./mcp-support).
