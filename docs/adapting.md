---
id: adapting
title: Adapting to your domain
sidebar_position: 6
description: Five things you define to turn a blank VCI shell into a working app — data model, mutations, tool schemas, session instructions, tool handler.
---

# Adapting to a new domain

To turn a blank VCI shell into a working app, define these five things.

## 1. Data model

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

## 2. Storage mutations

One function per meaningful action. Keep them boring:

```js
addNote(title, body) → note
updateNote(id, fields) → note | null
deleteNote(id) → note | null
```

## 3. Tool schemas

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

## 4. Session instructions template

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

## 5. Tool handler

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

:::tip current_state is mandatory
**Every response MUST include `current_state`** so the model sees the
fresh snapshot without another round trip.
:::
