# VCI — Voice Controlled Interface

**A reusable framework spec for building apps where voice is the primary interface.**
Users tap a mic once and manage the entire app by talking. The screen is a read-only
reflection of state — no forms, no buttons for domain actions.

> 📖 **Read the full spec:** [`VCI.md`](./VCI.md)
> 🌐 **Live docs (styled):** deploy to Vercel (see below) or open [`index.html`](./index.html) locally.

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
