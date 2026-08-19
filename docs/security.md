---
id: security
title: Security
sidebar_position: 12
description: Personal vs public deployment — when it's OK to store the API key in localStorage vs when you need a token-minting backend.
---

# Security

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
- **For MCP:** mint MCP tokens on the backend, too. Never ship long-lived
  OAuth tokens to the browser. See
  [MCP security & approvals](./mcp-support#mcp-security--approvals).

:::warning
The default guidance in this spec (API key in `localStorage`) is only
acceptable for a tool **you personally use on your own device**. Do not
ship a public URL that expects users to paste their own key unless you
also expect them to understand the risk.
:::
