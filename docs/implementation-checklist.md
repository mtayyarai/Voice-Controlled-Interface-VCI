---
id: implementation-checklist
title: Implementation checklist
sidebar_position: 14
description: A task list a coding agent can work through directly — from data model definition through error handling.
---

# Implementation checklist for an AI coder

Hand this list to the coder alongside a description of the target
domain.

- [ ] Define the domain data model (single shape per entity, stable id).
- [ ] Build `storage.js`: `readState()` + one mutation per action.
- [ ] Build tool schemas ([Adapting → Tool schemas](./adapting#3-tool-schemas))
      — flat schema, ≤ 8 tools.
- [ ] Write session instructions
      ([Adapting → Session instructions](./adapting#4-session-instructions-template))
      with tone + matching rules + state placeholder.
- [ ] Build `realtime.js` per the [WebRTC recipe](./webrtc-recipe).
      Use `gpt-realtime`, a natural voice, and **manual turn detection**
      ([wire protocol → session.update](./realtime-protocol#sessionupdate-event-over-data-channel)).
- [ ] Expose `startTurn()`, `endTurn()`, `interruptResponse()` from
      `realtime.js` for Push-to-Talk wiring.
- [ ] Implement the three-button session model per
      [Session lifecycle → the three buttons](./session-lifecycle#the-three-buttons):
      Start Session, Push to Talk (hold or Space), End Session.
- [ ] Implement the 3-minute inactivity auto-close per
      [Session lifecycle → Inactivity timeout](./session-lifecycle#inactivity-timeout-auto-close).
- [ ] Build `app.js` tool handler per
      [Adapting → Tool handler](./adapting#5-tool-handler) — always return
      `current_state`.
- [ ] Call `refreshContext()` after every mutation so future turns see
      updated state.
- [ ] Build `ui.js` with all elements from [UI requirements](./ui-requirements).
- [ ] Add API-key entry with `sk-` validation and `localStorage`
      persistence. Add reset-key link.
- [ ] Decide whether to include [MCP support](./mcp-support). If yes,
      follow [Wiring MCP tools](./mcp-support#wiring-mcp-tools).
- [ ] Include the `<audio id="assistant-audio">` element in the HTML.
- [ ] Handle mic permission denial + WebRTC/`getUserMedia`
      unsupported-browser paths.
- [ ] Handle 401 / 403 / 429 / network errors and surface them in the
      log without breaking the session lifecycle.
- [ ] Verify state persists across a page reload.
- [ ] Document the browser support caveat + security stance in the
      README.
