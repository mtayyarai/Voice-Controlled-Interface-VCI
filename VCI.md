# VCI — Voice Controlled Interface

**A reusable framework spec for building apps where voice is the primary
interface.** Users tap a mic once and manage the entire app by talking.
The screen is a read-only reflection of state — no forms, no buttons for
domain actions.

This document is designed to be handed to any coding agent (or human) to
add VCI capabilities to a new or existing app. It is domain-agnostic:
plug in your data model + actions and the pattern works the same.

---

## 1. Philosophy

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

---

## 2. When to use VCI

**Good fit**
- Personal tools with a bounded action vocabulary (to-do, notes, timers,
  expense capture, journaling, kanban, habit trackers, shopping lists).
- Solo users on a single device.
- Apps where every meaningful action is known ahead of time.

**Bad fit**
- Multi-user collaborative apps (needs a backend to broker state).
- Public production deployments without a token-minting backend.
- Apps requiring precise pointer selection, dragging, or dense forms.

---

## 3. Architecture

Real-time voice over WebRTC to OpenAI's Realtime API. STT, intent
parsing, and TTS happen in a single bidirectional streaming connection —
no separate `chat/completions` + `audio/speech` round-trips.

```
┌────────────┐   mic audio    ┌──────────────────────┐
│  Browser   │───────────────>│ OpenAI Realtime API  │
│            │<───────────────│ (gpt-realtime, WebRTC)│
│            │  assistant     └──────────┬───────────┘
│  ┌──────┐  │  audio                    │
│  │ UI   │  │                           │ function calls
│  │(read │  │                           │ (JSON on data
│  │ only)│  │                           │  channel)
│  └──────┘  │                           ▼
│  ┌──────┐  │                  executed locally
│  │Store │◄─┼──────────────────against storage
│  └──────┘  │
└────────────┘
```

---

## 4. Required modules

Every VCI app has these four modules. Names and language are flexible;
**contracts are not**.

### 4.1 `storage`
Persistence layer. Owns domain state.

- `readState()` → current domain state (typically an array of items).
- One mutation function per state-changing action (`add`, `remove`,
  `update`, `setStatus`, etc.). Each returns the mutated entity or `null`.
- Backend: `localStorage` (default), IndexedDB, or a remote API.

### 4.2 `ui`
DOM rendering. **No interactive controls for domain actions.**

- `renderState(state)` — repaint UI from state.
- `appendLog(userText, assistantText, kind)` — append a conversation entry
  so the user sees what was heard and what happened. `kind ∈ {info,
  success, error}`.
- `setStatus(status, label)` — see section 8 for statuses.
- `setMicListening(bool)` and `setMicEnabled(bool)`.
- `showKeyPanel(bool)` — one-time API key entry UI.

### 4.3 `realtime`
OpenAI Realtime session over WebRTC. See section 6 for the wire protocol
and section 7 for a full connection recipe.

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

### 4.4 `app`
Orchestration layer.

- Mic button wiring: click → connect / disconnect.
- Tool-call handler that dispatches to `storage` mutations, calls
  `ui.renderState`, and returns fresh state to the model.
- API-key entry flow (single `sk-` input, stored in `localStorage` for
  personal use; ephemeral-token backend for anything public — see § 10).

---

## 5. Adapting to a new domain

To turn a blank VCI shell into a working app, define these five things.

### 5.1 Data model

One canonical shape per entity. Give each a stable `id` (UUID). Example
for a "notes" domain:

```js
{
  id: string,          // crypto.randomUUID()
  title: string,
  body: string,
  createdAt: number
}
```

### 5.2 Storage mutations

One function per meaningful action. Keep them boring:

```js
addNote(title, body) → note
updateNote(id, fields) → note | null
deleteNote(id) → note | null
```

### 5.3 Tool schemas

One tool per action, using the Realtime API's **flat** function schema
(note: NOT nested under a `function:` key like Chat Completions).

```js
[
  {
    type: "function",
    name: "add_note",
    description: "Create a new note.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        body:  { type: "string" }
      },
      required: ["title"]
    }
  },
  {
    type: "function",
    name: "delete_note",
    description: "Delete a note by id from the current list.",
    parameters: {
      type: "object",
      properties: { note_id: { type: "string" } },
      required: ["note_id"]
    }
  }
  // one per domain action; ideally ≤ 8 total
]
```

If you find yourself with more than ~8 tools, you're conflating actions
or over-specifying. Merge or generalize.

### 5.4 Session instructions template

The session `instructions` string tells the model its role, tone,
matching rules, and current state. Fill in `<DOMAIN>`, `<verbs>`, and
inject the state snapshot.

```
You are a warm, natural voice assistant for a <DOMAIN> app.
Speak briefly and conversationally — never sound robotic.

When the user asks to <verbs>, call the matching tool.
After a tool call, briefly confirm what happened in one short sentence
(e.g. "Added buy milk." or "Deleted the dentist one.").
For small talk or unclear commands, respond briefly without calling a tool.

Rules for resolving references to existing items:
- Use the state below to match phrases like "the X one" or "the second Y".
- "The first/second/nth" refers to position in the list, 1-indexed.
- Match by loose semantic similarity, but only when unambiguous.
- If you cannot confidently match, say so briefly — never guess.
- After every tool call, the tool response includes the fresh state.
  Trust that as the current truth.

Current state:
<JSON dump of storage.readState()>
```

### 5.5 Tool handler

```js
async function handleToolCall(name, args) {
  switch (name) {
    case "add_note":
      const note = Storage.addNote(args.title, args.body);
      UI.renderState(Storage.readState());
      return { ok: true, action: "added", note, current_state: Storage.readState() };

    // ... one branch per tool
  }
  return { ok: false, reason: "unknown_tool" };
}
```

**Every response MUST include `current_state`** so the model sees the
fresh snapshot without another round trip.

---

## 6. OpenAI Realtime API — current wire protocol

As of 2026.

### 6.1 Endpoints

| Purpose               | Method + URL                                    |
|-----------------------|-------------------------------------------------|
| Mint ephemeral token  | `POST https://api.openai.com/v1/realtime/client_secrets` |
| WebRTC SDP exchange   | `POST https://api.openai.com/v1/realtime/calls?model=<model>` |

### 6.2 Model + voices

- **Model:** `gpt-realtime` (GA).
- **Voices:** `alloy`, `ash`, `ballad`, `cedar`, `coral`, `echo`, `marin`,
  `sage`, `shimmer`, `verse`.
- Recommended defaults: `marin` (warm, natural) or `coral` (friendly).

### 6.3 Token request

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
{ "value": "ek_...", "expires_at": 1234567890, "session": { ... } }
```

### 6.4 SDP exchange

```http
POST /v1/realtime/calls?model=gpt-realtime
Authorization: Bearer <ephemeralToken>
Content-Type: application/sdp

<raw SDP offer>
```

Returns raw SDP answer text (`Content-Type: application/sdp`).

### 6.5 `session.update` event (over data channel)

Send this the moment the data channel opens, and again after every state
mutation. **VCI uses manual turn detection** — the client explicitly
demarcates every user turn via `input_audio_buffer.clear` on Push-to-Talk
press and `input_audio_buffer.commit` on release.

```json
{
  "type": "session.update",
  "session": {
    "type": "realtime",
    "instructions": "<see § 5.4>",
    "tools": [ /* see § 5.3 */ ],
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

### 6.6 Function call round-trip

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

### 6.7 Useful events to listen for

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

---

## 7. WebRTC connection recipe (browser)

```js
// 1. Mint ephemeral token
const tokenRes = await fetch(
  "https://api.openai.com/v1/realtime/client_secrets",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + apiKey,
      "Content-Type":  "application/json"
    },
    body: JSON.stringify({
      session: {
        type: "realtime",
        model: MODEL,
        audio: { output: { voice: VOICE } }
      }
    })
  }
);
const { value: ephemeral } = await tokenRes.json();

// 2. Peer connection
const pc = new RTCPeerConnection();

// 3. Remote audio playback
const audioEl = document.getElementById("assistant-audio");
pc.ontrack = e => { audioEl.srcObject = e.streams[0]; };

// 4. Mic input
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
stream.getTracks().forEach(t => pc.addTrack(t, stream));

// 5. Data channel for JSON events
const dc = pc.createDataChannel("oai-events");
dc.onopen    = () => sendSessionUpdate(dc);
dc.onmessage = e  => handleEvent(JSON.parse(e.data));

// 6. SDP offer/answer
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

const answerSDP = await fetch(
  `https://api.openai.com/v1/realtime/calls?model=${encodeURIComponent(MODEL)}`,
  {
    method: "POST",
    body: offer.sdp,
    headers: {
      "Authorization": "Bearer " + ephemeral,
      "Content-Type":  "application/sdp"
    }
  }
).then(r => r.text());

await pc.setRemoteDescription({ type: "answer", sdp: answerSDP });
```

---

## 8. Session Lifecycle & Push-to-Talk (standard)

VCI apps use a **three-button session model** with an idle timeout. This
is the standard — implement it verbatim unless you have a specific
reason to deviate.

### 8.1 The three buttons

| Button              | Visible when       | Behavior                                            |
|---------------------|--------------------|-----------------------------------------------------|
| **Start Session**   | `disconnected`     | Opens the WebRTC connection to OpenAI. Mic starts muted. Assistant briefly greets. |
| **Push to Talk**    | `connected`        | Hold to talk (or press Space). On release, audio is committed and the model responds. |
| **End Session**     | `connected` / `connecting` | Explicitly closes the WebRTC connection. |

### 8.2 Session phases

| Phase           | Meaning                                                                  |
|-----------------|--------------------------------------------------------------------------|
| `disconnected`  | No WebRTC connection. Only Start Session is visible.                     |
| `connecting`    | Establishing WebRTC + minting ephemeral token.                            |
| `connected`     | Session live, mic muted, waiting for PTT press. Ptt + End Session visible. |

### 8.3 Status pill states

The status pill sits alongside the buttons and reflects the moment-to-moment
state of the assistant:

| Status      | Meaning                                              |
|-------------|------------------------------------------------------|
| `idle`      | No session, or session live but nothing happening.   |
| `listening` | User is holding PTT; mic is streaming.               |
| `thinking`  | Audio committed; model is processing / running a tool. |
| `speaking`  | Model is streaming its spoken response.              |
| `error`     | Something failed; details in log.                    |

### 8.4 Push-to-Talk interaction

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

### 8.5 Inactivity timeout (auto-close)

Sessions auto-close after **3 minutes** with no PTT activity.

- Start a `setTimeout` when the phase enters `connected`.
- Reset the timeout every time PTT is released (i.e. after a completed
  user turn).
- On timeout: call `endSession()`, log `"Session auto-closed after 3
  minutes of inactivity."` in the conversation log.
- Clear the timeout when the phase leaves `connected` (manual end or
  connection failure).

Rationale: the Realtime API bills per minute of active connection. An
abandoned session sitting connected can accrue meaningful cost. Three
minutes is a good default; expose it as a constant so apps can tune it.

---

## 9. UI requirements

- **State panel** — renders `storage.readState()`. Visually distinguish
  entity states (e.g. done vs open). No click handlers for domain actions.
- **Conversation log** — most recent at bottom, auto-scroll. Populated
  from transcription + assistant events.
- **Three session buttons** — Start Session, Push to Talk, End Session
  (see § 8.1). Visibility swaps based on the current phase; the PTT
  button pulses while recording.
- **PTT hint text** — a one-line label under the buttons: *"Hold Push to
  Talk (or Space) to speak. Session auto-closes after 3 minutes of
  silence."* Helps first-time users.
- **Status pill** — reflects § 8.3 states.
- **API-key panel** — shown on first load; hidden once a key is stored.
  Include a "reset key" link.
- **Hidden `<audio id="assistant-audio" autoplay playsinline>`** — the
  peer connection's remote audio track attaches here.

Accessibility:
- Give each button an `aria-label` matching its visible text.
- Space bar acts as PTT (skip when a text input has focus).
- Use `aria-live="polite"` on the status pill and log.
- The recording state must not rely on color alone — the label text
  ("Recording…" vs "Hold to Talk") and animation both change.

---

## 10. Security

- **Never commit the OpenAI API key.**
- **Personal single-user tools:** storing the API key in `localStorage`
  and minting the ephemeral token client-side is acceptable. Document
  this trade-off in the README.
- **Anything public:** put a minimal backend in front (Cloudflare Worker,
  Vercel Function, Express endpoint). The backend holds the API key,
  mints the ephemeral token via `POST /v1/realtime/client_secrets`, and
  returns only `value` to the browser. The browser never sees the real
  key.
- Bind an `OpenAI-Safety-Identifier` header on the server-side token
  request to attribute usage per end-user.

---

## 11. File layout convention

```
<app>/
  index.html
  css/styles.css
  js/
    app.js       orchestration + tool handler
    realtime.js  WebRTC + Realtime API + tool schemas
    storage.js   domain persistence + mutations
    ui.js        DOM rendering (read-only)
```

Keep each file ≤ ~300 lines. If `realtime.js` grows beyond that, domain
logic is leaking in — move it to `app.js`.

---

## 12. Implementation checklist for an AI coder

Hand this list to the coder alongside a description of the target
domain.

- [ ] Define the domain data model (single shape per entity, stable id).
- [ ] Build `storage.js`: `readState()` + one mutation per action.
- [ ] Build tool schemas (§ 5.3) — flat schema, ≤ 8 tools.
- [ ] Write session instructions (§ 5.4) with tone + matching rules +
      state placeholder.
- [ ] Build `realtime.js` per § 7. Use `gpt-realtime`, a natural voice,
      and **manual turn detection** (§ 6.5).
- [ ] Expose `startTurn()`, `endTurn()`, `interruptResponse()` from
      `realtime.js` for Push-to-Talk wiring.
- [ ] Implement the three-button session model per § 8.1: Start Session,
      Push to Talk (hold or Space), End Session.
- [ ] Implement the 3-minute inactivity auto-close per § 8.5.
- [ ] Build `app.js` tool handler per § 5.5 — always return
      `current_state`.
- [ ] Call `refreshContext()` after every mutation so future turns see
      updated state.
- [ ] Build `ui.js` with all elements from § 9.
- [ ] Add API-key entry with `sk-` validation and `localStorage`
      persistence. Add reset-key link.
- [ ] Include the `<audio id="assistant-audio">` element in the HTML.
- [ ] Handle mic permission denial + WebRTC/`getUserMedia`
      unsupported-browser paths.
- [ ] Handle 401 / 403 / 429 / network errors and surface them in the
      log without breaking the session lifecycle.
- [ ] Verify state persists across a page reload.
- [ ] Document the browser support caveat + security stance in the
      README.

---

## 13. Manual test script

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

---

## 14. Environment requirements

- Chrome or Edge on desktop (WebRTC + mic autoplay policy). Firefox and
  Safari are unofficial.
- Secure context: `http://localhost`, `file://`, or HTTPS.
- OpenAI API key with Realtime API access.
- Live internet connection during sessions.

---

## 15. Known limitations

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

---

## 16. Extension patterns

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
