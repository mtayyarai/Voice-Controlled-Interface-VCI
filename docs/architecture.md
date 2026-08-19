---
id: architecture
title: Architecture
sidebar_position: 4
description: Real-time voice over WebRTC to OpenAI's Realtime API — STT, intent parsing, and TTS happen in a single bidirectional streaming connection.
---

# Architecture

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
