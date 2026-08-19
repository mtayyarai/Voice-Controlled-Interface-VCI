---
id: philosophy
title: Philosophy
sidebar_position: 2
description: The five principles that make a VCI app coherent — agent-first UI, no dual controls, read-only rendering, tools instead of chat, local by default.
---

# Philosophy

- **Agent-first UI.** The AI *is* the product. UI exists only to reflect
  state.
- **No dual controls.** Don't ship both voice and click-to-edit for the
  same actions. Pick voice.
- **Read-only rendering.** The DOM shows state; mutation happens only via
  voice-triggered tool calls.
- **Tools, not chat.** The LLM maps utterances to a fixed set of
  domain-specific tools. It does not freeform-edit state.
- **Local by default.** State lives client-side unless there's a real
  multi-user need.
