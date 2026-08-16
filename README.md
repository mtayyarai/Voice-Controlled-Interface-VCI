# VCI — Voice Controlled Interface

**The cleanest way to build an AI agent that is wired directly into your application.**

VCI is a pattern for building apps where an AI agent — not a floating chatbot,
not an RPA script clicking buttons — is *the* interface. The agent reads your
domain state, calls your domain functions through a fixed tool contract, and
confirms every result out loud. The UI is a read-only reflection of state.

> 📖 **Read the full spec:** [`VCI.md`](./VCI.md)
> 🌐 **Live docs (styled):** deploy to Vercel (see below) or open [`index.html`](./index.html) locally.

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

## Demos

### DEMO-01

[![DEMO-01 — VCI walkthrough](https://img.youtube.com/vi/2BkAJLVvpi4/hqdefault.jpg)](https://youtu.be/2BkAJLVvpi4)

▶️ Watch on YouTube: <https://youtu.be/2BkAJLVvpi4>

### DEMO-02

[![DEMO-02 — VCI walkthrough](https://img.youtube.com/vi/xeTy1f6ZuX4/maxresdefault.jpg)](https://youtu.be/xeTy1f6ZuX4)

▶️ Watch on YouTube: <https://youtu.be/xeTy1f6ZuX4>

---

## What is VCI?

VCI is a **specification**, not a library. It describes a pattern that any coding
agent (or human) can follow to add voice-first control to a new or existing app.

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

## When to use VCI

| ✅ Good fit                                          | ❌ Bad fit                                |
| --------------------------------------------------- | ---------------------------------------- |
| Personal tools with bounded action vocabulary       | Multi-user collaborative apps            |
| Solo users on a single device                       | Public deployments without a backend     |
| To-do, notes, timers, expense capture, kanban, etc. | Apps needing precise pointer / drag / dense forms |

---

## Repository contents

| File          | Purpose                                                                  |
| ------------- | ------------------------------------------------------------------------ |
| `VCI.md`      | The framework specification. Hand this to a coding agent to build an app. |
| `VCI.html`    | The same spec, rendered as a styled single-file documentation site.       |
| `index.html`  | Copy of `VCI.html` — the entry point Vercel serves at `/`.                |
| `vercel.json` | Static-hosting config for Vercel.                                        |

---

## How to use this framework

### 1. Read the spec

Start with [`VCI.md`](./VCI.md). It covers:

- Philosophy and when to (not) use VCI
- Architecture (WebRTC + Realtime API)
- The four required modules (`storage`, `ui`, `realtime`, `app`)
- How to adapt the pattern to your own domain (data model, tool schemas, session instructions)
- The OpenAI Realtime API wire protocol as of 2026
- A full WebRTC connection recipe
- Session lifecycle, Push-to-Talk, and the 3-minute idle timeout
- UI requirements and accessibility
- Security (personal vs public deployment)
- Implementation checklist + manual test script

### 2. Hand it to an AI coder

The spec is written to be handed *verbatim* to a coding agent (Claude Code,
Cursor, Copilot Chat, etc.) alongside a description of your target domain.
The **Implementation checklist** in § 12 of `VCI.md` is a task list the agent can
work through directly.

### 3. Follow the file-layout convention

```
<your-app>/
  index.html
  css/styles.css
  js/
    app.js       orchestration + tool handler
    realtime.js  WebRTC + Realtime API + tool schemas
    storage.js   domain persistence + mutations
    ui.js        DOM rendering (read-only)
```

### 4. Verify with the manual test script

§ 13 of `VCI.md` lists the manual tests every VCI app should pass — golden path,
ambiguous reference, chit-chat, empty state, reload, invalid key, mic denied, and
barge-in / interrupt.

---

## Deploy the docs to Vercel

The `index.html` in this repo is fully self-contained (inline CSS + JS, no build
step). Any static host works; Vercel is easiest.

### Option A — one-click via the Vercel dashboard

1. Push this repo to GitHub (see below).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Framework preset: **Other**. Build command: *(none)*. Output directory: `.`.
4. Deploy.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel        # first deploy (preview)
vercel --prod # promote to production
```

The `vercel.json` in this repo already configures static hosting; no build step
runs.

---

## Push to GitHub

If you haven't yet published this repo:

```bash
git init
git add .
git commit -m "Initial VCI framework spec + docs site"
git branch -M main
git remote add origin https://github.com/mtayyarai/Voice-Controlled-Interface-VCI.git
git push -u origin main
```

---

## Security note

VCI's default guidance for **personal, single-user tools** is to store the OpenAI
API key in `localStorage` and mint the ephemeral realtime token client-side. That
is acceptable for a tool only you use on your own device.

**For anything public**, put a minimal backend in front (Cloudflare Worker, Vercel
Function, Express endpoint). The backend holds the API key, calls
`POST /v1/realtime/client_secrets`, and returns only the `value` field to the
browser. See § 10 of `VCI.md`.

**Never commit an API key.** The `.gitignore` in this repo already excludes
`.env` and common key files.

---

## License

MIT — see [`LICENSE`](./LICENSE) if present, otherwise free to use, adapt, and
redistribute the spec.
