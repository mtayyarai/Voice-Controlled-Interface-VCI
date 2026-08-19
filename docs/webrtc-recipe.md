---
id: webrtc-recipe
title: WebRTC connection recipe
sidebar_position: 8
description: Full browser-side WebRTC connection recipe — mint token, create peer connection, attach mic, open data channel, exchange SDP.
---

# WebRTC connection recipe (browser)

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
