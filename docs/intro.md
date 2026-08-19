---
id: intro
title: Introduction
slug: /intro
sidebar_position: 1
description: VCI is a spec for building apps where an AI voice agent is the interface — wired to your domain state through a fixed tool contract.
---

# VCI — Voice Controlled Interface

**A reusable framework spec for building apps where voice is the primary
interface.** Users tap a mic once and manage the entire app by talking.
The screen is a read-only reflection of state — no forms, no buttons for
domain actions.

This documentation is designed to be handed to any coding agent (or human) to
add VCI capabilities to a new or existing app. It is domain-agnostic:
plug in your data model + actions and the pattern works the same.

---

## Agents linked to your app — the whole point

Most "AI features" bolt a chatbot next to an app and hope the user copies the
reply back into a form. VCI does the opposite: the agent is **inside** the app.
It sees your real state on every turn, and every action it takes runs through
your code — not through browser automation or a scraped DOM.

```
┌──────────────────────────────────────────────────────────────┐
│                       Your Application                        │
│                                                               │
│   ┌──────────────┐         ┌──────────────────────────────┐   │
│   │              │  reads  │                              │   │
│   │  Domain      │◄────────│         AI Agent             │   │
│   │  State       │         │      (OpenAI Realtime,       │   │
│   │              │────────►│         gpt-realtime)        │   │
│   │              │ mutates │                              │   │
│   └──────┬───────┘  via    └──────────────┬───────────────┘   │
│          │        tool                    │                   │
│          │        calls                   │ voice in / out    │
│          ▼                                ▼                   │
│   ┌──────────────┐                 ┌──────────────────────┐   │
│   │  Read-only   │                 │   Push-to-Talk mic   │   │
│   │  UI (DOM)    │                 │   +  status pill     │   │
│   └──────────────┘                 └──────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

The link between agent and app is **not** the DOM — it's a set of tool schemas.
One tool per meaningful action (`add_task`, `set_status`, `delete_note`, …).
The agent picks a tool, your code runs it, and you hand back the fresh state.
That loop is the whole framework.

---

## Why this is the best way to link an agent to an app

| Pattern              | Where the AI lives      | What state it sees                       | How it takes action                        | Failure mode                                    |
| -------------------- | ----------------------- | ---------------------------------------- | ------------------------------------------ | ----------------------------------------------- |
| Chatbot widget       | Floating panel          | Only what you pasted into the prompt     | Talks — user must copy reply into a form   | Answers are stale; user does the work anyway    |
| RPA / DOM automation | Clicks on behalf of user | Whatever's visible in the DOM             | Simulates clicks and keystrokes            | Breaks on any layout change; brittle at scale   |
| Copilot-style inline | Text editor / IDE       | Local buffer + selection                  | Suggests text; user accepts                | Fine for text, doesn't work for domain actions  |
| **VCI**              | Wired into your data model | **Full app state, refreshed every turn** | **Typed tool calls into your own functions** | Bounded, testable, deterministic per turn       |

**Why VCI wins for domain apps:**

- **Ground truth every turn.** Every tool response echoes `current_state`, so the
  agent never operates on a stale mental model.
- **Bounded action space.** A closed set of tools (≤ 8 recommended) means the
  agent can't invent an action that doesn't exist in your app.
- **Deterministic execution.** Tool handlers are plain functions in your
  codebase — same testability as any other code path.
- **No DOM coupling.** Redesign the UI, rename buttons, ship a new theme — the
  agent's contract doesn't move because it never touched the DOM.
- **Voice-native.** Speech-in, speech-out over WebRTC. No text box, no
  copy-paste, no context loss between "what I said" and "what the app did."

---

## What is VCI?

VCI is a **specification**, not a library. It describes a pattern that any
coding agent (or human) can follow to add voice-first control to a new or
existing app.

The pattern:

- **Voice is the interface.** Users hold Push-to-Talk and speak commands.
- **UI is read-only.** The DOM reflects state — it doesn't mutate it.
- **Tools, not chat.** The LLM maps utterances to a small fixed set of tool calls.
- **Local by default.** State lives client-side; no backend needed for personal use.

Under the hood: a WebRTC connection to OpenAI's Realtime API (`gpt-realtime`) does
STT + intent parsing + TTS in one bidirectional stream. When the model wants to
mutate state, it emits a function call; your handler runs it against local storage
and returns the fresh state.

---

## How to use this spec

1. **Read the [Philosophy](./philosophy) and [Architecture](./architecture)** to
   internalize the pattern.
2. **Follow the [Implementation checklist](./implementation-checklist)** — it's a
   task list a coding agent can work through directly.
3. **Verify with the [Manual test script](./manual-test)** — every VCI app should
   pass the same golden-path tests.

Continue to **[Philosophy →](./philosophy)**.
