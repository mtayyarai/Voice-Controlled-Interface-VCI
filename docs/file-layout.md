---
id: file-layout
title: File layout convention
sidebar_position: 13
description: Recommended module boundaries — index.html, css/styles.css, and four JS files. Keep each under ~300 lines.
---

# File layout convention

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
